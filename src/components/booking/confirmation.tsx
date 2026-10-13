'use client';

import type { CreateBookingResult } from '@/app/book/actions';
import { money } from '@/lib/format';
import { SPA_TZ } from '@/lib/time';
import { useBooking } from './booking-provider';

const whenFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function Confirmation({
  result,
  customerName,
  onReset,
}: {
  result: Extract<CreateBookingResult, { ok: true }>;
  customerName?: string;
  onReset: () => void;
}) {
  const { closeBooking } = useBooking();
  const formattedWhen = whenFmt.format(new Date(result.startsAt));

  const waMessage = encodeURIComponent(
    `Hola Lumière Skin & Spa ✨ Acabo de agendar mi cita en línea:\n` +
      `• Código: ${result.reference}\n` +
      `• Tratamiento: ${result.serviceName} (${result.durationMin} min)\n` +
      `• Especialista: ${result.stylistName}\n` +
      `• Fecha y hora: ${formattedWhen}\n` +
      `• Total: ${money(result.priceMxn)}`,
  );

  return (
    <div className="confirm">
      <div className="confirm__check" aria-hidden="true">
        ✓
      </div>
      <span className="eyebrow">Reservación Confirmada</span>
      <h2 className="h-section" style={{ marginTop: 10 }}>
        ¡Te esperamos{customerName ? `, ${customerName.split(' ')[0]}` : ''}!
      </h2>
      <p className="lead" style={{ margin: '12px auto 0' }}>
        Tu horario ha quedado reservado y bloqueado en nuestra agenda para evitar citas duplicadas.
        Guarda tu código de referencia:
      </p>
      <div className="confirm__ref">{result.reference}</div>

      <div className="panel" style={{ textAlign: 'left', marginBottom: 28 }}>
        <div className="summary__row">
          <span>Tratamiento</span>
          <b>{result.serviceName}</b>
        </div>
        <div className="summary__row">
          <span>Duración</span>
          <b>{result.durationMin} min</b>
        </div>
        <div className="summary__row">
          <span>Especialista</span>
          <b>{result.stylistName}</b>
        </div>
        <div className="summary__row">
          <span>Fecha y hora (America/Matamoros)</span>
          <b>{formattedWhen}</b>
        </div>
        <div className="summary__row">
          <span>Total a pagar en clínica</span>
          <b>{money(result.priceMxn)}</b>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`https://wa.me/528995276969?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
        >
          Enviar comprobante por WhatsApp
        </a>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Agendar otra cita
        </button>
        <button type="button" className="btn btn--ghost" onClick={closeBooking}>
          Volver al sitio
        </button>
      </div>
    </div>
  );
}
