'use client';
import { useState, useTransition } from 'react';
import {
  applyReschedule,
  applyStatus,
  completionPercent,
  groupByDay,
  nextUp,
  serviceLabel,
  type AdminBookingStatus,
  type StaffBooking,
  type StaffBookingStatus,
} from '@/lib/staff/view';
import { SPA_TZ } from '@/lib/time';

export type BlockedSlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
};

type Actions = {
  onStatus: (bookingId: string, status: StaffBookingStatus) => Promise<{ ok: true } | { error: string }>;
  onBlock: (fd: FormData) => Promise<{ ok: true; row: BlockedSlotRow } | { error: string }>;
  onUnblock: (blockId: string) => Promise<{ ok: true } | { error: string }>;
  onRestore?: (bookingId: string) => Promise<{ ok: true } | { error: string }>;
  onDeleteBooking?: (bookingId: string) => Promise<{ ok: true } | { error: string }>;
  onReschedule?: (
    bookingId: string,
    fd: FormData,
  ) => Promise<{ ok: true; starts_at: string; ends_at: string } | { error: string }>;
};

const timeFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const blockFmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: SPA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const hm24Fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: SPA_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'confirmada',
  completed: 'completada',
  cancelled: 'cancelada',
  no_show: 'inasistencia',
};

export function ScheduleView({
  stylistName,
  todayKey,
  nowIso,
  services,
  initialBookings,
  initialUpcoming,
  initialBlocks,
  actions,
}: {
  stylistName: string;
  todayKey: string;
  nowIso: string;
  services: { id: string; name: string }[];
  initialBookings: StaffBooking[];
  initialUpcoming: StaffBooking[];
  initialBlocks: BlockedSlotRow[];
  actions: Actions;
}) {
  const [bookings, setBookings] = useState<StaffBooking[]>(initialBookings);
  const [upcoming, setUpcoming] = useState<StaffBooking[]>(initialUpcoming);
  const [blocks, setBlocks] = useState<BlockedSlotRow[]>(initialBlocks);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const next = nextUp(bookings, nowIso);
  const pct = completionPercent(bookings);
  const doneCount = bookings.filter((b) => b.status === 'completed').length;
  const openCount = bookings.filter((b) => b.status === 'confirmed').length;
  const upcomingGroups = groupByDay(upcoming);

  function mark(id: string, status: StaffBookingStatus) {
    setError(null);
    startTransition(async () => {
      const res = await actions.onStatus(id, status);
      if ('ok' in res) {
        setBookings((list) => applyStatus(list, id, status));
        setUpcoming((list) => applyStatus(list, id, status));
      } else {
        setError(res.error);
      }
    });
  }

  function restore(id: string) {
    if (!actions.onRestore) return;
    const onRestore = actions.onRestore;
    setError(null);
    startTransition(async () => {
      const res = await onRestore(id);
      if ('ok' in res) {
        const nextStatus: AdminBookingStatus = 'confirmed';
        setBookings((list) => applyStatus(list, id, nextStatus));
        setUpcoming((list) => applyStatus(list, id, nextStatus));
      } else {
        setError(res.error);
      }
    });
  }

  function removeBooking(b: StaffBooking) {
    if (!actions.onDeleteBooking) return;
    if (
      !window.confirm(
        `¿Eliminar permanentemente la cita ${b.reference} (${b.customer_name})? Esta acción no se puede deshacer.`,
      )
    )
      return;
    const onDelete = actions.onDeleteBooking;
    setError(null);
    startTransition(async () => {
      const res = await onDelete(b.id);
      if ('ok' in res) {
        setBookings((list) => list.filter((x) => x.id !== b.id));
        setUpcoming((list) => list.filter((x) => x.id !== b.id));
      } else {
        setError(res.error);
      }
    });
  }

  function reschedule(id: string, fd: FormData) {
    if (!actions.onReschedule) return;
    const onReschedule = actions.onReschedule;
    setError(null);
    startTransition(async () => {
      const res = await onReschedule(id, fd);
      if ('ok' in res) {
        const movedToDay = dayKeyFmt.format(new Date(res.starts_at));
        if (movedToDay === todayKey) {
          setBookings((list) => applyReschedule(list, id, res.starts_at, res.ends_at));
        } else {
          const moving = bookings.find((b) => b.id === id);
          setBookings((list) => list.filter((b) => b.id !== id));
          if (moving && movedToDay > todayKey) {
            setUpcoming((list) =>
              applyReschedule([...list, moving], id, res.starts_at, res.ends_at),
            );
          }
        }
        setUpcoming((list) =>
          movedToDay > todayKey
            ? applyReschedule(list, id, res.starts_at, res.ends_at)
            : list.filter((b) => b.id !== id),
        );
        setEditingId(null);
      } else {
        setError(res.error);
      }
    });
  }

  function addBlock(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await actions.onBlock(fd);
      if ('ok' in res) {
        setBlocks((list) =>
          [...list, res.row].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        );
      } else {
        setError(res.error);
      }
    });
  }

  function removeBlock(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await actions.onUnblock(id);
      if ('ok' in res) setBlocks((list) => list.filter((b) => b.id !== id));
      else setError(res.error);
    });
  }

  function renderBookingRow(b: StaffBooking, variant: 'today' | 'upcoming') {
    const isNext = variant === 'today' && next?.id === b.id;
    const open = b.status === 'confirmed';
    const editing = editingId === b.id;
    const borderColor = isNext
      ? 'var(--accent)'
      : b.status === 'completed'
        ? 'rgba(110,200,130,0.4)'
        : 'var(--border)';

    return (
      <li key={b.id} className="card" style={{ padding: 18, borderColor }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--accent-text)',
                }}
              >
                {timeFmt.format(new Date(b.starts_at))} – {timeFmt.format(new Date(b.ends_at))}
              </span>
              {isNext && (
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Siguiente
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                · {STATUS_LABELS[b.status] ?? b.status}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              {b.customer_name}{' '}
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                · {serviceLabel(services, b.service_id)}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              <a href={`tel:${b.customer_phone}`} style={{ color: 'var(--muted)' }}>
                {b.customer_phone}
              </a>{' '}
              · ref {b.reference}
            </div>
            {b.notes && (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  color: 'var(--fg)',
                  background: 'var(--elev)',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
              >
                “{b.notes}”
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {open && variant === 'today' && (
              <>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={pending}
                  onClick={() => mark(b.id, 'completed')}
                >
                  Completada ✓
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={pending}
                  onClick={() => mark(b.id, 'no_show')}
                >
                  No asistió
                </button>
              </>
            )}
            {open && (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={pending}
                onClick={() => mark(b.id, 'cancelled')}
              >
                Cancelar
              </button>
            )}
            {!open && actions.onRestore && (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={pending}
                onClick={() => restore(b.id)}
              >
                Restaurar
              </button>
            )}
            {actions.onReschedule && (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={pending}
                onClick={() => setEditingId(editing ? null : b.id)}
              >
                {editing ? 'Cerrar' : 'Reprogramar'}
              </button>
            )}
            {actions.onDeleteBooking && (
              <button
                type="button"
                className="abtn-del"
                disabled={pending}
                onClick={() => removeBooking(b)}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>

        {editing && actions.onReschedule && (
          <form
            action={(fd) => reschedule(b.id, fd)}
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`rs-date-${b.id}`}>Fecha</label>
              <input
                id={`rs-date-${b.id}`}
                name="date"
                type="date"
                defaultValue={dayKeyFmt.format(new Date(b.starts_at))}
                required
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`rs-start-${b.id}`}>Inicio</label>
              <input
                id={`rs-start-${b.id}`}
                name="start"
                type="time"
                step={900}
                defaultValue={hm24Fmt.format(new Date(b.starts_at))}
                required
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor={`rs-end-${b.id}`}>Fin</label>
              <input
                id={`rs-end-${b.id}`}
                name="end"
                type="time"
                step={900}
                defaultValue={hm24Fmt.format(new Date(b.ends_at))}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={pending}>
              Guardar horario
            </button>
          </form>
        )}
      </li>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" style={{ color: 'var(--error)', marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Especialista
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{stylistName}</div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Pendientes hoy
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{openCount}</div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Completadas
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>
            {doneCount}{' '}
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>({pct}%)</span>
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Siguiente
          </div>
          <div style={{ fontSize: 14, color: next ? 'var(--accent-text)' : 'var(--muted)' }}>
            {next ? `${timeFmt.format(new Date(next.starts_at))} · ${next.customer_name}` : 'Libre'}
          </div>
        </div>
      </div>

      <h2 className="h-sub" style={{ marginBottom: 12 }}>
        Agenda de hoy
      </h2>
      {bookings.length === 0 ? (
        <div className="card" style={{ padding: 20, color: 'var(--muted)', marginBottom: 28 }}>
          Aún no hay citas programadas para hoy.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'grid', gap: 10 }}>
          {bookings.map((b) => renderBookingRow(b, 'today'))}
        </ul>
      )}

      <h2 className="h-sub" style={{ marginBottom: 4 }}>
        Próximos 7 días
      </h2>
      <p className="step__hint" style={{ marginTop: 0, marginBottom: 12 }}>
        Vista anticipada para preparar tus cabinas o bloquear tiempo personal.
      </p>
      {upcomingGroups.length === 0 ? (
        <div className="card" style={{ padding: 20, color: 'var(--muted)', marginBottom: 28 }}>
          No hay citas programadas en los próximos 7 días.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18, marginBottom: 28 }}>
          {upcomingGroups.map((g) => (
            <div key={g.dayKey}>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-text)',
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {g.dayLabel} · {g.items.length} cita{g.items.length === 1 ? '' : 's'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {g.items.map((b) => renderBookingRow(b, 'upcoming'))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <h2 className="h-sub" style={{ marginBottom: 8 }}>
        Bloquear horario / descanso
      </h2>
      <p className="step__hint" style={{ marginTop: 0, marginBottom: 12 }}>
        Los intervalos bloqueados te retiran de los horarios disponibles en el motor de reservas.
      </p>

      <form
        action={addBlock}
        className="card"
        style={{
          padding: 18,
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          alignItems: 'end',
        }}
      >
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="blk-date">Fecha</label>
          <input
            id="blk-date"
            name="date"
            type="date"
            defaultValue={todayKey}
            min={todayKey}
            required
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="blk-start">Inicio</label>
          <input
            id="blk-start"
            name="start"
            type="time"
            defaultValue="13:00"
            step={900}
            required
          />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="blk-end">Fin</label>
          <input id="blk-end" name="end" type="time" defaultValue="14:00" step={900} required />
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="blk-reason">Motivo</label>
          <input id="blk-reason" name="reason" placeholder="Comida, capacitación…" maxLength={120} />
        </div>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          Bloquear horario
        </button>
      </form>

      {blocks.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {blocks.map((bl) => (
            <li
              key={bl.id}
              className="card"
              style={{
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--accent-text)',
                  }}
                >
                  {blockFmt.format(new Date(bl.starts_at))} →{' '}
                  {timeFmt.format(new Date(bl.ends_at))}
                </span>
                {bl.reason && (
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}> · {bl.reason}</span>
                )}
              </div>
              <button
                type="button"
                className="btn btn--ghost"
                disabled={pending}
                onClick={() => removeBlock(bl.id)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
