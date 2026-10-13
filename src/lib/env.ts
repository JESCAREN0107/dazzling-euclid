// Quita espacios y el BOM (\uFEFF) que algunos editores añaden al pegar valores en Vercel;
// con él la URL y las claves de Supabase dejan de ser válidas.
export function cleanEnv(value: string | undefined): string | undefined {
  const v = value?.replace(/^\uFEFF/, '').trim();
  return v ? v : undefined;
}

function required(name: string, value: string | undefined): string {
  value = cleanEnv(value);
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y configura las credenciales de tu proyecto Supabase.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    );
  },
  get supabaseAnonKey() {
    return required(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
    );
  },
  get siteUrl() {
    const raw = cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://dazzling-euclid.vercel.app');
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return withProto.replace(/\/$/, '');
  },
};

export function getServiceRoleKey(): string | null {
  if (typeof window !== 'undefined') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY es estrictamente privada y solo puede leerse en el servidor.');
  }
  return cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ?? null;
}
