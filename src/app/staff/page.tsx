import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getServices } from '@/lib/queries';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { spaDayKey, spaDayWindow } from '@/lib/staff/view';
import { cardNeedsSetup } from '@/lib/staff/card-input';
import { ScheduleView, type BlockedSlotRow } from '@/components/staff/schedule-view';
import { StaffHeader } from './staff-header';
import { MyCardEditor, type MyCardData } from './my-card';
import { blockMySlot, unblockMySlot, updateMyBookingStatus } from './actions';

export default async function StaffSchedulePage() {
  const profile = await requireRole(['staff', 'admin'], '/staff');
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;

  if (!profile.stylistId) {
    return (
      <div className="container" style={{ padding: '48px 24px', maxWidth: 680 }}>
        <StaffHeader profile={profile} userMetadata={userMetadata} />
        <div className="card" style={{ padding: 28 }}>
          <span className="eyebrow">Acceso de Especialista</span>
          <h1 className="h-sub" style={{ margin: '6px 0 8px' }}>
            Casi listo, {profile.fullName ?? 'equipo'}
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Tu cuenta tiene acceso de empleado, pero aún no está vinculada a un perfil de
            especialista. Pide a un administrador que abra <b>Equipo y Roles</b> y vincule tu
            usuario a tu tarjeta de especialista.
          </p>
        </div>
      </div>
    );
  }

  const today = spaDayWindow(0);
  const weekEnd = spaDayWindow(7);
  const [bookings, upcoming, services, stylistRow, blocksRes] = await Promise.all([
    getMyAssignedBookings({ stylistId: profile.stylistId, from: today.from, to: today.to }),
    getMyAssignedBookings({ stylistId: profile.stylistId, from: today.to, to: weekEnd.to }),
    getServices(),
    sb
      .from('stylists')
      .select('name, role, tags, is_active')
      .eq('id', profile.stylistId)
      .single(),
    sb
      .from('blocked_slots')
      .select('id, starts_at, ends_at, reason')
      .eq('stylist_id', profile.stylistId)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at'),
  ]);

  const card: MyCardData = {
    name: stylistRow.data?.name ?? profile.fullName ?? 'Especialista',
    role: stylistRow.data?.role ?? '',
    tags: stylistRow.data?.tags ?? [],
    is_active: stylistRow.data?.is_active ?? false,
  };

  return (
    <div className="container" style={{ padding: '36px 24px 72px', maxWidth: 880 }}>
      <StaffHeader
        profile={profile}
        userMetadata={userMetadata}
        extra={
          profile.role === 'admin' ? (
            <Link href="/admin" className="btn btn--ghost">
              Panel Admin →
            </Link>
          ) : undefined
        }
      />

      <MyCardEditor card={card} needsSetup={cardNeedsSetup(card)} />

      <ScheduleView
        stylistName={card.name}
        todayKey={spaDayKey(0)}
        nowIso={new Date().toISOString()}
        services={services.map((s) => ({ id: s.id, name: s.name }))}
        initialBookings={bookings}
        initialUpcoming={upcoming}
        initialBlocks={(blocksRes.data ?? []) as BlockedSlotRow[]}
        actions={{
          onStatus: updateMyBookingStatus,
          onBlock: blockMySlot,
          onUnblock: unblockMySlot,
        }}
      />
    </div>
  );
}
