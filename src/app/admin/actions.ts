'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/auth';
import { canStaffSetStatus } from '@/lib/staff/action-rules';

export async function signOut(): Promise<void> {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect('/');
}

export async function setBookingStatus(id: string, status: string): Promise<void> {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) return;
  const sb = await createClient();
  const { data: row } = await sb
    .from('bookings')
    .select('id, stylist_id, status')
    .eq('id', id)
    .maybeSingle();
  if (!row || !canStaffSetStatus(row, profile, status).ok) return;
  await sb.from('bookings').update({ status }).eq('id', id);
  revalidatePath('/admin');
}
