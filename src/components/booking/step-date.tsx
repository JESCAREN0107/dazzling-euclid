'use client';

import { useMemo } from 'react';
import type { BusinessHour } from '@/lib/supabase/types';
import { DAYS_SHORT } from '@/lib/format';
import { SPA_TZ } from '@/lib/time';

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function StepDate({
  hours,
  selected,
  onSelect,
  onBack,
}: {
  hours: BusinessHour[];
  selected: string | null;
  onSelect: (dateStr: string) => void;
  onBack: () => void;
}) {
  const days = useMemo(() => {
    const hoursByDow = new Map(hours.map((h) => [h.day_of_week, h]));
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: SPA_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const out: {
      dateStr: string;
      dowLabel: string;
      dayNum: number;
      monthLabel: string;
      closed: boolean;
    }[] = [];
    const base = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const dateStr = fmt.format(d);
      const [y, m, day] = dateStr.split('-').map(Number);
      const dow = new Date(Date.UTC(y!, m! - 1, day!)).getUTCDay();
      const bh = hoursByDow.get(dow);
      out.push({
        dateStr,
        dowLabel: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DAYS_SHORT[dow]!,
        dayNum: day!,
        monthLabel: MONTHS_SHORT[m! - 1]!,
        closed: bh ? bh.is_closed : false,
      });
    }
    return out;
  }, [hours]);

  return (
    <div className="step">
      <h2 className="step__title">3. Selecciona la fecha</h2>
      <p className="step__hint">
        Mostrando los próximos 21 días en horario local (America/Matamoros). Los lunes permanecemos
        cerrados.
      </p>

      <div className="date-strip">
        {days.map((d) => (
          <button
            key={d.dateStr}
            type="button"
            disabled={d.closed}
            className={`date-pill${selected === d.dateStr ? ' selected' : ''}`}
            onClick={() => onSelect(d.dateStr)}
          >
            <div className="date-pill__dow">{d.dowLabel}</div>
            <div className="date-pill__day">{d.dayNum}</div>
            <div className="date-pill__mon">{d.closed ? 'Cerrado' : d.monthLabel}</div>
          </button>
        ))}
      </div>

      <div className="step__nav">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Cambiar especialista
        </button>
      </div>
    </div>
  );
}
