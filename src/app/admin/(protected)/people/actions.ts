'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, getUser } from '@/lib/supabase/auth';
import { canAdminDelete } from '@/lib/account/guards';
import { deleteUserData } from '@/lib/account/delete';
import { canSetRole } from '@/lib/auth/role-rules';
import type { Role } from '@/lib/auth/roles';
import { env } from '@/lib/env';
import {
  inviteDecision,
  shellCardFromEmail,
  type InviteDecision,
  type InviteTarget,
} from '@/lib/staff/invite-rules';

type Result = { ok: true } | { error: string };

export async function setRole(formData: FormData): Promise<Result> {
  const actor = await requireRole(['admin'], '/admin/people');
  const id = String(formData.get('id') ?? '');
  const role = String(formData.get('role') ?? 'user');
  const stylistRaw = String(formData.get('stylist_id') ?? '');
  const stylist_id = stylistRaw === '' ? null : stylistRaw;
  if (!['user', 'staff', 'admin'].includes(role)) return { error: 'Rol inválido' };
  const sb = await createClient();
  const { data: target } = await sb.from('profiles').select('role').eq('id', id).single();
  if (!target) return { error: 'Usuario no encontrado' };
  if (!canSetRole(actor.role, target.role as Role, role as Role)) {
    return { error: 'No tienes permisos para realizar ese cambio.' };
  }
  const { error } = await sb
    .from('profiles')
    .update({ role: role as Role, stylist_id })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/people');
  return { ok: true };
}

export async function adminDeleteUser(formData: FormData): Promise<Result> {
  await requireRole(['admin'], '/admin/people');
  const admin = await getUser();
  const id = String(formData.get('id') ?? '');
  if (!admin || !id) return { error: 'Falta el usuario' };
  if (!canAdminDelete(admin.id, id))
    return { error: 'No puedes eliminar tu propia cuenta desde aquí.' };

  const sb = await createClient();
  const { data: target } = await sb.from('profiles').select('stylist_id').eq('id', id).single();

  const res = await deleteUserData(id);
  if (!res.ok) return { error: `Error al eliminar (${res.step}): ${res.message}` };

  if (target?.stylist_id) {
    const del = await sb.from('stylists').delete().eq('id', target.stylist_id);
    if (del.error) {
      await sb.from('stylists').update({ is_active: false }).eq('id', target.stylist_id);
    }
  }

  revalidatePath('/admin/people');
  revalidatePath('/admin/stylists');
  revalidatePath('/', 'layout');
  return { ok: true };
}

const inviteEmail = z.string().trim().toLowerCase().email('Ingresa un correo electrónico válido');

async function findInviteTarget(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<InviteTarget> {
  const { data: rows } = await admin
    .from('profiles')
    .select('id, role, stylist_id')
    .eq('email', email);
  for (const row of rows ?? []) {
    const { data } = await admin.auth.admin.getUserById(row.id);
    if (data?.user?.email?.toLowerCase() === email) return row as InviteTarget;
  }
  return null;
}

export async function inviteStaff(
  formData: FormData,
): Promise<{ ok: true; note?: string } | { error: string }> {
  const actor = await requireRole(['admin'], '/admin/people');
  const parsed = inviteEmail.safeParse(String(formData.get('email') ?? ''));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Ingresa un correo electrónico válido' };
  const email = parsed.data;

  const sb = await createClient();
  const admin = createAdminClient();

  const target = await findInviteTarget(admin, email);
  let decision: InviteDecision = inviteDecision(actor.role, target);
  if (decision.kind === 'already_staff')
    return { ok: true, note: 'Esa persona ya es parte del personal con tarjeta asignada.' };
  if (decision.kind === 'refuse') return { error: decision.reason };

  let profileId: string;
  let linkedStylistId: string | null;
  if (decision.kind === 'invite_new') {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
    });
    if (error || !data?.user) {
      const retry = await findInviteTarget(admin, email);
      if (!retry) return { error: error?.message ?? 'No se pudo enviar la invitación.' };
      decision = inviteDecision(actor.role, retry);
      if (decision.kind === 'already_staff')
        return { ok: true, note: 'Esa persona ya es parte del personal.' };
      if (decision.kind !== 'promote')
        return {
          error:
            decision.kind === 'refuse' ? decision.reason : 'No se pudo enviar la invitación.',
        };
      profileId = decision.profileId;
      linkedStylistId = decision.stylistId;
    } else {
      profileId = data.user.id;
      linkedStylistId = null;
    }
  } else {
    profileId = decision.profileId;
    linkedStylistId = decision.stylistId;
  }

  if (linkedStylistId === null) {
    const [{ data: slugRows }, { data: sortRows }] = await Promise.all([
      sb.from('stylists').select('slug'),
      sb.from('stylists').select('sort_order').order('sort_order', { ascending: false }).limit(1),
    ]);
    const shell = shellCardFromEmail(
      email,
      (slugRows ?? []).map((r) => r.slug),
      sortRows?.[0]?.sort_order ?? 0,
    );
    const { data: created, error: shellErr } = await sb
      .from('stylists')
      .insert(shell)
      .select('id')
      .single();
    if (shellErr || !created)
      return {
        error: `Error al crear tarjeta de especialista (${shellErr?.message ?? 'desconocido'}).`,
      };
    linkedStylistId = created.id;

    const { error: linkErr } = await sb
      .from('profiles')
      .update({ role: 'staff', stylist_id: linkedStylistId })
      .eq('id', profileId);
    if (linkErr) {
      await sb.from('stylists').delete().eq('id', linkedStylistId);
      return { error: `Error al vincular personal (${linkErr.message}).` };
    }
  } else {
    const { error: linkErr } = await sb
      .from('profiles')
      .update({ role: 'staff', stylist_id: linkedStylistId })
      .eq('id', profileId);
    if (linkErr) return { error: `Error al vincular personal (${linkErr.message}).` };
  }

  revalidatePath('/admin/people');
  revalidatePath('/admin/stylists');
  return {
    ok: true,
    note:
      decision.kind === 'invite_new'
        ? 'Correo de invitación enviado.'
        : 'La cuenta existente ahora tiene rol de empleado (staff).',
  };
}
