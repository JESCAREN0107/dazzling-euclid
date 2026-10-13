function required(name: string, value: string | undefined): string {
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
    return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  },
};

export function getServiceRoleKey(): string | null {
  if (typeof window !== 'undefined') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY es estrictamente privada y solo puede leerse en el servidor.');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key ? key : null;
}
