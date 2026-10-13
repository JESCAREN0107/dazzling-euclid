'use server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { isDeleteConfirmed } from '@/lib/account/guards';
import { deleteUserData } from '@/lib/account/delete';

export async function deleteMyAccount(
  confirmation: string,
): Promise<{ ok: true } | { error: string }> {
  if (!isDeleteConfirmed(confirmation)) {
    return { error: 'Escribe DELETE o ELIMINAR para confirmar.' };
  }
  const user = await getUser();
  if (!user) return { error: 'Por favor inicia sesión.' };

  const res = await deleteUserData(user.id);
  if (!res.ok) {
    return { error: `Error al eliminar (${res.step}): ${res.message}` };
  }

  const sb = await createClient();
  await sb.auth.signOut();
  return { ok: true };
}
