'use client';

import type { Stylist } from '@/lib/supabase/types';
import { stylistAvatarSrc, ratingLabel } from '@/lib/stylist-card';

export function StepStylist({
  stylists,
  selected,
  onSelect,
  onBack,
}: {
  stylists: Stylist[];
  selected: string | null;
  onSelect: (s: Stylist | null) => void;
  onBack: () => void;
}) {
  return (
    <div className="step">
      <h2 className="step__title">2. Elige a tu especialista</h2>
      <p className="step__hint">
        Selecciona a tu especialista preferida o elige &laquo;Cualquier especialista disponible&raquo;
        para ver todos los horarios abiertos.
      </p>

      <div className="choice-grid">
        <button
          type="button"
          className={`choice${selected === 'any' ? ' selected' : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className="choice__tag">Máxima disponibilidad</span>
          <div className="choice__title">Cualquier especialista disponible</div>
          <p className="choice__sub">
            Te asignaremos automáticamente a la especialista certificada disponible en el horario
            que elijas.
          </p>
        </button>

        {stylists.map((s) => {
          const rating = ratingLabel(s.rating, s.rating_count);
          return (
            <button
              key={s.id}
              type="button"
              className={`choice choice--stylist${selected === s.id ? ' selected' : ''}`}
              onClick={() => onSelect(s)}
            >
              <div className="choice__avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stylistAvatarSrc(s)} alt={s.name} />
              </div>
              <div className="choice__body">
                <span className="choice__tag">{s.role}</span>
                <div className="choice__title">{s.name}</div>
                <div className="choice__rating">
                  <span className="choice__stars">{rating.stars}</span>
                  {rating.reviews && <span className="choice__rcount">{rating.reviews}</span>}
                </div>
                <p className="choice__sub">{s.tags.join(' · ')}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="step__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Cambiar tratamiento
        </button>
      </div>
    </div>
  );
}
