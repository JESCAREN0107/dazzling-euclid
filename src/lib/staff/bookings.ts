import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { StaffBooking } from './view';

const STAFF_BOOKING_COLUMNS =
  'id,reference,starts_at,ends_at,status,customer_name,customer_phone,notes,service_id';

export async function getMyAssignedBookings(opts: {
  stylistId: string;
  from: string;
  to: string;
}): Promise<StaffBooking[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from('bookings')
      .select(STAFF_BOOKING_COLUMNS)
      .eq('stylist_id', opts.stylistId)
      .gte('starts_at', opts.from)
      .lt('starts_at', opts.to)
      .order('starts_at');
    return (data as StaffBooking[] | null) ?? [];
  } catch {
    return [];
  }
}
