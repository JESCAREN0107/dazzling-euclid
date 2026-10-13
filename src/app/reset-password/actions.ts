'use server';
import { createClient } from '@/lib/supabase/server';
import { checkPassword } from '@/lib/auth/password';

export type UpdatePasswordState = { ok: true } | { error: string } | undefined;

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (!checkPassword(password).passed)
    return { error: 'La contraseña no cumple con los requisitos de seguridad.' };
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' };

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: 'Tu sesión expiró — solicita un nuevo enlace de recuperación.' };

  const { error } = await sb.auth.updateUser({ password, data: { has_password: true } });
  if (error) return { error: error.message };
  return { ok: true };
}
