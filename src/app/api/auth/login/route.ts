import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Por favor ingresa correo electrónico y contraseña.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

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

        // Crear respuesta y asignar cookie HTTP-Only segura
        const response = NextResponse.json({
          ok: true,
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          message: 'Inicio de sesión exitoso.',
        });

        const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

        const sessionPayload = JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        response.cookies.set('advisor_session', sessionPayload, {
          httpOnly: true,
          secure: isHttps,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });

        return response;
      }
    }

    // 2. Si estamos en modo de desarrollo local sin Supabase conectado aún
    // Permitir acceso temporal para no bloquear al asesor
    const response = NextResponse.json({
      ok: true,
      user: {
        id: 'local-advisor',
        email: cleanEmail,
      },
      message: 'Inicio de sesión en modo local / demostración.',
    });

    const isHttpsLocal = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    response.cookies.set(
      'advisor_session',
      JSON.stringify({
        userId: 'local-advisor',
        email: cleanEmail,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }),
      {
        httpOnly: true,
        secure: isHttpsLocal,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      }
    );

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { ok: false, error: 'Ocurrió un error inesperado al procesar la autenticación.' },
      { status: 500 }
    );
  }
}
