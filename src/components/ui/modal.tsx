'use client';
import { useEffect, type ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflowY = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflowY = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pm__overlay" onMouseDown={onClose}>
      <div
        className={`pm${wide ? ' pm--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="pm__x" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>
        <h2 className="pm__title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
