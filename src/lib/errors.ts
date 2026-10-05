/** Mensaje legible de un error capturado en un `catch` (cuyo tipo es `unknown`). */
export function getErrorMessage(error: unknown, fallback = 'Error inesperado'): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}
