import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getServerLeads, updateServerLead } from '@/lib/leadsServerStore';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';
import { escapeMd, sendTelegramMessage } from '@/lib/telegramService';
import { addDaysToStamp } from '@/lib/leadActions';
import { localTimestamp } from '@/lib/dateUtils';

/**
 * Tarea diaria (Vercel Cron, ver vercel.json):
 * 1. Marca como "vencido" cada atribución confirmada cuya vigencia ya terminó.
 * 2. Envía al asesor por Telegram un resumen: visitas de hoy y atribuciones por vencer en 2 días.
 *
 * Vercel envía `Authorization: Bearer <CRON_SECRET>`; sin CRON_SECRET la ruta queda deshabilitada.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const received = req.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const config = await getServerCommercialConfig();
  const timezone = config.schedule?.timezone;
  const nowStamp = localTimestamp(new Date(), timezone);
  const today = nowStamp.slice(0, 10);
  const soonLimit = addDaysToStamp(nowStamp, 2);
  const leads = await getServerLeads();
  const ctx = { actor: 'Sistema', durationDays: config.attributionRules.durationDays, timezone };

  const expired: string[] = [];
  for (const lead of leads) {
    if (lead.attributionStatus === 'confirmado' && lead.attributionExpiresAt && lead.attributionExpiresAt <= nowStamp) {
      try {
        await updateServerLead(lead.id, { type: 'attribution_expire' }, ctx);
        expired.push(lead.fullName);
      } catch (err) {
        console.error(`No se pudo marcar como vencido el prospecto ${lead.id}:`, err);
      }
    }
  }

  const expiringSoon = leads.filter(
    (l) =>
      l.attributionStatus === 'confirmado' &&
      l.attributionExpiresAt &&
      l.attributionExpiresAt > nowStamp &&
      l.attributionExpiresAt <= soonLimit
  );

  const visitsToday = leads
    .filter((l) => {
      const apt = l.appointmentRequest;
      if (!apt || l.isArchived || apt.status === 'cancelada' || apt.status === 'archivada') return false;
      return (apt.confirmedDate || apt.preferredDate) === today;
    })
    .sort((a, b) =>
      (a.appointmentRequest?.confirmedTime || a.appointmentRequest?.timeSlot || '').localeCompare(
        b.appointmentRequest?.confirmedTime || b.appointmentRequest?.timeSlot || ''
      )
    );

  const sections: string[] = [];
  if (visitsToday.length > 0) {
    sections.push(
      `📅 *Visitas de hoy (${visitsToday.length}):*\n` +
        visitsToday
          .map((l) => {
            const apt = l.appointmentRequest!;
            const time = apt.confirmedTime || apt.timeSlot;
            const status = apt.status === 'confirmada' ? '✅' : '⏳ por confirmar';
            return `• ${escapeMd(time)} — ${escapeMd(l.fullName)} (${status})`;
          })
          .join('\n')
    );
  }
  if (expiringSoon.length > 0) {
    sections.push(
      `⏰ *Atribuciones por vencer (2 días):*\n` +
        expiringSoon.map((l) => `• ${escapeMd(l.fullName)} — vence ${escapeMd(l.attributionExpiresAt)}`).join('\n')
    );
  }
  if (expired.length > 0) {
    sections.push(`⌛ *Atribuciones vencidas hoy:*\n` + expired.map((name) => `• ${escapeMd(name)}`).join('\n'));
  }

  let notified = false;
  if (sections.length > 0) {
    notified = await sendTelegramMessage(`☀️ *RESUMEN DEL DÍA · ${today}*\n━━━━━━━━━━━━━━━━━━━━\n${sections.join('\n\n')}`);
  }

  return NextResponse.json({
    ok: true,
    expired: expired.length,
    expiringSoon: expiringSoon.length,
    visitsToday: visitsToday.length,
    notified,
  });
}
