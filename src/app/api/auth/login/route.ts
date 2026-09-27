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

    // 1. Si Supabase está configurado, intentar autenticar contra Supabase Auth (auth.users)
    let supabaseAuthSuccess = false;
    let supabaseUser: { id: string; email?: string } | null = null;

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!error && data?.user) {
            supabaseAuthSuccess = true;
            supabaseUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
            };
          }
        } catch (authErr) {
          console.warn('Advertencia al consultar Supabase Auth:', authErr);
        }
      }
    }

    if (supabaseAuthSuccess && supabaseUser) {
      // Crear respuesta y asignar cookie HMAC firmada
      const response = NextResponse.json({
        ok: true,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
        },
        message: 'Inicio de sesión exitoso.',
      });

      setSessionCookie(response, supabaseUser.id, supabaseUser.email || cleanEmail, isHttps);
      return response;
    }

    // 2. Respaldo administrativo: validar contra ADMIN_EMAIL + ADMIN_PASSWORD de entorno
    // Actúa como salvaguarda si Supabase Auth está caído o si el asesor utiliza la clave maestra de respaldo
    const adminEmail = (process.env.ADMIN_EMAIL || '').replace(/^["']|["']$/g, '').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').replace(/^["']|["']$/g, '').trim();
    const cleanInputPassword = (password || '').replace(/^["']|["']$/g, '').trim();

    if (adminEmail && adminPassword && cleanEmail === adminEmail && cleanInputPassword === adminPassword) {
      const response = NextResponse.json({
        ok: true,
        user: {
          id: 'admin-backup',
          email: cleanEmail,
        },
        message: 'Inicio de sesión exitoso (credenciales maestras de respaldo).',
      });

      setSessionCookie(response, 'admin-backup', cleanEmail, isHttps);
      return response;
    }

    // Si ni Supabase Auth ni las credenciales maestras están configuradas en absoluto
    if (!isSupabaseConfigured() && (!adminEmail || !adminPassword)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Autenticación no disponible. Configura ADMIN_EMAIL y ADMIN_PASSWORD en las variables de entorno, o conecta Supabase Auth.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { ok: false, error: 'Ocurrió un error inesperado al procesar la autenticación.' },
      { status: 500 }
    );
  }
}
