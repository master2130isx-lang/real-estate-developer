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
 * Solo acepta cookies firmadas con HMAC (base64url.hmac).
 */
function validateSessionCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('advisor_session');
  if (!sessionCookie || !sessionCookie.value) return false;

  return verifySession(sessionCookie.value) !== null;
}

// Rutas de API que requieren autenticación (método específico)
const PROTECTED_API_ROUTES: Array<{
  path: string;
  methods?: string[]; // Si vacío o undefined, protege TODOS los métodos
  exact?: boolean;
}> = [
  // 1. Rutas específicas primero (evitar colisión con prefijos)
  { path: '/api/properties/upload', methods: ['POST'], exact: true },
  { path: '/api/telegram/test' },
  { path: '/api/telegram/setup-webhook' },
  { path: '/api/db/status' },

  // 2. Rutas base con coincidencia exacta
  { path: '/api/config', methods: ['POST'], exact: true },
  { path: '/api/leads', methods: ['GET', 'DELETE'], exact: true },
  { path: '/api/properties', methods: ['POST'], exact: true },

  // 3. Rutas dinámicas por prefijo
  { path: '/api/leads/', methods: ['GET', 'PATCH'] },
  { path: '/api/properties/', methods: ['PUT', 'DELETE'] },
];

function isProtectedApiRoute(pathname: string, method: string): boolean {
  for (const route of PROTECTED_API_ROUTES) {
    const matches = route.exact
      ? pathname === route.path
      : pathname === route.path ||
        (route.path.endsWith('/') && pathname.startsWith(route.path));

    if (matches) {
      // Si no hay métodos específicos, protege todos los métodos
      if (!route.methods || route.methods.length === 0) return true;
      // Si el método coincide con uno protegido, denegar acceso no autenticado
      if (route.methods.includes(method.toUpperCase())) return true;
      // Si la ruta coincidió pero no el método, continuar evaluando otras reglas posibles
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
