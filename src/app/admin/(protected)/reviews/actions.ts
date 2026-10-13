'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { computeRemovedRating } from '@/lib/reviews';

type Result = { ok: true } | { error: string };
const PATH = '/admin/reviews';

export async function deleteReview(id: string): Promise<Result> {
  await requireRole(['admin'], PATH);
  const admin = createAdminClient();

  const { data: review } = await admin
    .from('stylist_reviews')
    .select('stylist_id, rating')
    .eq('id', id)
    .single();

  const { error } = await admin.from('stylist_reviews').delete().eq('id', id);
  if (error) return { error: error.message };

  if (review) {
    const { data: stylist } = await admin
      .from('stylists')
      .select('rating, rating_count')
      .eq('id', review.stylist_id)
      .single();
    if (stylist) {
      const next = computeRemovedRating(
        {
          rating: stylist.rating != null ? Number(stylist.rating) : null,
          rating_count: stylist.rating_count,
        },
        review.rating,
      );
      await admin
        .from('stylists')
        .update({ rating: next.rating, rating_count: next.rating_count })
        .eq('id', review.stylist_id);
    }
  }

  revalidatePath(PATH);
  return { ok: true };
}
