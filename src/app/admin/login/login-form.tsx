'use client';
import { useActionState } from 'react';
import { signIn } from '../actions';

export function LoginForm({ next, forbidden }: { next: string; forbidden: boolean }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <div className="container" style={{ maxWidth: 440, padding: '120px 24px' }}>
      <span className="eyebrow">Panel Lumière</span>
      <h1 className="h-section" style={{ marginBottom: 8 }}>
        Acceso <em>administrativo</em>
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>
        Agenda, tratamientos y especialistas.
      </p>
      {forbidden && (
        <p style={{ color: 'var(--error)', marginBottom: 16 }}>
          Tu cuenta no tiene permisos para acceder a esa página.
        </p>
      )}
      <form action={action} className="card">
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label htmlFor="admin-email">Correo electrónico</label>
          <input id="admin-email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" name="password" type="password" required />
        </div>
        {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
        <button className="btn btn--primary" type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
