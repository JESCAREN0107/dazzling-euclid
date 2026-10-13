'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { bookingInputSchema, type BookingInput } from '@/lib/validators';
import { computeAvailableSlots, type MinuteInterval } from '@/lib/availability';
import { SPA_TZ, toUtcInstant, nowInSpaTz } from '@/lib/time';
import { makeReference } from '@/lib/reference';
import { roleCanBook, type Role } from '@/lib/auth/roles';
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

async function resolveServicesByIds(serviceIds: string[]) {
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

export async function getAvailability(params: {
  serviceIds: string[];
  stylistId: string | null;
  date: string;
}): Promise<{ slots: string[]; closedReason?: string }> {
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
  const durationMin = services.reduce((sum, s) => sum + s.duration_min, 0);

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

export type CreateBookingResult =
  | {
      ok: true;
      reference: string;
      startsAt: string;
      endsAt: string;
      serviceName: string;
      stylistName: string;
      priceMxn: number;
      durationMin: number;
    }
  | { ok: false; error: string };

export async function createBooking(raw: BookingInput): Promise<CreateBookingResult> {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos de reservación inválidos' };
  }
  const input = parsed.data;

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (user) {
    const { data: prof } = await sb
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (!roleCanBook((prof?.role as Role | undefined) ?? null)) {
      return {
        ok: false,
        error: 'Las cuentas de personal gestionan citas desde su panel de agenda.',
      };
    }
  }

  const services = await resolveServicesByIds(input.serviceIds);
  if (
    services.length !== input.serviceIds.length ||
    services.some((s) => !s.bookable || !s.is_active)
  ) {
    return { ok: false, error: 'El tratamiento seleccionado ya no está disponible.' };
  }

  // Ordenar según la selección del cliente
  const byId = new Map(services.map((s) => [s.id, s]));
  const ordered = input.serviceIds.map((id) => byId.get(id)!);
  const totalDuration = ordered.reduce((sum, s) => sum + s.duration_min, 0);
  const totalPrice = ordered.reduce((sum, s) => sum + s.price_mxn, 0);
  const combinedName = ordered.map((s) => s.name).join(' + ');

  // Verificar disponibilidad en tiempo real antes de insertar (protección anti-duplicados)
  const { slots: openNow } = await getAvailability({
    serviceIds: input.serviceIds,
    stylistId: input.stylistId,
    date: input.date,
  });

  if (!openNow.includes(input.time)) {
    return {
      ok: false,
      error:
        'Ese horario acaba de ser reservado por otra persona. Por favor elige otro horario disponible.',
    };
  }

  const [th, tm] = input.time.split(':').map(Number);
  const startMinute = th! * 60 + tm!;
  const startsAt = toUtcInstant(input.date, startMinute, SPA_TZ);
  const endsAt = toUtcInstant(input.date, startMinute + totalDuration, SPA_TZ);

  // Si eligió "Cualquier especialista", asignar la primera especialista libre en ese bloque
  let assignedStylistId = input.stylistId;
  let stylistName = 'Cualquier especialista disponible';

  if (!assignedStylistId) {
    const { data: stylists } = await sb
      .from('stylists')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order');

    for (const st of stylists ?? []) {
      const { slots } = await getAvailability({
        serviceIds: input.serviceIds,
        stylistId: st.id,
        date: input.date,
      });
      if (slots.includes(input.time)) {
        assignedStylistId = st.id;
        stylistName = st.name;
        break;
      }
    }
    if (!assignedStylistId) {
      return {
        ok: false,
        error: 'Ya no hay especialistas libres en ese horario. Por favor elige otro horario.',
      };
    }
  } else {
    const { data: st } = await sb
      .from('stylists')
      .select('name')
      .eq('id', assignedStylistId)
      .eq('is_active', true)
      .maybeSingle();
    if (!st) {
      return { ok: false, error: 'La especialista seleccionada no está disponible.' };
    }
    stylistName = st.name;
  }

  // La inserción se hace con service_role: la tabla no admite INSERT público
  // (ver supabase/migrations/0002_security_fixes.sql); toda la validación ocurre arriba.
  const admin = createAdminClient();
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference();
    const { error } = await admin.from('bookings').insert({
      reference,
      service_id: input.serviceIds[0]!,
      service_ids: input.serviceIds,
      stylist_id: assignedStylistId,
      user_id: user?.id ?? null,
      starts_at: startsAt,
      ends_at: endsAt,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      notes: input.notes,
      status: 'confirmed',
    });

    if (!error) {
      revalidatePath('/admin');
      revalidatePath('/admin/schedule');
      revalidatePath('/staff');
      revalidatePath('/staff/schedule');
      return {
        ok: true,
        reference,
        startsAt,
        endsAt,
        serviceName: combinedName,
        stylistName,
        priceMxn: totalPrice,
        durationMin: totalDuration,
      };
    }

    // 23P01 = violación de restricción EXCLUDE (cita superpuesta en PostgreSQL)
    if (error.code === '23P01') {
      return {
        ok: false,
        error:
          'Ese horario acaba de ocuparse para la especialista seleccionada. Por favor elige otro horario.',
      };
    }
    // 23505 = colisión de código de referencia, reintentar con nuevo código
    if (error.code === '23505') continue;

    return {
      ok: false,
      error: `No fue posible registrar la cita (${error.message}). Verifica que la migración SQL de Supabase haya sido aplicada.`,
    };
  }

  return { ok: false, error: 'No fue posible generar tu código de cita. Intenta de nuevo.' };
}
