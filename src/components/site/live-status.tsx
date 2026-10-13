'use client';

import { useEffect, useState } from 'react';
import { nowInSpaTz } from '@/lib/time';
import type { BusinessHour } from '@/lib/supabase/types';

export function LiveStatus({ hours }: { hours: BusinessHour[] }) {
  const [status, setStatus] = useState<'open' | 'closed' | 'loading'>('loading');

  useEffect(() => {
    const checkOpen = () => {
      const { dayOfWeek, minuteOfDay } = nowInSpaTz(new Date());
      const dayHour = hours.find((h) => h.day_of_week === dayOfWeek);
      if (!dayHour || dayHour.is_closed) {
        setStatus('closed');
        return;
      }
      if (minuteOfDay >= dayHour.open_minute && minuteOfDay < dayHour.close_minute) {
        setStatus('open');
      } else {
        setStatus('closed');
      }
    };

    checkOpen();
    const interval = setInterval(checkOpen, 60000);
    return () => clearInterval(interval);
  }, [hours]);

  if (status === 'loading') {
    return (
      <div className="live-status-badge live-status-badge--loading">
        <span className="live-status-dot" />
        <span>Verificando horario…</span>
      </div>
    );
  }

  if (status === 'open') {
    return (
      <div className="live-status-badge live-status-badge--open">
        <span className="live-status-dot" />
        <span>Abierto ahora · America/Matamoros</span>
      </div>
    );
  }

  return (
    <div className="live-status-badge live-status-badge--closed">
      <span className="live-status-dot" />
      <span>Cerrado en este momento · Reserva en línea 24/7</span>
    </div>
  );
}
