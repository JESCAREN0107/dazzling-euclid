export interface MinuteInterval {
  start: number;
  end: number;
}

export interface ComputeSlotsInput {
  openMinute: number;
  closeMinute: number;
  isClosed: boolean;
  durationMin: number;
  stepMin?: number;
  busy: MinuteInterval[];
  minStartMinute?: number;
}

/**
 * Calcula los horarios disponibles (formato "HH:MM") dentro del horario laboral,
 * verificando que el tratamiento completo [t, t + durationMin) quepa antes del
 * cierre y no se traslape con ninguna cita confirmada ni horario bloqueado.
 */
export function computeAvailableSlots(input: ComputeSlotsInput): string[] {
  const {
    openMinute,
    closeMinute,
    isClosed,
    durationMin,
    stepMin = 30,
    busy,
    minStartMinute = 0,
  } = input;

  if (isClosed || durationMin <= 0 || openMinute >= closeMinute) return [];

  const firstSlot = Math.max(
    openMinute,
    Math.ceil(minStartMinute / stepMin) * stepMin,
  );

  const slots: string[] = [];
  for (let start = firstSlot; start + durationMin <= closeMinute; start += stepMin) {
    const end = start + durationMin;
    const overlaps = busy.some((b) => start < b.end && end > b.start);
    if (!overlaps) {
      slots.push(minutesToHHMM(start));
    }
  }
  return slots;
}

export function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
