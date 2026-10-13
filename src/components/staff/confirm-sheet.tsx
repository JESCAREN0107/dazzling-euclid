'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

export function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  tone = 'default',
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="sd-sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div className="sd-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sd-sheet-grab" aria-hidden />
        <div className="sd-sheet-head">
          <h3 className="sd-sheet-title">{title}</h3>
          <button
            type="button"
            className="bmodal-close"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        {description && <p className="sd-sheet-desc">{description}</p>}
        <div className="sd-sheet-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={pending}
          >
            Conservar
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Guardando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
