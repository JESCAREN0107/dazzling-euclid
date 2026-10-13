export type ModifiableBooking = {
  user_id?: string | null;
  status: string;
  starts_at: string;
};

export type ModifyDecision = { ok: true } | { ok: false; reason: string };

export function canModifyBooking(
  booking: ModifiableBooking,
  userIdOrNow: string | Date | number,
  nowMs?: number,
): ModifyDecision {
  if (typeof userIdOrNow === 'string' && typeof nowMs === 'number') {
    if (booking.user_id == null || booking.user_id !== userIdOrNow) {
      return { ok: false, reason: 'not_owner' };
    }
    if (booking.status !== 'confirmed') {
      return { ok: false, reason: 'not_active' };
    }
    if (new Date(booking.starts_at).getTime() < nowMs) {
      return { ok: false, reason: 'in_past' };
    }
    return { ok: true };
  }

  const targetNowMs =
    typeof userIdOrNow === 'number'
      ? userIdOrNow
      : userIdOrNow instanceof Date
        ? userIdOrNow.getTime()
        : Date.now();

  if (booking.status !== 'confirmed') {
    return {
      ok: false,
      reason:
        booking.status === 'cancelled'
          ? 'Cancelada'
          : booking.status === 'completed'
            ? 'Completada'
            : 'Inasistencia',
    };
  }
  if (new Date(booking.starts_at).getTime() < targetNowMs) {
    return { ok: false, reason: 'Cita pasada' };
  }
  return { ok: true };
}
