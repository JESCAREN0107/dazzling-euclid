'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { BookingModal } from './booking-modal';
import type { BookingPrefill } from './booking-wizard';
import type { BusinessHour, Service, Stylist } from '@/lib/supabase/types';

interface BookingCtx {
  isOpen: boolean;
  enabled: boolean;
  preselectedServiceId: string | null;
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
}

const Ctx = createContext<BookingCtx>({
  isOpen: false,
  enabled: true,
  preselectedServiceId: null,
  openBooking: () => {},
  closeBooking: () => {},
});

export function BookingProvider({
  services = [],
  stylists = [],
  hours = [],
  prefill = null,
  enabled = true,
  children,
}: {
  services?: Service[];
  stylists?: Stylist[];
  hours?: BusinessHour[];
  prefill?: BookingPrefill | null;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);

  const openBooking = useCallback(
    (serviceId?: string) => {
      if (!enabled) return;
      if (typeof serviceId === 'string' && serviceId) {
        setPreselectedServiceId(serviceId);
      } else {
        setPreselectedServiceId(null);
      }
      setIsOpen(true);
    },
    [enabled],
  );

  const closeBooking = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Ctx.Provider value={{ isOpen, enabled, preselectedServiceId, openBooking, closeBooking }}>
      {children}
      {enabled && services.length > 0 && (
        <BookingModal
          services={services}
          stylists={stylists}
          hours={hours}
          prefill={prefill ?? undefined}
        />
      )}
    </Ctx.Provider>
  );
}

export function useBooking() {
  return useContext(Ctx);
}
