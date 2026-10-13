'use client';

import type { Service, ServiceCategory } from '@/lib/supabase/types';
import { CATEGORY_LABELS, money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';

function ServiceMedia({ service }: { service: Service }) {
  const photo = servicePhoto(service);
  if (photo.type === 'img') {
    return (
      <div className="choice__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          data-fb={photo.fallbackSrc ?? ''}
          alt={service.name}
          loading="lazy"
          onError={(e) => {
            const el = e.currentTarget;
            const fb =
              el.dataset.fb ||
              'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85';
            if (!el.dataset.fallback && el.src !== fb) {
              el.dataset.fallback = '1';
              el.src = fb;
            }
          }}
        />
      </div>
    );
  }
  return null;
}

const CATEGORIES: ServiceCategory[] = [
  'limpieza',
  'hidratacion',
  'antiedad',
  'acne',
  'paquetes',
];

export function StepService({
  services,
  selectedIds,
  onToggle,
  onContinue,
}: {
  services: Service[];
  selectedIds: string[];
  onToggle: (s: Service) => void;
  onContinue: () => void;
}) {
  const selected = services.filter((s) => selectedIds.includes(s.id));
  const totalPrice = selected.reduce((sum, s) => sum + s.price_mxn, 0);
  const totalMin = selected.reduce((sum, s) => sum + s.duration_min, 0);

  return (
    <div className="step">
      <h2 className="step__title">1. Elige tu tratamiento facial</h2>
      <p className="step__hint">
        Selecciona uno o varios tratamientos para tu visita. El sistema calculará la duración total
        y el precio en MXN automáticamente.
      </p>

      {CATEGORIES.map((cat) => {
        const group = services.filter((s) => s.category === cat);
        if (group.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              {CATEGORY_LABELS[cat]}
            </div>
            <div className="choice-grid">
              {group.map((s) => {
                const isSel = selectedIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSel}
                    className={`choice choice--photo${isSel ? ' selected' : ''}`}
                    onClick={() => onToggle(s)}
                  >
                    <ServiceMedia service={s} />
                    <div className="choice__body">
                      <span className="choice__tag">⏱ {s.duration_min} min</span>
                      <div className="choice__title">{s.name}</div>
                      {s.description && <p className="choice__sub">{s.description}</p>}
                      <div className="choice__meta">
                        <span className="choice__price">{money(s.price_mxn)}</span>
                        <span>{isSel ? '✓ Seleccionado' : 'Elegir →'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="step__nav">
        <span className="step__hint" style={{ margin: 0 }}>
          {selected.length === 0
            ? 'Selecciona al menos un tratamiento para continuar'
            : `${selected.length} ${selected.length > 1 ? 'tratamientos' : 'tratamiento'} · ${totalMin} min · ${money(totalPrice)}`}
        </span>
        <button
          type="button"
          className="btn btn--primary"
          disabled={selected.length === 0}
          onClick={onContinue}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
