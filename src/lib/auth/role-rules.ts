import type { Role } from '@/lib/auth/roles';

export function canSetRole(actor: Role, _targetCurrent: Role, _next: Role): boolean {
  return actor === 'admin';
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === 'admin') return ['user', 'staff', 'admin'];
  return [];
}
