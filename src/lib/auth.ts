import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

// ============================================================================
// CONSTANTES DE SEGURIDAD
// ============================================================================

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const ACTION_TOKEN_DURATION_MS = 48 * 60 * 60 * 1000; // 48 horas para tokens de acción de Telegram
const COOKIE_NAME = 'advisor_session';

/**
 * Obtiene la clave secreta para firmar sesiones.
 * Usa HMAC_SESSION_SECRET de las variables de entorno, o genera una derivada
 * del SUPABASE_SERVICE_ROLE_KEY como respaldo determinístico.
 */
function getSigningKey(): string {
  const explicit = process.env.HMAC_SESSION_SECRET;
  if (explicit && explicit.length >= 32) return explicit;

  // Derivar de la service role key si existe (siempre determinista)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey.length > 20) {
    return createHmac('sha256', 'nextjs-session-key')
      .update(serviceKey)
      .digest('hex');
  }

  // Último recurso: clave fija + ADMIN_PASSWORD (no ideal pero mejor que nada firmado)
  const adminPwd = process.env.ADMIN_PASSWORD || '';
  return createHmac('sha256', 'fallback-session-signing-key-v1')
    .update(adminPwd + '-immobiliaria-session')
    .digest('hex');
}

// ============================================================================
// FIRMA Y VERIFICACIÓN DE SESIONES (HMAC-SHA256)
// ============================================================================

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

/**
 * Crea un valor de cookie firmado con HMAC-SHA256
 * Formato: base64(JSON) + '.' + hmac_hex
 */
export function signSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json, 'utf-8').toString('base64url');
  const signature = createHmac('sha256', getSigningKey())
    .update(encoded)
    .digest('hex');
  return `${encoded}.${signature}`;
}

/**
 * Verifica y decodifica una cookie firmada.
 * Retorna el payload si es válido y no expirado, o null si fue alterado.
 */
export function verifySession(cookieValue: string): SessionPayload | null {
  if (!cookieValue || !cookieValue.includes('.')) return null;

  const lastDotIndex = cookieValue.lastIndexOf('.');
  const encoded = cookieValue.substring(0, lastDotIndex);
  const signature = cookieValue.substring(lastDotIndex + 1);

  if (!encoded || !signature) return null;

  // Verificar firma con comparación de tiempo constante
  const expectedSig = createHmac('sha256', getSigningKey())
    .update(encoded)
    .digest('hex');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  } catch {
    return null;
  }

  // Decodificar payload
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(json) as SessionPayload;

    // Verificar expiración
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

// ============================================================================
// CREACIÓN DE COOKIES DE SESIÓN SEGURAS
// ============================================================================

/**
 * Establece una cookie de sesión firmada en la respuesta
 */
export function setSessionCookie(
  response: NextResponse,
  userId: string,
  email: string,
  isHttps: boolean
): void {
  const payload: SessionPayload = {
    userId,
    email,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  response.cookies.set(COOKIE_NAME, signSession(payload), {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 días en segundos
  });
}

// ============================================================================
// VALIDACIÓN DE SESIÓN PARA API ROUTES
// ============================================================================

/**
 * Extrae y valida la sesión del asesor desde la cookie de la request.
 */
export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const sessionCookie = req.cookies.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;

  // Solo se aceptan cookies firmadas (base64url.hmac). El formato legacy en JSON plano
  // se eliminó porque permitía fabricar una sesión válida sin credenciales.
  return verifySession(sessionCookie.value);
}

/**
 * Verifica si la request tiene una sesión válida de asesor autenticado.
 * Retorna un NextResponse con 401 si no, o null si la sesión es válida.
 */
export function requireAuth(req: NextRequest): NextResponse | null {
  const session = getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Acceso denegado. Inicia sesión en /login para acceder a este recurso.',
      },
      { status: 401 }
    );
  }

  return null; // Sesión válida, continuar
}

/**
 * Verifica si la sesión corresponde al desarrollador/administrador principal
 */
export function isDeveloperSession(req: NextRequest): boolean {
  const session = getSessionFromRequest(req);
  if (!session) return false;

  const adminEmail = (process.env.ADMIN_EMAIL || 'master2130.isx@gmail.com').trim().toLowerCase();
  const sessionEmail = session.email.trim().toLowerCase();

  return sessionEmail === adminEmail || sessionEmail === 'master2130.isx@gmail.com';
}

// ============================================================================
// TOKENS DE ACCIÓN PARA TELEGRAM (URLs firmadas de un solo uso)
// ============================================================================

/**
 * Genera un token HMAC firmado para las URLs de acción de Telegram.
 * Incluye el leadId y la acción en la firma para evitar manipulación.
 */
export function generateActionToken(leadId: string, action: string): string {
  const expiresAt = Date.now() + ACTION_TOKEN_DURATION_MS;
  const data = `${leadId}:${action}:${expiresAt}`;
  const signature = createHmac('sha256', getSigningKey())
    .update(data)
    .digest('hex')
    .substring(0, 16); // Token corto para URLs legibles
  return `${expiresAt.toString(36)}.${signature}`;
}

/**
 * Verifica un token de acción de Telegram.
 * Retorna true si el token es válido y no ha expirado.
 */
export function verifyActionToken(
  token: string,
  leadId: string,
  action: string
): boolean {
  if (!token || !token.includes('.')) return false;

  const [expiresAtB36, signature] = token.split('.');
  if (!expiresAtB36 || !signature) return false;

  const expiresAt = parseInt(expiresAtB36, 36);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const data = `${leadId}:${action}:${expiresAt}`;
  const expectedSig = createHmac('sha256', getSigningKey())
    .update(data)
    .digest('hex')
    .substring(0, 16);

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return signature === expectedSig; // Fallback para tokens cortos
  }
}
