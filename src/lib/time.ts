export const SPA_TZ = 'America/Matamoros';

/**
 * Convierte una fecha local YYYY-MM-DD + minuto del día (0..1440) en la zona
 * horaria indicada (por defecto America/Matamoros) a un instante ISO UTC.
 * Respeta automáticamente los cambios de horario de verano fronterizo (CDT/CST).
 */
export function toUtcInstant(dateStr: string, minuteOfDay: number, tz: string = SPA_TZ): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const h = Math.floor(minuteOfDay / 60);
  const min = minuteOfDay % 60;

  // Aproximación inicial en UTC y corrección exacta por offset de la zona horaria
  const guess = Date.UTC(y!, m! - 1, d!, h, min, 0);
  const offsetMs = getTzOffsetMs(new Date(guess), tz);
  const firstPass = guess - offsetMs;
  // Segunda pasada por si el instante cruza una transición de horario de verano
  const secondOffsetMs = getTzOffsetMs(new Date(firstPass), tz);
  return new Date(guess - secondOffsetMs).toISOString();
}

function getTzOffsetMs(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(instant);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const hour = get('hour') === 24 ? 0 : get('hour');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second'),
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * Obtiene la fecha actual YYYY-MM-DD y minuto actual del día en America/Matamoros.
 */
export function nowInSpaTz(now: Date = new Date()): {
  dateStr: string;
  dayOfWeek: number;
  minuteOfDay: number;
} {
  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: SPA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = dateFmt.format(now);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SPA_TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const wk = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const wkMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const hRaw = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const h = hRaw === 24 ? 0 : hRaw;
  const min = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);

  return {
    dateStr,
    dayOfWeek: wkMap[wk] ?? 0,
    minuteOfDay: h * 60 + min,
  };
}
