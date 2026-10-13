'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/auth';

export async function signIn(_prev: unknown, formData: FormData): Promise<{ error: string }> {
  const sb = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  const profile = await getProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    await sb.auth.signOut();
    return { error: 'Esta cuenta no tiene acceso al panel administrativo.' };
  }
  redirect(next.startsWith('/') ? next : '/admin');
}

export async function signOut(): Promise<void> {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect('/');
}

export async function setBookingStatus(id: string, status: string): Promise<void> {
  const profile = await getProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) return;
  if (!['confirmed', 'completed', 'cancelled', 'no_show'].includes(status)) return;
  const sb = await createClient();
  await sb.from('bookings').update({ status }).eq('id', id);
  revalidatePath('/admin');
}
