'use client';

import { useEffect, useState } from 'react';
import { readGuestBookings, type GuestBooking } from '@/lib/guest-bookings';
import { money } from '@/lib/format';

export function GuestRecent() {
  const [items, setItems] = useState<GuestBooking[]>([]);

  useEffect(() => {
    setItems(readGuestBookings());
  }, []);

  if (items.length === 0) return null;

  return (
    <details className="guest-recent">
      <summary className="guest-recent__summary">
        Tus citas recientes en este dispositivo ({items.length})
      </summary>
      <ul className="guest-recent__list">
        {items.map((b) => (
          <li key={b.reference} className="guest-recent__item">
            <div>
              <b>{b.serviceName}</b>
              <div className="step__hint" style={{ margin: 0 }}>
                {b.whenLabel} · {b.stylistName}
                {b.priceMxn != null ? ` · ${money(b.priceMxn)}` : ''}
              </div>
            </div>
            <span className="guest-recent__ref">{b.reference}</span>
          </li>
        ))}
      </ul>
      <p className="step__hint" style={{ margin: '10px 0 0' }}>
        <a href="/signup">Crea una cuenta</a> con el mismo correo para administrar o reprogramar tus
        citas desde cualquier dispositivo.
      </p>
    </details>
  );
}
