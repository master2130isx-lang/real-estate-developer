/**
 * Rate Limiter en memoria para protección de API routes.
 * 
 * Usa una ventana deslizante simple. En Vercel Serverless, cada instancia
 * mantiene su propio estado en memoria, lo que significa que el rate limiting
 * no es perfecto entre instancias — pero sigue siendo efectivo contra
 * ataques de fuerza bruta desde una misma IP contra la misma instancia.
 *
 * Para producción de alto tráfico, considerar migrar a Upstash Redis
 * (@upstash/ratelimit) para estado compartido entre instancias.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Almacén en memoria por clave (IP + ruta)
const store = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar fugas de memoria
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }

  // Protección contra crecimiento excesivo del store
  if (store.size > 10000) {
    store.clear();
  }
}

export interface RateLimitConfig {
  /** Número máximo de peticiones permitidas en la ventana */
  maxRequests: number;
  /** Duración de la ventana en segundos */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Verifica si una petición está dentro del límite de rate.
 * @param key - Identificador único (normalmente IP + ruta)
 * @param config - Configuración de límites
 * @returns Resultado indicando si la petición está permitida
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const existing = store.get(key);

  // Si no hay entrada o la ventana expiró, crear nueva
  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Incrementar contador
  existing.count++;
  store.set(key, existing);

  if (existing.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Extrae la IP del cliente de los headers de la request.
 * Funciona con Vercel, Cloudflare y proxies estándar.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

// ============================================================================
// CONFIGURACIONES PREDEFINIDAS POR RUTA
// ============================================================================

/** Login: 5 intentos por minuto por IP (protección contra fuerza bruta) */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

/** Registro de leads: 10 por minuto por IP (protección contra spam de bots) */
export const LEAD_CREATION_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/** Envío de mensajes de Telegram test: 3 por minuto */
export const TELEGRAM_TEST_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowSeconds: 60,
};

/** Lectura general de APIs: 60 por minuto por IP */
export const GENERAL_READ_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
};
