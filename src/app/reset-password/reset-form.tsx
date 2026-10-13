'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updatePassword } from './actions';
import { checkPassword } from '@/lib/auth/password';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordInput } from '@/components/auth/password-input';

export function ResetForm({ email }: { email: string }) {
  const [state, action] = useActionState(updatePassword, undefined);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const check = checkPassword(pw);
  const barColor =
    check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirm.length > 0 && pw === confirm;

  if (state && 'ok' in state) {
    return (
      <AuthShell back={{ href: '/', label: 'Volver al inicio' }}>
        <span className="eyebrow">Listo</span>
        <h1 className="h-section auth__title">
          Contraseña <em>actualizada</em>
        </h1>
        <p className="auth__lead">Tu sesión está activa y tu nueva contraseña ha quedado guardada.</p>
        <p className="auth__alt" style={{ textAlign: 'left' }}>
          <Link href="/">← Volver al inicio</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell back={{ href: '/', label: 'Volver al inicio' }}>
      <span className="eyebrow">Restablecer contraseña</span>
      <h1 className="h-section auth__title">
        Elige una nueva <em>contraseña</em>
      </h1>
      {email && (
        <p className="auth__lead">
          para <b>{email}</b>
        </p>
      )}

      <form action={action}>
        <div className="field">
          <label htmlFor="rp-pw">Nueva contraseña</label>
          <PasswordInput
            id="rp-pw"
            name="password"
            required
            value={pw}
            onChange={setPw}
            autoComplete="new-password"
          />
          <div className={`pwmeta${pw ? ' show' : ''}`}>
            <div>
              <div className="meter">
                <i style={{ width: `${(check.score / 5) * 100}%`, background: barColor }} />
              </div>
              <ul className="reqs">
                {check.results.map((r) => (
                  <li key={r.id} className={r.met ? 'met' : ''}>
                    <span className="dot">{r.met ? '✓' : ''}</span> {r.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="rp-cf">Confirmar contraseña</label>
          <PasswordInput
            id="rp-cf"
            name="confirm"
            required
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          {confirm.length > 0 && (
            <p className={`match ${matches ? 'ok' : 'bad'}`}>
              {matches ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
            </p>
          )}
        </div>

        {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
        <button
          className="btn btn--primary btn--lg"
          style={{ width: '100%' }}
          type="submit"
          disabled={!check.passed || !matches}
        >
          Guardar nueva contraseña
        </button>
      </form>
    </AuthShell>
  );
}
