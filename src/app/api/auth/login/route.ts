import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { setSessionCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp, LOGIN_RATE_LIMIT } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 intentos por minuto por IP
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 1 minuto.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Por favor ingresa correo electrónico y contraseña.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    // 1. Si Supabase está configurado, autenticar contra Supabase Auth (auth.users)
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error || !data.user) {
          return NextResponse.json(
            {
              ok: false,
              error:
                error?.message === 'Invalid login credentials'
                  ? 'Credenciales incorrectas. Verifica tu correo y contraseña registrados en Supabase.'
                  : error?.message || 'Error al autenticar con Supabase.',
            },
            { status: 401 }
          );
        }

        // Crear respuesta y asignar cookie HMAC firmada
        const response = NextResponse.json({
          ok: true,
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          message: 'Inicio de sesión exitoso.',
        });

        setSessionCookie(response, data.user.id, data.user.email || cleanEmail, isHttps);
        return response;
      }
    }

    // 2. Modo local sin Supabase: verificar credenciales contra variables de entorno
    // NUNCA permitir acceso sin validar contraseña
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Autenticación no disponible. Configura ADMIN_EMAIL y ADMIN_PASSWORD en las variables de entorno, o conecta Supabase Auth.',
        },
        { status: 503 }
      );
    }

    if (cleanEmail !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
        },
        { status: 401 }
      );
    }

    // Credenciales locales válidas
    const response = NextResponse.json({
      ok: true,
      user: {
        id: 'local-advisor',
        email: cleanEmail,
      },
      message: 'Inicio de sesión exitoso (modo local).',
    });

    setSessionCookie(response, 'local-advisor', cleanEmail, isHttps);
    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { ok: false, error: 'Ocurrió un error inesperado al procesar la autenticación.' },
      { status: 500 }
    );
  }
}
