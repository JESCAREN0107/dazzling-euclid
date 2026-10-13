'use client';
import { useEffect, useState, useTransition } from 'react';
import {
  cancelMyBooking,
  rescheduleMyBooking,
  submitMyReview,
  deleteMyReview,
  listMyBookings,
  type MyBookingsData,
} from '@/app/account/actions';
import { getAvailability } from '@/app/book/actions';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { minutesToLabel } from '@/lib/format';
import { SPA_TZ, toUtcInstant } from '@/lib/time';
import { StarPicker, StarRow } from '@/components/reviews/star-row';
import { GuestRecent } from '@/components/booking/guest-recent';
import { useBooking } from '@/components/booking/booking-provider';

type Row = MyBookingsData['bookings'][number];
type Review = MyBookingsData['reviews'][string];

const fmt = new Intl.DateTimeFormat('es-MX', {
  timeZone: SPA_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const dateInputFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: SPA_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'confirmada',
  completed: 'completada',
  cancelled: 'cancelada',
  no_show: 'inasistencia',
};

function hhmmToMinute(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function BookingsPanel({
  active = true,
  initial,
}: {
  active?: boolean;
  initial?: MyBookingsData;
}) {
  const { openBooking } = useBooking();
  const [data, setData] = useState<MyBookingsData | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  const [editing, setEditing] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState<string>('');
  const [slots, setSlots] = useState<string[]>([]);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewErr, setReviewErr] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    listMyBookings().then((res) => {
      if (cancelled) return;
      setData(res);
      setNowIso(new Date().toISOString());
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const rows = data?.bookings ?? [];
  const reviews = data?.reviews ?? {};

  function openReschedule(b: Row) {
    setError(null);
    const d = dateInputFmt.format(new Date(b.starts_at));
    setEditing(b.id);
    setDateStr(d);
    setPickedTime(null);
    loadSlots(b, d);
  }

  async function loadSlots(b: Row, d: string) {
    const serviceIds =
      b.service_ids && b.service_ids.length > 0 ? b.service_ids : [b.service_id];
    const res = await getAvailability({
      serviceIds,
      stylistId: b.stylist_id,
      date: d,
    });
    setSlots(res.slots);
  }

  function confirmReschedule(b: Row) {
    if (!pickedTime) return;
    const duration = b.services?.duration_min ?? 60;
    const startMin = hhmmToMinute(pickedTime);
    const newStart = toUtcInstant(dateStr, startMin);
    const newEnd = toUtcInstant(dateStr, startMin + duration);
    startTransition(async () => {
      const res = await rescheduleMyBooking(b.id, newStart, newEnd);
      if ('error' in res) setError(res.error);
      else {
        setData((cur) =>
          cur
            ? {
                ...cur,
                bookings: cur.bookings.map((r) =>
                  r.id === b.id ? { ...r, starts_at: newStart, ends_at: newEnd } : r,
                ),
              }
            : cur,
        );
        setEditing(null);
      }
    });
  }

  function cancel(b: Row) {
    if (!confirm('¿Deseas cancelar esta cita?')) return;
    startTransition(async () => {
      const res = await cancelMyBooking(b.id);
      if ('error' in res) setError(res.error);
      else
        setData((cur) =>
          cur
            ? {
                ...cur,
                bookings: cur.bookings.map((r) =>
                  r.id === b.id ? { ...r, status: 'cancelled' } : r,
                ),
              }
            : cur,
        );
    });
  }

  function openReview(b: Row) {
    const existing = reviews[b.id];
    setReviewingId(b.id);
    setStars(existing?.rating ?? 5);
    setComment(existing?.comment ?? '');
    setReviewErr(null);
  }

  function saveReview(bookingId: string) {
    setReviewErr(null);
    startTransition(async () => {
      const res = await submitMyReview(bookingId, stars, comment);
      if ('error' in res) setReviewErr(res.error);
      else {
        setData((cur) =>
          cur
            ? {
                ...cur,
                reviews: {
                  ...cur.reviews,
                  [bookingId]: { rating: stars, comment: comment.trim() },
                },
              }
            : cur,
        );
        setReviewingId(null);
      }
    });
  }

  function removeReview(bookingId: string) {
    if (!confirm('¿Eliminar tu reseña de esta visita?')) return;
    setReviewErr(null);
    startTransition(async () => {
      const res = await deleteMyReview(bookingId);
      if ('error' in res) setReviewErr(res.error);
      else {
        setData((cur) => {
          if (!cur) return cur;
          const next: Record<string, Review> = { ...cur.reviews };
          delete next[bookingId];
          return { ...cur, reviews: next };
        });
        setReviewingId(null);
      }
    });
  }

  if (loading) return <p className="step__hint">Cargando tus citas…</p>;

  return (
    <div>
      {error && (
        <p style={{ color: 'var(--error)', marginBottom: 12 }} role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="card">
          <p style={{ margin: '0 0 12px', color: 'var(--muted)' }}>
            Aún no tienes citas vinculadas a tu cuenta.
          </p>
          <button type="button" className="btn btn--primary" onClick={() => openBooking()}>
            Reservar tu primera cita
          </button>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {rows.map((b) => {
            const check = canModifyBooking(b, new Date(nowIso));
            const open = editing === b.id;
            const myReview = reviews[b.id];
            const canReview = b.status === 'completed' && !!b.stylist_id;
            const reviewOpen = reviewingId === b.id;
            return (
              <li key={b.id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--accent-text)',
                      }}
                    >
                      {b.reference} · {STATUS_LABELS[b.status] ?? b.status}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {b.services?.name ?? 'Tratamiento facial'}{' '}
                      <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                        con {b.stylists?.name ?? 'Cualquier especialista'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {fmt.format(new Date(b.starts_at))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {check.ok ? (
                      <>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={pending}
                          onClick={() => (open ? setEditing(null) : openReschedule(b))}
                        >
                          {open ? 'Cerrar' : 'Reprogramar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={pending}
                          onClick={() => cancel(b)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : canReview ? (
                      myReview && !reviewOpen ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <StarRow rating={myReview.rating} size={14} />
                          <button
                            type="button"
                            className="btn btn--ghost"
                            disabled={pending}
                            onClick={() => openReview(b)}
                            style={{ fontSize: 12, padding: '6px 12px' }}
                          >
                            Editar reseña
                          </button>
                        </div>
                      ) : !reviewOpen ? (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={pending}
                          onClick={() => openReview(b)}
                        >
                          Calificar visita ★
                        </button>
                      ) : null
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--subtle)' }}>{check.reason}</span>
                    )}
                  </div>
                </div>

                {canReview && myReview?.comment && !reviewOpen && (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    “{myReview.comment}”
                  </p>
                )}

                {reviewOpen && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: '1px solid var(--border)',
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                        ¿Cómo fue tu sesión con {b.stylists?.name}?
                      </span>
                      <StarPicker value={stars} onChange={setStars} />
                    </div>
                    <textarea
                      rows={2}
                      maxLength={400}
                      placeholder="Comparte un comentario breve (opcional)…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="review-composer__input"
                    />
                    {reviewErr && (
                      <p className="step__hint" style={{ color: 'var(--error)', margin: 0 }}>
                        {reviewErr}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {myReview && (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={pending}
                          onClick={() => removeReview(b.id)}
                          style={{ marginRight: 'auto', color: 'var(--error)' }}
                        >
                          Eliminar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => setReviewingId(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        disabled={pending}
                        onClick={() => saveReview(b.id)}
                      >
                        {pending ? 'Guardando…' : myReview ? 'Actualizar reseña' : 'Publicar reseña'}
                      </button>
                    </div>
                  </div>
                )}

                {open && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <label
                      style={{
                        fontSize: 12,
                        color: 'var(--muted)',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Nueva fecha
                      <input
                        type="date"
                        value={dateStr}
                        min={dateInputFmt.format(new Date(nowIso))}
                        onChange={(e) => {
                          setDateStr(e.target.value);
                          setPickedTime(null);
                          loadSlots(b, e.target.value);
                        }}
                        style={{
                          marginLeft: 10,
                          padding: '6px 10px',
                          background: 'var(--elev)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--fg)',
                        }}
                      />
                    </label>
                    <div className="slot-grid" style={{ marginTop: 10 }}>
                      {slots.length === 0 ? (
                        <p className="step__hint">No hay horarios disponibles en esta fecha.</p>
                      ) : (
                        slots.map((hhmm) => (
                          <button
                            type="button"
                            key={hhmm}
                            aria-pressed={pickedTime === hhmm}
                            onClick={() => setPickedTime(hhmm)}
                            className={`slot-btn${pickedTime === hhmm ? ' selected' : ''}`}
                          >
                            {minutesToLabel(hhmmToMinute(hhmm))}
                          </button>
                        ))
                      )}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="btn btn--primary"
                        disabled={pickedTime === null || pending}
                        onClick={() => confirmReschedule(b)}
                      >
                        {pending ? 'Guardando…' : 'Confirmar nuevo horario'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <GuestRecent />
    </div>
  );
}
