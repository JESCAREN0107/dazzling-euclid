import { SPA_TZ, toUtcInstant } from '@/lib/time';

export type StaffBooking = {
  id: string;
  reference: string;
  starts_at: string;
  ends_at: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  notes: string;
  service_id: string;
};

export type StaffBookingStatus = 'completed' | 'no_show' | 'cancelled';
export type AdminBookingStatus = 'confirmed' | StaffBookingStatus;

export function applyStatus(
  list: StaffBooking[],
  id: string,
  status: AdminBookingStatus,
): StaffBooking[] {
  return list.map((b) => (b.id === id ? { ...b, status } : b));
}

export function serviceLabel(services: { id: string; name: string }[], id: string): string {
  return services.find((s) => s.id === id)?.name ?? 'Tratamiento facial';
}

export function nextUp(list: StaffBooking[], nowIso: string): StaffBooking | undefined {
  const now = new Date(nowIso).getTime();
  return list
    .filter((b) => b.status === 'confirmed' && new Date(b.starts_at).getTime() >= now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];
}

const dayFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: SPA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function groupByDay(
  list: StaffBooking[],
): { dayKey: string; dayLabel: string; items: StaffBooking[] }[] {
  const groups = new Map<string, { dayKey: string; dayLabel: string; items: StaffBooking[] }>();
  for (const booking of [...list].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    const date = new Date(booking.starts_at);
    const key = dayKeyFmt.format(date);
    if (!groups.has(key)) {
      groups.set(key, { dayKey: key, dayLabel: dayFmt.format(date), items: [] });
    }
    groups.get(key)!.items.push(booking);
  }
  const result: { dayKey: string; dayLabel: string; items: StaffBooking[] }[] = [];
  groups.forEach((group) => result.push(group));
  return result;
}

export function spaDayKey(offsetDays = 0): string {
  return dayKeyFmt.format(new Date(Date.now() + offsetDays * 86400000));
}

export function spaDayWindow(offsetDays = 0): { from: string; to: string } {
  const dayKey = spaDayKey(offsetDays);
  const from = toUtcInstant(dayKey, 0, SPA_TZ);
  const to = toUtcInstant(dayKey, 1440, SPA_TZ);
  return { from, to };
}

export function completionPercent(list: StaffBooking[]): number {
  if (list.length === 0) return 0;
  const completed = list.filter((b) => b.status === 'completed').length;
  return Math.round((completed / list.length) * 100);
}

export function sortByStart(list: StaffBooking[]): StaffBooking[] {
  return [...list].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function applyReschedule(
  list: StaffBooking[],
  id: string,
  startsAt: string,
  endsAt: string,
): StaffBooking[] {
  return sortByStart(
    list.map((b) => (b.id === id ? { ...b, starts_at: startsAt, ends_at: endsAt } : b)),
  );
}
