/**
 * Utilidades de fecha en la zona horaria del negocio.
 *
 * `new Date().toISOString()` devuelve la fecha en UTC: en Monterrey (UTC-6), después de
 * las 6:00 PM "hoy" ya sería mañana. Estas funciones calculan la fecha local real.
 */

export const DEFAULT_TIMEZONE = 'America/Monterrey';

/** Fecha local en formato YYYY-MM-DD (compatible con <input type="date">). */
export function localDateISO(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Fecha local de hoy (YYYY-MM-DD). */
export function todayLocalISO(timeZone: string = DEFAULT_TIMEZONE): string {
  return localDateISO(new Date(), timeZone);
}

/** Fecha local desplazada N días a partir de hoy (YYYY-MM-DD). */
export function addDaysLocalISO(days: number, timeZone: string = DEFAULT_TIMEZONE): string {
  return localDateISO(new Date(Date.now() + days * 24 * 60 * 60 * 1000), timeZone);
}

/** Marca de tiempo local legible "YYYY-MM-DD HH:mm" para notas y bitácoras. */
export function localTimestamp(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
