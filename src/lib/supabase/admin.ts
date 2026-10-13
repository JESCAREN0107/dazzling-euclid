import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env, getServiceRoleKey } from '@/lib/env';

/**
 * Cliente administrativo de Supabase protegido con `server-only`.
 * NUNCA puede importarse en componentes cliente ('use client').
 * Si SUPABASE_SERVICE_ROLE_KEY está configurada, utiliza privilegios service_role;
 * si aún no se ha configurado en desarrollo, hace fallback seguro a la clave anon.
 */
export function createAdminClient() {
  const serviceKey = getServiceRoleKey();
  return createSupabaseClient(env.supabaseUrl, serviceKey ?? env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
