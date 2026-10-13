import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getServices, getStylists } from '@/lib/queries';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { spaDayKey, spaDayWindow } from '@/lib/staff/view';
import { ScheduleView, type BlockedSlotRow } from '@/components/staff/schedule-view';
import { StylistPicker } from './picker';
import {
  adminBlockSlot,
  adminDeleteBooking,
  adminRescheduleBooking,
  adminSetBookingStatus,
  adminUnblockSlot,
} from './actions';

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ stylist?: string }>;
}) {
  const profile = await requireRole(['admin'], '/admin/schedule');
  const sp = await searchParams;
  const stylists = await getStylists();

  const chosen =
    stylists.find((s) => s.id === sp.stylist) ??
    stylists.find((s) => s.id === profile.stylistId) ??
    stylists[0];

  if (!chosen) {
    return (
      <div className="apage">
        <div className="ahead">
          <div>
            <span className="eyebrow">Cabinas</span>
            <h1 className="ahead__title">Agenda</h1>
          </div>
        </div>
        <p className="step__hint">Agrega primero a una especialista para gestionar su agenda.</p>
      </div>
    );
  }

  const today = spaDayWindow(0);
  const weekEnd = spaDayWindow(7);
  const sb = await createClient();
  const [bookings, upcoming, services, blocksRes] = await Promise.all([
    getMyAssignedBookings({ stylistId: chosen.id, from: today.from, to: today.to }),
    getMyAssignedBookings({ stylistId: chosen.id, from: today.to, to: weekEnd.to }),
    getServices(),
    sb
      .from('blocked_slots')
      .select('id, starts_at, ends_at, reason')
      .eq('stylist_id', chosen.id)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at'),
  ]);

  const selectedId = chosen.id;
  async function onBlock(fd: FormData) {
    'use server';
    return adminBlockSlot(selectedId, fd);
  }
  async function onRestore(id: string) {
    'use server';
    return adminSetBookingStatus(id, 'confirmed');
  }

  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Cabinas</span>
          <h1 className="ahead__title">Agenda</h1>
        </div>
        <StylistPicker
          stylists={stylists.map((s) => ({ id: s.id, name: s.name }))}
          selectedId={chosen.id}
        />
      </div>

      <ScheduleView
        key={chosen.id}
        stylistName={chosen.name}
        todayKey={spaDayKey(0)}
        nowIso={new Date().toISOString()}
        services={services.map((s) => ({ id: s.id, name: s.name }))}
        initialBookings={bookings}
        initialUpcoming={upcoming}
        initialBlocks={(blocksRes.data ?? []) as BlockedSlotRow[]}
        actions={{
          onStatus: adminSetBookingStatus,
          onRestore,
          onDeleteBooking: adminDeleteBooking,
          onReschedule: adminRescheduleBooking,
          onBlock,
          onUnblock: adminUnblockSlot,
        }}
      />
    </div>
  );
}
