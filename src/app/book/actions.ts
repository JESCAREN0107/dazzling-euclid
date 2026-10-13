'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { bookingInputSchema, type BookingInput } from '@/lib/validators';
import { SPA_TZ, toUtcInstant } from '@/lib/time';
import {
  computeAvailability,
  resolveServicesByIds,
  type AvailabilityParams,
} from '@/lib/booking/day-availability';
import { makeReference } from '@/lib/reference';
import { roleCanBook, type Role } from '@/lib/auth/roles';

export async function getAvailability(
  params: AvailabilityParams,
): Promise<{ slots: string[]; closedReason?: string }> {
  return computeAvailability(params);
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
  const { slots: openNow } = await computeAvailability({
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
      const { slots } = await computeAvailability({
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
