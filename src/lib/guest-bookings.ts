export type GuestBooking = {
  reference: string;
  serviceName: string;
  stylistName: string;
  whenLabel: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  priceMxn?: number;
  createdAt: string;
};

const KEY = 'lumiere_guest_bookings';
const CAP = 20;
const STATUSES: readonly GuestBooking['status'][] = ['confirmed', 'completed', 'cancelled'];

export function isGuestBooking(value: unknown): value is GuestBooking {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.reference === 'string' &&
    typeof v.serviceName === 'string' &&
    typeof v.stylistName === 'string' &&
    typeof v.whenLabel === 'string' &&
    typeof v.status === 'string' &&
    (STATUSES as readonly string[]).includes(v.status) &&
    typeof v.createdAt === 'string'
  );
}

export function normalizeGuestList(raw: unknown, cap = CAP): GuestBooking[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: GuestBooking[] = [];
  for (const item of raw) {
    if (!isGuestBooking(item) || seen.has(item.reference)) continue;
    seen.add(item.reference);
    out.push(item);
    if (out.length >= cap) break;
  }
  return out;
}

export function readGuestBookings(): GuestBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeGuestList(JSON.parse(window.localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return [];
  }
}

export function saveGuestBooking(booking: GuestBooking): void {
  if (typeof window === 'undefined') return;
  const next = normalizeGuestList([booking, ...readGuestBookings()]);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
}
