import { LoginForm } from './login-form';
import { safeNext } from '@/lib/auth/redirect';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const oauthError =
    sp.error === 'oauth'
      ? 'El inicio de sesión con Google falló. Por favor inténtalo de nuevo.'
      : null;
  return (
    <main>
      <LoginForm next={next} oauthError={oauthError} />
    </main>
  );
}
