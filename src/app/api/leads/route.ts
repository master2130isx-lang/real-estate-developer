import { NextRequest, NextResponse } from 'next/server';
import { getServerLeads, saveServerLead, purgeAllServerLeads, resetServerLeadsToDemo } from '@/lib/leadsServerStore';
import { notifyNewAppointmentTelegram } from '@/lib/telegramService';
import { Lead } from '@/types';
import { isDeveloperSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, LEAD_CREATION_RATE_LIMIT } from '@/lib/rateLimit';

export async function GET() {
  try {
    const leads = await getServerLeads();
    return NextResponse.json({ ok: true, leads });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 registros por minuto por IP
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`leads:${ip}`, LEAD_CREATION_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json();
    const lead = body as Lead;

    if (!lead || !lead.id || !lead.fullName || !lead.phone) {
      return NextResponse.json({ ok: false, error: 'Datos de prospecto incompletos' }, { status: 400 });
    }

    const savedLead = await saveServerLead(lead);

    // Determinar origen del servidor para enlaces de acción y auto-registro de webhook
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const origin = host ? `${proto}://${host}` : undefined;

    // Disparar la alerta instantánea al bot de Telegram del asesor
    // En Vercel Serverless es indispensable hacer await para que la ejecución no se cierre antes de enviar el HTTP request
    try {
      await notifyNewAppointmentTelegram(savedLead, origin);
    } catch (err) {
      console.error('Error al notificar por Telegram:', err);
    }

    return NextResponse.json({ ok: true, lead: savedLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

/**
 * PURGA DE BASE DE DATOS DE CITAS (ZONA DE SEGURIDAD DEVELOPER)
 * Requiere:
 * 1. Sesión activa de desarrollador (correo coincide con master2130.isx@gmail.com o ADMIN_EMAIL)
 * 2. Frase de confirmación obligatoria: "BORRAR-CITAS-TEST"
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Validar sesión del desarrollador usando el módulo centralizado de autenticación
    if (!isDeveloperSession(req)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Acceso Denegado: Solo el desarrollador principal (Master Developer) tiene autorización para purgar la base de datos.',
        },
        { status: 403 }
      );
    }

    // 2. Leer payload de seguridad
    const body = await req.json().catch(() => ({}));
    const { confirmationCode, action } = body;

    // 3. Validar código de confirmación estricto
    if (action === 'reset_demo') {
      if (confirmationCode !== 'RESTABLECER-DEMO') {
        return NextResponse.json(
          { ok: false, error: 'Código de confirmación incorrecto. Escribe exactamente: RESTABLECER-DEMO' },
          { status: 400 }
        );
      }
      const restored = await resetServerLeadsToDemo();
      return NextResponse.json({
        ok: true,
        message: 'Base de datos restablecida a registros de demostración iniciales.',
        leads: restored,
      });
    }

    // Acción por defecto: Purga total
    if (confirmationCode !== 'BORRAR-CITAS-TEST') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Código de confirmación incorrecto para purga. Escribe exactamente: BORRAR-CITAS-TEST',
        },
        { status: 400 }
      );
    }

    const deletedCount = await purgeAllServerLeads();

    return NextResponse.json({
      ok: true,
      deletedCount,
      message: `Base de datos de citas limpiada con éxito. Se eliminaron ${deletedCount} registros tanto de Supabase como del servidor local.`,
      leads: [],
    });
  } catch (error: any) {
    console.error('Error durante la purga de citas:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
