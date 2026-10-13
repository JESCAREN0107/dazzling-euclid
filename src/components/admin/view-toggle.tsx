'use client';
import type { ViewMode } from './use-view-mode';

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="aview-toggle" role="group" aria-label="Modo de vista">
      <button
        type="button"
        aria-pressed={mode === 'cards'}
        className={`aview-toggle__btn${mode === 'cards' ? ' is-active' : ''}`}
        onClick={() => onChange('cards')}
        title="Vista de tarjetas"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
          <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
          <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
          <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
        </svg>
        Tarjetas
      </button>
      <button
        type="button"
        aria-pressed={mode === 'rows'}
        className={`aview-toggle__btn${mode === 'rows' ? ' is-active' : ''}`}
        onClick={() => onChange('rows')}
        title="Vista de lista"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <line x1="2" y1="4" x2="14" y2="4" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="12" x2="14" y2="12" />
        </svg>
        Lista
      </button>
    </div>
  );
}
