'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};
const ALLOWED = Object.keys(EXT_BY_TYPE);
const MAX_BYTES = 5 * 1024 * 1024;

type UploadResult = { url: string } | { error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireRole(['admin'], '/admin');
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'No seleccionaste ningún archivo' };
  if (!ALLOWED.includes(file.type)) return { error: 'Usa una imagen JPG, PNG, WEBP, AVIF o GIF' };
  if (file.size > MAX_BYTES) return { error: 'La imagen debe pesar menos de 5 MB' };

  const ext = EXT_BY_TYPE[file.type];
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const sb = createAdminClient();
  const { error } = await sb.storage.from('media').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl };
}
