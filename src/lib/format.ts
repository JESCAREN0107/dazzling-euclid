import type { ServiceCategory } from '@/lib/supabase/types';

export function money(n: number): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
  return `${formatted} MXN`;
}

export function minutesToLabel(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  limpieza: 'Limpieza Profunda',
  hidratacion: 'Hidratación & Glow',
  antiedad: 'Rejuvenecimiento & Lifting',
  acne: 'Control Acné & Piel Grasa',
  paquetes: 'Rituales & Paquetes Spa',
};
