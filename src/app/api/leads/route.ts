import { NextRequest, NextResponse } from 'next/server';
import { getServerLeads, saveServerLead } from '@/lib/leadsServerStore';
import { notifyNewAppointmentTelegram } from '@/lib/telegramService';
import { Lead } from '@/types';

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
    const body = await req.json();
    const lead = body as Lead;

    if (!lead || !lead.id || !lead.fullName || !lead.phone) {
      return NextResponse.json({ ok: false, error: 'Datos de prospecto incompletos' }, { status: 400 });
    }

    const savedLead = await saveServerLead(lead);

    // Disparar la alerta instantánea al bot de Telegram del asesor si tiene cita solicitada o confirmada
    if (savedLead.appointmentRequest || savedLead.commercialStatus.includes('cita')) {
      // Se ejecuta en segundo plano sin bloquear la respuesta
      notifyNewAppointmentTelegram(savedLead).catch((err) =>
        console.error('Error al notificar por Telegram:', err)
      );
    }

    return NextResponse.json({ ok: true, lead: savedLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
