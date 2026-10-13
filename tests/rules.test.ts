import { describe, expect, it } from 'vitest';
import { safeNext } from '@/lib/auth/redirect';
import { canStaffSetStatus } from '@/lib/staff/action-rules';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { computeAvailableSlots } from '@/lib/availability';

describe('safeNext', () => {
  it('acepta rutas internas', () => {
    expect(safeNext('/admin/people')).toBe('/admin/people');
  });
  it.each(['//evil.com', '/\\evil.com', 'https://evil.com', '/x:y', 'admin', ''])(
    'rechaza %s',
    (v) => expect(safeNext(v)).toBeNull(),
  );
});

describe('canStaffSetStatus', () => {
  const staff = { role: 'staff' as const, stylistId: 's1' };
  it('permite completar una cita propia confirmada', () => {
    expect(canStaffSetStatus({ stylist_id: 's1', status: 'confirmed' }, staff, 'completed').ok).toBe(true);
  });
  it('rechaza citas de otra especialista', () => {
    expect(canStaffSetStatus({ stylist_id: 's2', status: 'confirmed' }, staff, 'completed')).toEqual({
      ok: false,
      reason: 'not_your_chair',
    });
  });
  it('rechaza transiciones inválidas', () => {
    const admin = { role: 'admin' as const, stylistId: null };
    expect(canStaffSetStatus({ stylist_id: 's2', status: 'completed' }, admin, 'cancelled').ok).toBe(false);
    expect(canStaffSetStatus({ stylist_id: 's2', status: 'confirmed' }, admin, 'bogus').ok).toBe(false);
  });
});

describe('canModifyBooking', () => {
  const now = Date.UTC(2026, 0, 1);
  const future = new Date(now + 86_400_000).toISOString();
  it('solo el dueño puede modificar', () => {
    expect(canModifyBooking({ user_id: 'u1', status: 'confirmed', starts_at: future }, 'u1', now).ok).toBe(true);
    expect(canModifyBooking({ user_id: 'u1', status: 'confirmed', starts_at: future }, 'u2', now).ok).toBe(false);
    expect(canModifyBooking({ user_id: null, status: 'confirmed', starts_at: future }, 'u2', now).ok).toBe(false);
  });
  it('no permite citas pasadas ni canceladas', () => {
    const past = new Date(now - 1).toISOString();
    expect(canModifyBooking({ user_id: 'u1', status: 'confirmed', starts_at: past }, 'u1', now).ok).toBe(false);
    expect(canModifyBooking({ user_id: 'u1', status: 'cancelled', starts_at: future }, 'u1', now).ok).toBe(false);
  });
});

describe('computeAvailableSlots', () => {
  it('respeta horario, duración y ocupados', () => {
    const slots = computeAvailableSlots({
      openMinute: 600,
      closeMinute: 720,
      isClosed: false,
      durationMin: 60,
      busy: [{ start: 630, end: 660 }],
    });
    expect(slots).toEqual(['11:00']);
  });
  it('día cerrado no tiene horarios', () => {
    expect(
      computeAvailableSlots({ openMinute: 600, closeMinute: 720, isClosed: true, durationMin: 30, busy: [] }),
    ).toEqual([]);
  });
});
