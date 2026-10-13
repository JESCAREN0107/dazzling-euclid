'use server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export type ForgotState = { ok: true; email: string } | { error: string } | undefined;

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@'))
    return { error: 'Ingresa el correo electrónico con el que te registraste.' };
  const sb = await createClient();
  const redirectTo = `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`;
  await sb.auth.resetPasswordForEmail(email, { redirectTo });
  return { ok: true, email };
}
