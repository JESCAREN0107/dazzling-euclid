import type { Service, Stylist } from '@/lib/supabase/types';
import { minutesToLabel, money } from '@/lib/format';

export function SummaryAside({
  services,
  stylist,
  stylistChosen,
  date,
  time,
}: {
  services: Service[];
  stylist: Stylist | null;
  stylistChosen: boolean;
  date: string | null;
  time: string | null;
}) {
  const timeLabel = time
    ? (() => {
        const [h, m] = time.split(':').map(Number);
        return minutesToLabel(h! * 60 + m!);
      })()
    : '—';

  const totalPrice = services.reduce((sum, s) => sum + s.price_mxn, 0);
  const totalMin = services.reduce((sum, s) => sum + s.duration_min, 0);
  const serviceLabel =
    services.length === 0 ? '—' : services.map((s) => s.name).join(' + ');

  return (
    <aside className="summary" aria-label="Resumen de tu reservación">
      <div className="summary__title">Tu Visita en Lumière</div>
      <div className="summary__row">
        <span>{services.length > 1 ? 'Tratamientos' : 'Tratamiento'}</span>
        <b>{serviceLabel}</b>
      </div>
      <div className="summary__row">
        <span>Duración estimada</span>
        <b>{services.length > 0 ? `${totalMin} min` : '—'}</b>
      </div>
      <div className="summary__row">
        <span>Especialista</span>
        <b>{stylistChosen ? (stylist?.name ?? 'Cualquier disponible') : '—'}</b>
      </div>
      <div className="summary__row">
        <span>Fecha</span>
        <b>{date ?? '—'}</b>
      </div>
      <div className="summary__row">
        <span>Horario (Matamoros)</span>
        <b>{timeLabel}</b>
      </div>
      <div className="summary__total">
        <span>Total estimado</span>
        <b>{services.length > 0 ? money(totalPrice) : '—'}</b>
      </div>
    </aside>
  );
}
