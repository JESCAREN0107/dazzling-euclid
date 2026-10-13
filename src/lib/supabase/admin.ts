import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env, getServiceRoleKey } from '@/lib/env';

/**
 * Cliente administrativo de Supabase protegido con `server-only`.
 * NUNCA puede importarse en componentes cliente ('use client').
 * Si SUPABASE_SERVICE_ROLE_KEY está configurada, utiliza privilegios service_role;
 * si aún no se ha configurado en desarrollo, hace fallback a la clave anon (RLS
 * bloqueará las operaciones privilegiadas). En producción la clave es obligatoria.
 */
export function createAdminClient() {
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.');
    }
    console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY no configurada: usando clave anon.');
  }
  return createSupabaseClient(env.supabaseUrl, serviceKey ?? env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
