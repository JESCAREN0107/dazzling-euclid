export function isDeleteConfirmed(input: string | null | undefined): boolean {
  const normalized = (input ?? '').trim().toUpperCase();
  return normalized === 'ELIMINAR' || normalized === 'DELETE';
}

export function canAdminDelete(adminId: string, targetId: string): boolean {
  return adminId !== targetId;
}
