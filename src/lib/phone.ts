/**
 * Normaliza un teléfono mexicano al formato que espera wa.me (código de país + número, solo dígitos).
 * Acepta "8112345678", "+52 81 1234 5678", "52 1 81 1234 5678", etc.
 */
export function toWhatsAppNumber(phone: string | undefined | null): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return digits;
  if (digits.length === 13 && digits.startsWith('521')) return `52${digits.slice(3)}`;
  return digits;
}

/** Construye un enlace wa.me con mensaje prellenado. */
export function buildWhatsAppLink(phone: string | undefined | null, message?: string): string {
  const number = toWhatsAppNumber(phone);
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
}
