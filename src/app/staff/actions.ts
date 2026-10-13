'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { canStaffSetStatus } from '@/lib/staff/action-rules';
import { parseCardInput } from '@/lib/staff/card-input';
import { toUtcInstant } from '@/lib/time';

type Result = { ok: true } | { error: string };
const PATH = '/staff';

export async function updateMyBookingStatus(
  bookingId: string,
  next: 'completed' | 'no_show' | 'cancelled',
): Promise<Result> {
  const profile = await requireRole(['staff', 'admin'], PATH);
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id, stylist_id, status')
    .eq('id', bookingId)
    .single();
  if (!row) return { error: 'Cita no encontrada.' };

  const check = canStaffSetStatus(row, profile, next);
  if (!check.ok) {
    return {
      error:
        check.reason === 'not_your_chair'
          ? 'Esa cita pertenece a otra especialista.'
          : 'Esta cita ya no puede actualizarse.',
    };
  }

  const { error } = await admin.from('bookings').update({ status: next }).eq('id', bookingId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}

function parseHm(v: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export async function blockMySlot(
  fd: FormData,
): Promise<
  { ok: true; row: { id: string; starts_at: string; ends_at: string; reason: string } } | { error: string }
> {
  const profile = await requireRole(['staff', 'admin'], PATH);
  if (!profile.stylistId) {
    return { error: 'Tu cuenta aún no está vinculada a un perfil de especialista.' };
  }
  const dateStr = String(fd.get('date') ?? '');
  const startHm = parseHm(String(fd.get('start') ?? ''));
  const endHm = parseHm(String(fd.get('end') ?? ''));
  const reason = String(fd.get('reason') ?? '').trim().slice(0, 120);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || startHm === null || endHm === null) {
    return { error: 'Elige una fecha y rango de horas válidos.' };
  }
  if (endHm <= startHm) return { error: 'La hora de fin debe ser posterior a la de inicio.' };

  const starts_at = toUtcInstant(dateStr, startHm);
  const ends_at = toUtcInstant(dateStr, endHm);

  const sb = await createClient();
  const { data, error } = await sb
    .from('blocked_slots')
    .insert({ stylist_id: profile.stylistId, starts_at, ends_at, reason })
    .select('id, starts_at, ends_at, reason')
    .single();
  if (error || !data) return { error: error?.message ?? 'No se pudo bloquear el horario.' };
  revalidatePath(PATH);
  return { ok: true, row: data };
}

export async function unblockMySlot(blockId: string): Promise<Result> {
  await requireRole(['staff', 'admin'], PATH);
  const sb = await createClient();
  const { error } = await sb.from('blocked_slots').delete().eq('id', blockId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}

export async function updateMyStylistCard(fd: FormData): Promise<Result> {
  const profile = await requireRole(['staff', 'admin'], PATH);
  if (!profile.stylistId) return { error: 'No tienes un perfil de especialista vinculado.' };

  const { role, tags } = parseCardInput(
    String(fd.get('role') ?? ''),
    String(fd.get('tags') ?? ''),
  );
  if (!role) return { error: 'Ingresa tu especialidad (ej. Cosmiatra Clínica).' };

  const sb = await createClient();
  const { error } = await sb
    .from('stylists')
    .update({ role, tags, is_active: true })
    .eq('id', profile.stylistId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  revalidatePath('/');
  return { ok: true };
}
