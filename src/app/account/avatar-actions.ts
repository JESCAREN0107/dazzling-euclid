'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { mxPhone } from '@/lib/validators';
import { syncProfileToStylist } from '@/lib/identity/sync';
import { getAvatarInfo } from '@/lib/avatar';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};
const ALLOWED = Object.keys(EXT_BY_TYPE);
const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = 'avatars';

type Result = { url: string } | { error: string };

async function syncAvatarForUser(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: prof } = await admin
      .from('profiles')
      .select('stylist_id, email, full_name')
      .eq('id', userId)
      .single();
    if (!prof?.stylist_id) return;
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const meta = authUser?.user?.user_metadata ?? {};
    const seed = prof.email ?? prof.full_name ?? 'staff';
    const resolved = getAvatarInfo(meta, seed).src;
    await syncProfileToStylist(prof.stylist_id, { avatarUrl: resolved });
  } catch (err) {
    console.error('[identity] avatar sync skipped:', err);
  }
}

export async function uploadAvatar(formData: FormData): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0)
    return { error: 'No seleccionaste ningún archivo' };
  if (!ALLOWED.includes(file.type))
    return { error: 'Usa una imagen JPG, PNG, WEBP, AVIF o GIF' };
  if (file.size > MAX_BYTES) return { error: 'La imagen debe pesar menos de 5 MB' };

  const ext = EXT_BY_TYPE[file.type];
  const path = `${user.id}/avatar.${ext}`;

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) return { error: upErr.message };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const sb = await createClient();
  const { error: metaErr } = await sb.auth.updateUser({
    data: {
      avatar_url: url,
      custom_avatar_url: url,
      avatar_choice: 'custom',
    },
  });
  if (metaErr) return { error: metaErr.message };

  await syncAvatarForUser(user.id);

  revalidatePath('/', 'layout');
  return { url };
}

export async function removeAvatar(): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({
    data: {
      custom_avatar_url: null,
      avatar_choice: 'dicebear',
      avatar_url: null,
    },
  });
  if (error) return { error: error.message };

  await syncAvatarForUser(user.id);

  revalidatePath('/', 'layout');
  return { url: '' };
}

export async function updateAvatarChoice(
  choice: 'custom' | 'dicebear' | 'email',
): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };
  const sb = await createClient();

  const meta = user.user_metadata || {};
  let avatarUrl: string | null = null;
  if (choice === 'custom') {
    avatarUrl = meta.custom_avatar_url || meta.avatar_url;
  } else if (choice === 'email') {
    avatarUrl = meta.picture || meta.email_avatar_url;
  }

  const { error } = await sb.auth.updateUser({
    data: {
      avatar_choice: choice,
      avatar_url: avatarUrl,
    },
  });
  if (error) return { error: error.message };

  await syncAvatarForUser(user.id);

  revalidatePath('/', 'layout');
  return { url: avatarUrl || '' };
}

export async function updateProfileDetails(fullName: string, phone: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };
  const name = fullName.trim().slice(0, 120);

  let phoneValue: string | null = null;
  if (phone.trim() !== '') {
    const parsed = mxPhone.safeParse(phone);
    if (!parsed.success)
      return { error: parsed.error.issues[0]?.message ?? 'Ingresa un teléfono válido' };
    phoneValue = parsed.data;
  }

  const sb = await createClient();
  const { error } = await sb
    .from('profiles')
    .update({ full_name: name, phone: phoneValue })
    .eq('id', user.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from('profiles')
    .select('stylist_id')
    .eq('id', user.id)
    .single();
  if (prof?.stylist_id) await syncProfileToStylist(prof.stylist_id, { name });

  revalidatePath('/', 'layout');
  return { url: '' };
}
