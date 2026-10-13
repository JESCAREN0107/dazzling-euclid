import type { Role } from '@/lib/auth/roles';

export function routeForSession(
  role: Role | null,
  _stylistId: string | null,
  isGuest: boolean,
  next?: string | null,
): string {
  if (next) return next;
  if (role === 'admin') return '/admin';
  if (role === 'staff') return '/staff';
  if (isGuest) return '/#services';
  return '/';
}
