'use client';

import { useState } from 'react';
import type { BusinessHour, Service, Stylist } from '@/lib/supabase/types';
import { createBooking, type CreateBookingResult } from '@/app/book/actions';
import { saveGuestBooking } from '@/lib/guest-bookings';
import { SPA_TZ } from '@/lib/time';
import { StepService } from './step-service';
import { StepStylist } from './step-stylist';
import { StepDate } from './step-date';
import { StepTime } from './step-time';
import { StepDetails } from './step-details';
import { SummaryAside } from './summary-aside';
import { Confirmation } from './confirmation';
import { GuestRecent } from './guest-recent';

const STEPS = ['Tratamiento', 'Especialista', 'Fecha', 'Horario', 'Tus Datos'] as const;

const guestWhenFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export interface BookingPrefill {
  name?: string;
  email?: string;
  phone?: string;
}

export function BookingWizard({
  services,
  stylists,
  hours,
  prefill,
  initialServiceId,
}: {
  services: Service[];
  stylists: Stylist[];
  hours: BusinessHour[];
  prefill?: BookingPrefill;
  initialServiceId?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (!initialServiceId) return [];
    const found = services.find((s) => s.id === initialServiceId);
    return found ? [found] : [];
  });
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [stylistChosen, setStylistChosen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Extract<CreateBookingResult, { ok: true }> | null>(
    null,
  );

  const isGuest = !prefill?.email && !prefill?.name;

  function toggleService(s: Service) {
    setSelectedServices((prev) =>
      prev.some((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s],
    );
    setTime(null);
  }

  function resetAll() {
    setStep(0);
    setSelectedServices([]);
    setStylist(null);
    setStylistChosen(false);
    setDate(null);
    setTime(null);
    setSubmitError(null);
    setConfirmed(null);
  }

  async function handleSubmit(details: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  }) {
    if (selectedServices.length === 0 || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await createBooking({
      serviceIds: selectedServices.map((s) => s.id),
      stylistId: stylist?.id ?? null,
      date,
      time,
      customerName: details.name,
      customerPhone: details.phone,
      customerEmail: details.email || null,
      notes: details.notes,
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }
    if (isGuest) {
      saveGuestBooking({
        reference: res.reference,
        serviceName: res.serviceName,
        stylistName: res.stylistName,
        whenLabel: guestWhenFmt.format(new Date(res.startsAt)),
        status: 'confirmed',
        priceMxn: res.priceMxn,
        createdAt: new Date().toISOString(),
      });
    }
    setConfirmed(res);
  }

  if (confirmed) {
    return (
      <Confirmation
        result={confirmed}
        customerName={prefill?.name}
        onReset={resetAll}
      />
    );
  }

  return (
    <div className="wizard">
      <div>
        {isGuest && <GuestRecent />}
        <div className="stepper" role="tablist" aria-label="Pasos de reservación">
          {STEPS.map((label, i) => {
            const cls =
              i === step ? 'stepper__item active' : i < step ? 'stepper__item done' : 'stepper__item';
            return (
              <button
                key={label}
                type="button"
                className={cls}
                disabled={i > step}
                onClick={() => setStep(i)}
              >
                <span className="stepper__num">{i < step ? '✓' : i + 1}</span>
                {label}
              </button>
            );
          })}
        </div>

        {step === 0 && (
          <StepService
            services={services}
            selectedIds={selectedServices.map((s) => s.id)}
            onToggle={toggleService}
            onContinue={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <StepStylist
            stylists={stylists}
            selected={stylistChosen ? (stylist?.id ?? 'any') : null}
            onSelect={(st) => {
              setStylist(st);
              setStylistChosen(true);
              setTime(null);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <StepDate
            hours={hours}
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setTime(null);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedServices.length > 0 && date && (
          <StepTime
            serviceIds={selectedServices.map((s) => s.id)}
            stylistId={stylist?.id ?? null}
            date={date}
            selected={time}
            onSelect={(tSlot) => {
              setTime(tSlot);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepDetails
            submitting={submitting}
            error={submitError}
            onSubmit={handleSubmit}
            onBack={() => setStep(3)}
            prefill={prefill}
          />
        )}
      </div>

      <SummaryAside
        services={selectedServices}
        stylist={stylist}
        stylistChosen={stylistChosen}
        date={date}
        time={time}
      />
    </div>
  );
}
