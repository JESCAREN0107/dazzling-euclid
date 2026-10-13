import type { Booking } from '@/lib/supabase/types';
import type { BookingRow } from '@/components/admin/bookings-table';
import { SPA_TZ } from '@/lib/time';

export const SALON_TZ = SPA_TZ;
export type BookingJoinRow = Booking & {
  services: { name: string } | null;
  stylists: { name: string } | null;
};

const dayFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: SPA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const whenFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function toBookingRow(b: BookingJoinRow): BookingRow {
  return {
    id: b.id,
    reference: b.reference,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    serviceName: b.services?.name ?? 'Tratamiento facial',
    stylistName: b.stylists?.name ?? 'Cualquier especialista',
    whenLabel: whenFmt.format(new Date(b.starts_at)),
    status: b.status,
  };
}

export function salonDayKey(d: Date): string {
  return dayFmt.format(d);
}

export function splitTodayUpcoming(rows: BookingJoinRow[], now: Date = new Date()) {
  const todayKey = dayFmt.format(now);
  const today: BookingRow[] = [];
  const upcoming: BookingRow[] = [];
  for (const b of rows) {
    const key = dayFmt.format(new Date(b.starts_at));
    if (key === todayKey) today.push(toBookingRow(b));
    else if (key > todayKey) upcoming.push(toBookingRow(b));
  }
  return { today, upcoming };
}
