import { createClient } from '@/lib/supabase/server';
import { StatTiles } from '@/components/admin/stat-tiles';
import { BookingsTable } from '@/components/admin/bookings-table';
import { LoadError } from '@/components/admin/load-error';
import { splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';

export default async function AdminOverviewPage() {
  const sb = await createClient();
  const [bookingsRes, servicesRes, stylistsRes] = await Promise.all([
    sb
      .from('bookings')
      .select('*, services(name), stylists(name)')
      .order('starts_at', { ascending: true })
      .limit(100),
    sb.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('stylists').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const rows = (bookingsRes.data ?? []) as unknown as BookingJoinRow[];
  const { today, upcoming } = splitTodayUpcoming(rows);
  const confirmed = rows.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Operaciones</span>
          <h1 className="ahead__title">Resumen General</h1>
        </div>
      </div>

      <LoadError what="citas" error={bookingsRes.error} />

      <StatTiles
        tiles={[
          { label: 'Citas de hoy', value: today.length, accent: true },
          { label: 'Próximas citas', value: upcoming.length },
          { label: 'Confirmadas', value: confirmed },
          {
            label: 'Tratamientos activos',
            value: servicesRes.count ?? 0,
            hint: `${stylistsRes.count ?? 0} especialistas`,
          },
        ]}
      />

      <section style={{ marginBottom: 36 }}>
        <h2 className="h-sub" style={{ marginBottom: 14 }}>
          Agenda de hoy
        </h2>
        <BookingsTable rows={today} emptyLabel="No hay citas programadas para hoy." />
      </section>

      <section>
        <h2 className="h-sub" style={{ marginBottom: 14 }}>
          Próximas citas
        </h2>
        <BookingsTable rows={upcoming} emptyLabel="No hay próximas citas en agenda." />
      </section>
    </div>
  );
}
