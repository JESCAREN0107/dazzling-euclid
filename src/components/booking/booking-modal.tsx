'use client';

import { useEffect } from 'react';
import { useBooking } from './booking-provider';
import { BookingWizard, type BookingPrefill } from './booking-wizard';
import { LogoIcon } from '@/components/ui/logo-icon';
import type { BusinessHour, Service, Stylist } from '@/lib/supabase/types';

export function BookingModal({
  services,
  stylists,
  hours,
  prefill,
}: {
  services: Service[];
  stylists: Stylist[];
  hours: BusinessHour[];
  prefill?: BookingPrefill;
}) {
  const { isOpen, closeBooking, preselectedServiceId } = useBooking();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBooking();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflowY = prevOverflow;
    };
  }, [isOpen, closeBooking]);

  if (!isOpen) return null;

  return (
    <div
      className="bmodal"
      role="dialog"
      aria-modal="true"
      aria-label="Reservar una cita en Lumière Skin & Spa"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBooking();
      }}
    >
      <div className="bmodal__panel">
        <header className="bmodal__head">
          <div className="bmodal__brand">
            <span
              className="home-brand__mark"
              aria-hidden="true"
              style={{ width: 28, height: 28, display: 'inline-grid', placeItems: 'center' }}
            >
              <LogoIcon />
            </span>
            <div>
              <b>Lumière Skin &amp; Spa</b>
              <small>Reservación en Línea · Precios en MXN</small>
            </div>
          </div>
          <button
            type="button"
            className="bmodal__close"
            onClick={closeBooking}
            aria-label="Cerrar ventana de reservación"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="bmodal__body">
          <BookingWizard
            key={preselectedServiceId ?? 'default'}
            services={services}
            stylists={stylists}
            hours={hours}
            prefill={prefill}
            initialServiceId={preselectedServiceId}
          />
        </div>
      </div>
    </div>
  );
}
