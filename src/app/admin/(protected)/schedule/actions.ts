'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { canStaffReschedule, canStaffSetStatus } from '@/lib/staff/action-rules';
import { toUtcInstant } from '@/lib/time';

type Result = { ok: true } | { error: string };
const PATH = '/admin/schedule';

export async function adminSetBookingStatus(
  bookingId: string,
  next: 'confirmed' | 'completed' | 'no_show' | 'cancelled',
): Promise<Result> {
  const profile = await requireRole(['admin'], PATH);
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id, stylist_id, status')
    .eq('id', bookingId)
    .single();
  if (!row) return { error: 'Cita no encontrada.' };

  const check = canStaffSetStatus(row, profile, next);
  if (!check.ok) return { error: 'Esta cita no puede cambiar a ese estado.' };

  const { error } = await admin.from('bookings').update({ status: next }).eq('id', bookingId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  revalidatePath('/admin');
  return { ok: true };
}

export async function adminDeleteBooking(bookingId: string): Promise<Result> {
  await requireRole(['admin'], PATH);
  if (!bookingId) return { error: 'Falta el identificador de la cita.' };
  const admin = createAdminClient();
  const { error } = await admin.from('bookings').delete().eq('id', bookingId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  revalidatePath('/admin');
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

export async function adminRescheduleBooking(
  bookingId: string,
  fd: FormData,
): Promise<{ ok: true; starts_at: string; ends_at: string } | { error: string }> {
  const profile = await requireRole(['admin'], PATH);
  const dateStr = String(fd.get('date') ?? '');
  const startHm = parseHm(String(fd.get('start') ?? ''));
  const endHm = parseHm(String(fd.get('end') ?? ''));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || startHm === null || endHm === null) {
    return { error: 'Elige una fecha y rango de horas válidos.' };
  }
  if (endHm <= startHm) return { error: 'La hora de fin debe ser posterior a la de inicio.' };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id, stylist_id, status')
    .eq('id', bookingId)
    .single();
  if (!row) return { error: 'Cita no encontrada.' };

  const check = canStaffReschedule(row, profile);
  if (!check.ok) return { error: 'Solo se pueden reprogramar citas confirmadas.' };

  const starts_at = toUtcInstant(dateStr, startHm);
  const ends_at = toUtcInstant(dateStr, endHm);

  const { error } = await admin
    .from('bookings')
    .update({ starts_at, ends_at })
    .eq('id', bookingId);
  if (error) {
    if (error.code === '23P01') return { error: 'Ese horario se empalma con otra cita activa.' };
    return { error: error.message };
  }
  revalidatePath(PATH);
  revalidatePath('/admin');
  return { ok: true, starts_at, ends_at };
}

export async function adminBlockSlot(
  stylistId: string,
  fd: FormData,
): Promise<
  { ok: true; row: { id: string; starts_at: string; ends_at: string; reason: string } } | { error: string }
> {
  await requireRole(['admin'], PATH);
  if (!stylistId) return { error: 'Selecciona primero a una especialista.' };

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
    .insert({ stylist_id: stylistId, starts_at, ends_at, reason })
    .select('id, starts_at, ends_at, reason')
    .single();
  if (error || !data) return { error: error?.message ?? 'No se pudo bloquear el horario.' };
  revalidatePath(PATH);
  return { ok: true, row: data };
}

export async function adminUnblockSlot(blockId: string): Promise<Result> {
  await requireRole(['admin'], PATH);
  const sb = await createClient();
  const { error } = await sb.from('blocked_slots').delete().eq('id', blockId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}
