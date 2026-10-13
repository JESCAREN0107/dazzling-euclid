'use client';

import { useEffect, useState } from 'react';
import { getAvailability } from '@/app/book/actions';
import { minutesToLabel } from '@/lib/format';

function hhmmToLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return minutesToLabel(h! * 60 + m!);
}

export function StepTime({
  serviceIds,
  stylistId,
  date,
  selected,
  onSelect,
  onBack,
}: {
  serviceIds: string[];
  stylistId: string | null;
  date: string;
  selected: string | null;
  onSelect: (hhmm: string) => void;
  onBack: () => void;
}) {
  const serviceKey = serviceIds.join(',');
  const [slots, setSlots] = useState<string[] | null>(null);
  const [closedReason, setClosedReason] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setClosedReason(undefined);
    getAvailability({ serviceIds, stylistId, date }).then((r) => {
      if (!cancelled) {
        setSlots(r.slots);
        setClosedReason(r.closedReason);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceKey, stylistId, date]);

  return (
    <div className="step">
      <h2 className="step__title">4. Elige un horario disponible</h2>
      <p className="step__hint">
        Solo se muestran horarios verificados sin traslapes para cubrir la duración completa de tu
        tratamiento (Zona horaria: America/Matamoros).
      </p>

      {slots === null && <p className="lead">Consultando disponibilidad en tiempo real…</p>}

      {slots !== null && slots.length === 0 && (
        <div className="panel">
          <p style={{ marginBottom: 16 }}>
            {closedReason ??
              'No quedan espacios disponibles en esta fecha para la duración de tu tratamiento. Por favor elige otro día o selecciona "Cualquier especialista disponible".'}
          </p>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            ← Elegir otra fecha
          </button>
        </div>
      )}

      {slots && slots.length > 0 && (
        <div className="slot-grid">
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              className={`slot-btn${selected === s ? ' selected' : ''}`}
              onClick={() => onSelect(s)}
            >
              {hhmmToLabel(s)}
            </button>
          ))}
        </div>
      )}

      <div className="step__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Cambiar fecha
        </button>
      </div>
    </div>
  );
}
