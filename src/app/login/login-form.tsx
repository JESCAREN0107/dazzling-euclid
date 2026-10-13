'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { signInWithGoogle, signInWithPassword } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordInput } from '@/components/auth/password-input';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flex: 'none' }} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.8 35.9 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function LoginForm({
  next,
  oauthError,
}: {
  next: string;
  oauthError?: string | null;
}) {
  const [state, action] = useActionState(signInWithPassword, undefined);
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup';

  return (
    <AuthShell back={{ href: '/', label: 'Volver al inicio' }}>
      <span className="eyebrow">Tu cuenta</span>
      <h1 className="h-section auth__title">
        Bienvenida <em>de nuevo</em>
      </h1>
      <p className="auth__lead">
        Tu cabina te espera — inicia sesión para gestionar tus citas o acceder al panel.
      </p>

      {oauthError && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{oauthError}</p>}

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button className="btn btn--google btn--lg" style={{ width: '100%' }} type="submit">
          <GoogleMark /> Continuar con Google
        </button>
      </form>

      <div className="divider">o inicia sesión con tu correo</div>

      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="citas@lumierespa.mx"
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        <p style={{ textAlign: 'right', margin: '-6px 0 14px', fontSize: 13 }}>
          <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </p>
        {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
        <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit">
          Iniciar sesión
        </button>
      </form>

      <p className="auth__alt">
        ¿Primera vez aquí? <Link href={signupHref}>Crear una cuenta →</Link>
      </p>
    </AuthShell>
  );
}
