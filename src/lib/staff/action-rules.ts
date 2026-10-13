import type { Role } from '@/lib/auth/roles';

export type StaffActor = { role: Role; stylistId: string | null };
export type ActionableBooking = { stylist_id: string | null; status: string };
export type StaffActionDecision =
  | { ok: true }
  | { ok: false; reason: 'not_your_chair' | 'not_actionable' };

const ALLOWED_FROM: Record<string, string[]> = {
  confirmed: ['completed', 'no_show', 'cancelled'],
  completed: ['confirmed'],
  no_show: ['confirmed'],
  cancelled: ['confirmed'],
};

function chairMismatch(booking: ActionableBooking, actor: StaffActor): boolean {
  if (actor.role === 'admin') return false;
  return actor.stylistId == null || booking.stylist_id !== actor.stylistId;
}

export function canStaffSetStatus(
  booking: ActionableBooking,
  actor: StaffActor,
  next: string,
): StaffActionDecision {
  if (chairMismatch(booking, actor)) return { ok: false, reason: 'not_your_chair' };
  if (!(ALLOWED_FROM[booking.status] ?? []).includes(next)) {
    return { ok: false, reason: 'not_actionable' };
  }
  return { ok: true };
}

export function canStaffReschedule(
  booking: ActionableBooking,
  actor: StaffActor,
): StaffActionDecision {
  if (chairMismatch(booking, actor)) return { ok: false, reason: 'not_your_chair' };
  if (booking.status !== 'confirmed') return { ok: false, reason: 'not_actionable' };
  return { ok: true };
}
