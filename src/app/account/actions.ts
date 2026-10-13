'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { clampStars, computeRemovedRating, computeUpdatedRating } from '@/lib/reviews';
import { getMyBookings, getBusinessHours } from '@/lib/queries';
import { computeAvailability } from '@/lib/booking/day-availability';
import { SPA_TZ, toUtcInstant } from '@/lib/time';

type Result = { ok: true } | { error: string };

export async function cancelMyBooking(bookingId: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id,user_id,status,starts_at')
    .eq('id', bookingId)
    .single();
  if (!row) return { error: 'Cita no encontrada.' };

  const decision = canModifyBooking(row, user.id, Date.now());
  if (!decision.ok) return { error: 'Esta cita ya no puede cancelarse.' };

  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  if (error) return { error: error.message };

  revalidatePath('/');
  return { ok: true };
}

type ReschedulableRow = {
  id: string;
  user_id: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
  stylist_id: string | null;
  service_id: string;
  service_ids: string[] | null;
};

async function loadOwnBooking(
  bookingId: string,
  userId: string,
): Promise<ReschedulableRow | null> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id,user_id,status,starts_at,ends_at,stylist_id,service_id,service_ids')
    .eq('id', bookingId)
    .single();
  if (!row || !canModifyBooking(row, userId, Date.now()).ok) return null;
  return row as ReschedulableRow;
}

// Horarios válidos para mover una cita: conserva su duración original y no
// cuenta su propio intervalo actual como ocupado.
async function rescheduleSlots(row: ReschedulableRow, date: string): Promise<string[]> {
  const serviceIds =
    row.service_ids && row.service_ids.length > 0 ? row.service_ids : [row.service_id];
  const { slots } = await computeAvailability(
    { serviceIds, stylistId: row.stylist_id, date },
    { durationMin: bookingDurationMin(row), ignore: row },
  );
  return slots;
}

function bookingDurationMin(row: { starts_at: string; ends_at: string }): number {
  return Math.round((new Date(row.ends_at).getTime() - new Date(row.starts_at).getTime()) / 60000);
}

export async function getRescheduleSlots(
  bookingId: string,
  date: string,
): Promise<{ slots: string[] }> {
  const user = await getUser();
  if (!user || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { slots: [] };
  const row = await loadOwnBooking(bookingId, user.id);
  if (!row) return { slots: [] };
  return { slots: await rescheduleSlots(row, date) };
}

export async function rescheduleMyBooking(
  bookingId: string,
  date: string,
  time: string,
): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { error: 'Elige una fecha y horario válidos.' };
  }

  const row = await loadOwnBooking(bookingId, user.id);
  if (!row) return { error: 'Esta cita ya no puede reprogramarse.' };

  if (!(await rescheduleSlots(row, date)).includes(time)) {
    return { error: 'Ese horario ya no está disponible — elige otro.' };
  }

  const [h, m] = time.split(':').map(Number);
  const startMinute = h! * 60 + m!;
  const newStartsAt = toUtcInstant(date, startMinute, SPA_TZ);
  const newEndsAt = toUtcInstant(date, startMinute + bookingDurationMin(row), SPA_TZ);

  const admin = createAdminClient();
  const { error } = await admin
    .from('bookings')
    .update({ starts_at: newStartsAt, ends_at: newEndsAt })
    .eq('id', bookingId);
  if (error) {
    if (error.code === '23P01') return { error: 'Ese horario acaba de ocuparse — elige otro.' };
    return { error: error.message };
  }

  revalidatePath('/');
  return { ok: true };
}

export async function submitMyReview(
  bookingId: string,
  rating: number,
  comment: string,
): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const admin = createAdminClient();
  const { data: b } = await admin
    .from('bookings')
    .select('id, user_id, status, stylist_id, customer_name')
    .eq('id', bookingId)
    .single();
  if (!b || b.user_id !== user.id) return { error: 'Cita no encontrada.' };
  if (b.status !== 'completed') return { error: 'Solo puedes calificar visitas completadas.' };
  if (!b.stylist_id) return { error: 'Esta cita no tiene una especialista asignada.' };

  const stars = clampStars(rating);
  const text = comment.trim().slice(0, 400);

  const { data: existing } = await admin
    .from('stylist_reviews')
    .select('id, rating')
    .eq('booking_id', bookingId)
    .maybeSingle();

  const { data: stylist } = await admin
    .from('stylists')
    .select('rating, rating_count')
    .eq('id', b.stylist_id)
    .single();
  const cur = {
    rating: stylist?.rating != null ? Number(stylist.rating) : null,
    rating_count: stylist?.rating_count ?? 0,
  };

  if (existing) {
    const { error } = await admin
      .from('stylist_reviews')
      .update({ rating: stars, comment: text })
      .eq('id', existing.id);
    if (error) return { error: error.message };

    const afterRemove = computeRemovedRating(cur, existing.rating);
    const next = computeUpdatedRating(afterRemove, stars);
    await admin
      .from('stylists')
      .update({ rating: next.rating, rating_count: next.rating_count })
      .eq('id', b.stylist_id);
  } else {
    const { error } = await admin.from('stylist_reviews').insert({
      stylist_id: b.stylist_id,
      user_id: user.id,
      booking_id: bookingId,
      customer_name: b.customer_name || 'Clienta',
      rating: stars,
      comment: text,
    });
    if (error) return { error: error.message };

    const next = computeUpdatedRating(cur, stars);
    await admin
      .from('stylists')
      .update({ rating: next.rating, rating_count: next.rating_count })
      .eq('id', b.stylist_id);
  }

  revalidatePath('/');
  return { ok: true };
}

export async function deleteMyReview(bookingId: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('stylist_reviews')
    .select('id, stylist_id, rating, user_id')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (!existing || existing.user_id !== user.id) return { error: 'Reseña no encontrada.' };

  const { error } = await admin.from('stylist_reviews').delete().eq('id', existing.id);
  if (error) return { error: error.message };

  const { data: stylist } = await admin
    .from('stylists')
    .select('rating, rating_count')
    .eq('id', existing.stylist_id)
    .single();
  if (stylist) {
    const next = computeRemovedRating(
      {
        rating: stylist.rating != null ? Number(stylist.rating) : null,
        rating_count: stylist.rating_count,
      },
      existing.rating,
    );
    await admin
      .from('stylists')
      .update({ rating: next.rating, rating_count: next.rating_count })
      .eq('id', existing.stylist_id);
  }

  revalidatePath('/');
  return { ok: true };
}

export type MyBookingsData = {
  bookings: Awaited<ReturnType<typeof getMyBookings>>;
  hours: Awaited<ReturnType<typeof getBusinessHours>>;
  reviews: Record<string, { rating: number; comment: string }>;
};

export async function listMyBookings(): Promise<MyBookingsData> {
  const user = await getUser();
  if (!user) return { bookings: [], hours: [], reviews: {} };
  const [bookings, hours] = await Promise.all([
    getMyBookings(user.id, user.email ?? null),
    getBusinessHours(),
  ]);

  // user_id no es legible por la API pública (0003); se consulta con service_role.
  const admin = createAdminClient();
  const { data: revRows } = await admin
    .from('stylist_reviews')
    .select('booking_id, rating, comment')
    .eq('user_id', user.id)
    .not('booking_id', 'is', null);
  const reviews: Record<string, { rating: number; comment: string }> = {};
  for (const r of (revRows ?? []) as { booking_id: string; rating: number; comment: string }[]) {
    reviews[r.booking_id] = { rating: r.rating, comment: r.comment };
  }
  return { bookings, hours, reviews };
}
