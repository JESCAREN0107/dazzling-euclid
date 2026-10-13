'use client';
import { useActionState } from 'react';
import { updateMyStylistCard } from './actions';

export type MyCardData = {
  name: string;
  role: string;
  tags: string[];
  is_active: boolean;
};

export function MyCardEditor({
  card,
  needsSetup,
}: {
  card: MyCardData;
  needsSetup: boolean;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => updateMyStylistCard(fd),
    undefined as undefined | { ok: true } | { error: string },
  );

  const justSaved = state && 'ok' in state;
  const openByDefault = needsSetup && !justSaved;

  return (
    <details
      className="card"
      open={openByDefault}
      style={{
        padding: 20,
        marginBottom: 24,
        borderColor: openByDefault ? 'var(--accent)' : undefined,
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          listStyle: 'none',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: openByDefault ? 'var(--accent-text)' : 'var(--muted)',
            }}
          >
            {openByDefault ? 'Completa tu tarjeta pública' : 'Tu tarjeta pública de especialista'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>
            {card.name}
            {card.role ? (
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {card.role}</span>
            ) : null}
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {card.is_active || justSaved ? 'Visible en el sitio · Editar' : 'Oculta hasta guardar'}
        </span>
      </summary>

      <form
        action={action}
        style={{ marginTop: 16, display: 'grid', gap: 12 }}
      >
        <p className="step__hint" style={{ margin: 0 }}>
          Tu nombre y foto provienen de tu perfil (haz clic en tu avatar arriba a la derecha para
          cambiarlos). Configura tu especialidad y etiquetas aquí para publicar tu tarjeta en la
          sección de Especialistas.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="mc-role">Especialidad / Cargo</label>
            <input
              id="mc-role"
              name="role"
              defaultValue={card.role}
              placeholder="Ej. Cosmiatra & Especialista Facial"
              maxLength={80}
              required
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="mc-tags">Especialidades (separadas por coma)</label>
            <input
              id="mc-tags"
              name="tags"
              defaultValue={card.tags.join(', ')}
              placeholder="Hidrodermoabrasión, Dermaplaning, Radiofrecuencia"
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn--primary" type="submit" disabled={pending}>
            {pending
              ? 'Guardando…'
              : card.is_active
                ? 'Guardar tarjeta'
                : 'Guardar y mostrar en el sitio'}
          </button>
          {state && 'error' in state && <span className="astatus astatus--err">{state.error}</span>}
          {justSaved && (
            <span className="astatus astatus--ok">Guardado — tu tarjeta ya está visible.</span>
          )}
        </div>
      </form>
    </details>
  );
}
