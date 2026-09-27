import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

// ============================================================================
// PROXY DE SEGURIDAD — Next.js 16 (antes middleware.ts)
// ============================================================================
// Protege:
//   1. /panel/* — Redirige a /login si no hay sesión válida
//   2. /api/leads (GET, DELETE, PATCH) — Requiere sesión para lectura/escritura
//   3. /api/config (POST) — Requiere sesión para modificar configuración
//   4. /api/properties (POST, PUT, DELETE) — Requiere sesión para gestión de inventario
//   5. /api/telegram/test — Requiere sesión para enviar mensajes de prueba
//   6. /api/telegram/setup-webhook — Requiere sesión para modificar webhook
//   7. /api/db/status — Requiere sesión para diagnóstico
//
// Rutas PÚBLICAS (no protegidas):
//   - /api/leads (POST) — Permitir registro de prospectos desde la landing
//   - /api/config (GET) — Permitir lectura de configuración pública
//   - /api/properties (GET) — Permitir lectura del catálogo de modelos
//   - /api/telegram/webhook (POST) — Recibir callbacks de Telegram
//   - /api/telegram/action (GET) — Protegida con token HMAC individual
// ============================================================================

/**
 * Extrae y valida la sesión del asesor desde la cookie.
 * Soporta formato firmado (nuevo) y JSON plano (legacy para transición).
 */
function validateSessionCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('advisor_session');
  if (!sessionCookie || !sessionCookie.value) return false;

  const value = sessionCookie.value;

  // 1. Formato firmado nuevo (base64url.hmac)
  if (value.includes('.') && !value.startsWith('{')) {
    return verifySession(value) !== null;
  }

  // 2. Formato legacy (JSON plano) — aceptar temporalmente
  try {
    const session = JSON.parse(value);
    if (session.expiresAt && Date.now() > session.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

// Rutas de API que requieren autenticación (método específico)
const PROTECTED_API_ROUTES: Array<{
  path: string;
  methods?: string[]; // Si vacío o undefined, protege TODOS los métodos
}> = [
  // /api/leads: GET y DELETE requieren sesión; POST es público (registro de prospectos)
  { path: '/api/leads', methods: ['GET', 'DELETE'] },
  // /api/leads/[id]: GET y PATCH requieren sesión
  { path: '/api/leads/', methods: ['GET', 'PATCH'] },
  // /api/config: POST requiere sesión; GET es público
  { path: '/api/config', methods: ['POST'] },
  // /api/properties: POST requiere sesión; GET es público
  { path: '/api/properties', methods: ['POST'] },
  // /api/properties/[id]: PUT y DELETE requieren sesión; GET es público
  { path: '/api/properties/', methods: ['PUT', 'DELETE'] },
  // /api/properties/upload: POST requiere sesión
  { path: '/api/properties/upload', methods: ['POST'] },
  // /api/telegram/test: todos los métodos
  { path: '/api/telegram/test' },
  // /api/telegram/setup-webhook: todos los métodos
  { path: '/api/telegram/setup-webhook' },
  // /api/db/status: todos los métodos
  { path: '/api/db/status' },
];

function isProtectedApiRoute(pathname: string, method: string): boolean {
  for (const route of PROTECTED_API_ROUTES) {
    // Coincidencia exacta o coincidencia de prefijo para rutas dinámicas
    const matches =
      pathname === route.path ||
      (route.path.endsWith('/') && pathname.startsWith(route.path));

    if (matches) {
      // Si no hay métodos específicos, proteger todos
      if (!route.methods || route.methods.length === 0) return true;
      // Verificar si el método está en la lista de protegidos
      return route.methods.includes(method.toUpperCase());
    }
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // ========================================================================
  // 1. PROTECCIÓN DE RUTA /panel/* — Redirigir a login si no hay sesión
  // ========================================================================
  if (pathname.startsWith('/panel')) {
    if (!validateSessionCookie(request)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Limpiar cookie corrupta/expirada si existe
      response.cookies.delete('advisor_session');
      return response;
    }
  }

  // ========================================================================
  // 2. PROTECCIÓN DE API ROUTES ADMINISTRATIVAS — Retornar 401 JSON
  // ========================================================================
  if (pathname.startsWith('/api/') && isProtectedApiRoute(pathname, method)) {
    if (!validateSessionCookie(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Acceso denegado. Inicia sesión en /login para acceder a este recurso.',
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/panel/:path*',
    '/api/leads/:path*',
    '/api/config/:path*',
    '/api/properties/:path*',
    '/api/telegram/test/:path*',
    '/api/telegram/setup-webhook/:path*',
    '/api/db/:path*',
  ],
};
