'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { clampStars, computeRemovedRating, computeUpdatedRating } from '@/lib/reviews';
import { getMyBookings, getBusinessHours } from '@/lib/queries';

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

export async function rescheduleMyBooking(
  bookingId: string,
  newStartsAt: string,
  newEndsAt: string,
): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from('bookings')
    .select('id,user_id,status,starts_at,stylist_id')
    .eq('id', bookingId)
    .single();
  if (!row) return { error: 'Cita no encontrada.' };

  const decision = canModifyBooking(row, user.id, Date.now());
  if (!decision.ok) return { error: 'Esta cita ya no puede reprogramarse.' };

  if (new Date(newStartsAt).getTime() <= Date.now()) {
    return { error: 'Elige un horario futuro.' };
  }

  if (row.stylist_id) {
    const { data: clash } = await admin
      .from('bookings')
      .select('id')
      .eq('stylist_id', row.stylist_id)
      .eq('status', 'confirmed')
      .neq('id', bookingId)
      .lt('starts_at', newEndsAt)
      .gt('ends_at', newStartsAt);
    if (clash && clash.length > 0) {
      return { error: 'Ese horario acaba de ocuparse — elige otro.' };
    }
  }

  const { error } = await admin
    .from('bookings')
    .update({ starts_at: newStartsAt, ends_at: newEndsAt })
    .eq('id', bookingId);
  if (error) return { error: error.message };

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

  const sb = await createClient();
  const { data: revRows } = await sb
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
