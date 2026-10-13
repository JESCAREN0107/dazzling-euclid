export type Role = 'user' | 'staff' | 'admin';

export const ROLE_LABELS: Record<Role, string> = {
  user: 'Cliente',
  staff: 'Empleado (Especialista)',
  admin: 'Administrador',
};

export function roleCanBook(role: Role | null): boolean {
  return role !== 'staff';
}

export function routeForRole(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'staff') return '/staff';
  return '/?account=bookings';
}
