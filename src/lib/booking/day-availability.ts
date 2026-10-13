import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { computeAvailableSlots, type MinuteInterval } from '@/lib/availability';
import { SPA_TZ, toUtcInstant, nowInSpaTz } from '@/lib/time';
import { DEFAULT_HOURS, DEFAULT_SERVICES, DEFAULT_STYLISTS } from '@/lib/queries';

function overlapToMinuteInterval(
  rowStartIso: string,
  rowEndIso: string,
  dayStartMs: number,
): MinuteInterval | null {
  const s = Math.max(0, Math.floor((new Date(rowStartIso).getTime() - dayStartMs) / 60000));
  const e = Math.min(1440, Math.ceil((new Date(rowEndIso).getTime() - dayStartMs) / 60000));
  return e > s ? { start: s, end: e } : null;
}

export async function resolveServicesByIds(serviceIds: string[]) {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from('services')
      .select('id, name, duration_min, price_mxn, bookable, is_active')
      .in('id', serviceIds);
    if (data && data.length > 0) {
      return data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: String(r.name ?? ''),
        duration_min: Number(r.duration_min ?? r.duration_minutes ?? 60),
        price_mxn: Number(r.price_mxn ?? r.price ?? 0),
        bookable: r.bookable !== false,
        is_active: r.is_active !== false,
      }));
    }
  } catch {
    // Fallback to catalog defaults if DB is not yet seeded
  }
  return DEFAULT_SERVICES.filter((s) => serviceIds.includes(s.id));
}

export type AvailabilityParams = {
  serviceIds: string[];
  stylistId: string | null;
  date: string;
};

export type AvailabilityOptions = {
  /** Duración fija en minutos (p. ej. la de una cita existente al reprogramarla). */
  durationMin?: number;
  /** Intervalo ocupado por la propia cita que se reprograma: no cuenta como conflicto. */
  ignore?: { stylist_id: string | null; starts_at: string; ends_at: string };
};

export async function computeAvailability(
  params: AvailabilityParams,
  opts: AvailabilityOptions = {},
): Promise<{ slots: string[]; closedReason?: string }> {
  const { serviceIds, stylistId, date } = params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || serviceIds.length === 0) {
    return { slots: [] };
  }

  const services = await resolveServicesByIds(serviceIds);
  if (
    services.length !== serviceIds.length ||
    services.some((s) => !s.bookable || !s.is_active)
  ) {
    return { slots: [] };
  }
  const durationMin = opts.durationMin ?? services.reduce((sum, s) => sum + s.duration_min, 0);

  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();

  const sb = await createClient();
  let hours = DEFAULT_HOURS.find((h) => h.day_of_week === dow) ?? null;
  try {
    const { data: dbHours } = await sb
      .from('business_hours')
      .select('*')
      .eq('day_of_week', dow)
      .maybeSingle();
    if (dbHours) hours = dbHours;
  } catch {
    // Use default hours
  }

  if (!hours || hours.is_closed) {
    return { slots: [], closedReason: 'El spa permanece cerrado en este día.' };
  }

  const dayStartIso = toUtcInstant(date, 0, SPA_TZ);
  const dayEndIso = toUtcInstant(date, 1440, SPA_TZ);
  const dayStartMs = new Date(dayStartIso).getTime();

  type BusyRow = { stylist_id: string | null; starts_at: string; ends_at: string };
  let bookings: BusyRow[] = [];
  let blocks: Array<{ stylist_id: string | null; starts_at: string; ends_at: string; reason: string }> = [];

  try {
    const [busyRes, blockRes] = await Promise.all([
      sb.rpc('busy_slots', { range_from: dayStartIso, range_to: dayEndIso }),
      sb
        .from('blocked_slots')
        .select('stylist_id, starts_at, ends_at, reason')
        .lt('starts_at', dayEndIso)
        .gt('ends_at', dayStartIso),
    ]);
    if (busyRes.data) {
      bookings = busyRes.data as BusyRow[];
    } else {
      const { data: fallbackBookings } = await sb
        .from('bookings')
        .select('stylist_id, starts_at, ends_at')
        .eq('status', 'confirmed')
        .lt('starts_at', dayEndIso)
        .gt('ends_at', dayStartIso);
      bookings = (fallbackBookings ?? []) as BusyRow[];
    }
    blocks = (blockRes.data ?? []) as typeof blocks;
  } catch {
    // Continue with empty busy list if table not created yet
  }

  // Al reprogramar, el intervalo actual de la cita se libera en la misma operación.
  const ig = opts.ignore;
  if (ig) {
    const igStart = new Date(ig.starts_at).getTime();
    const igEnd = new Date(ig.ends_at).getTime();
    bookings = bookings.filter(
      (b) =>
        !(
          b.stylist_id === ig.stylist_id &&
          new Date(b.starts_at).getTime() === igStart &&
          new Date(b.ends_at).getTime() === igEnd
        ),
    );
  }

  const spaWideClosure = blocks.find(
    (b) =>
      b.stylist_id === null &&
      new Date(b.starts_at).getTime() <= dayStartMs &&
      new Date(b.ends_at).getTime() >= new Date(dayEndIso).getTime(),
  );
  if (spaWideClosure) {
    return {
      slots: [],
      closedReason: spaWideClosure.reason
        ? `Cerrado temporalmente: ${spaWideClosure.reason}`
        : 'Sin disponibilidad en esta fecha.',
    };
  }

  const nowSpa = nowInSpaTz(new Date());
  let minStartMinute = 0;
  if (date < nowSpa.dateStr) {
    return { slots: [] };
  }
  if (date === nowSpa.dateStr) {
    minStartMinute = nowSpa.minuteOfDay + 30;
  }

  const busyForStylist = (sid: string): MinuteInterval[] => {
    const out: MinuteInterval[] = [];
    for (const b of bookings) {
      if (b.stylist_id === sid) {
        const iv = overlapToMinuteInterval(b.starts_at, b.ends_at, dayStartMs);
        if (iv) out.push(iv);
      }
    }
    for (const bl of blocks) {
      if (bl.stylist_id === null || bl.stylist_id === sid) {
        const iv = overlapToMinuteInterval(bl.starts_at, bl.ends_at, dayStartMs);
        if (iv) out.push(iv);
      }
    }
    return out;
  };

  if (stylistId) {
    const slots = computeAvailableSlots({
      openMinute: hours.open_minute,
      closeMinute: hours.close_minute,
      isClosed: hours.is_closed,
      durationMin,
      busy: busyForStylist(stylistId),
      minStartMinute,
    });
    return { slots };
  }

  // "Cualquier especialista disponible": unión de horarios libres de todas las especialistas activas
  let activeStylistIds = DEFAULT_STYLISTS.map((s) => s.id);
  try {
    const { data: dbStylists } = await sb
      .from('stylists')
      .select('id')
      .eq('is_active', true)
      .order('sort_order');
    if (dbStylists && dbStylists.length > 0) {
      activeStylistIds = dbStylists.map((s) => s.id);
    }
  } catch {
    // Use default stylist IDs
  }

  const union = new Set<string>();
  for (const sid of activeStylistIds) {
    const slots = computeAvailableSlots({
      openMinute: hours.open_minute,
      closeMinute: hours.close_minute,
      isClosed: hours.is_closed,
      durationMin,
      busy: busyForStylist(sid),
      minStartMinute,
    });
    slots.forEach((s) => union.add(s));
  }
  return { slots: Array.from(union).sort() };
}
