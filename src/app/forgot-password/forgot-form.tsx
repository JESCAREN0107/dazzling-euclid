'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';

export function ForgotForm({ expiredNotice }: { expiredNotice?: string | null }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state && 'ok' in state) {
    return (
      <AuthShell back={{ href: '/login', label: 'Volver a iniciar sesión' }}>
        <span className="eyebrow">Revisa tu correo</span>
        <h1 className="h-section auth__title">
          Enlace <em>enviado</em>
        </h1>
        <p className="auth__lead">
          Si existe una cuenta asociada a <b>{state.email}</b>, te hemos enviado un enlace para
          restablecer tu contraseña. Revisa tu bandeja de spam si no aparece en unos minutos.
        </p>
        <p className="auth__alt" style={{ textAlign: 'left' }}>
          <Link href="/login">← Volver a iniciar sesión</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell back={{ href: '/login', label: 'Volver a iniciar sesión' }}>
      <span className="eyebrow">Recuperar acceso</span>
      <h1 className="h-section auth__title">
        ¿Olvidaste tu <em>contraseña?</em>
      </h1>
      <p className="auth__lead">
        Ingresa tu correo electrónico y te enviaremos un enlace seguro para configurar una nueva.
      </p>

      {expiredNotice && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{expiredNotice}</p>}

      <form action={action}>
        <div className="field">
          <label htmlFor="fp-email">Correo electrónico</label>
          <input
            id="fp-email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />
        </div>
        {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
        <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit">
          Enviar enlace de recuperación
        </button>
      </form>

      <p className="auth__alt">
        ¿Ya la recordaste? <Link href="/login">Iniciar sesión →</Link>
      </p>
    </AuthShell>
  );
}
