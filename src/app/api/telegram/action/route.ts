import { NextRequest, NextResponse } from 'next/server';
import { getServerLeadById, updateServerLeadAppointment } from '@/lib/leadsServerStore';
import { buildClientWhatsAppConfirmUrl, buildClientWhatsAppCancelUrl } from '@/lib/telegramService';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'confirm';
  const leadId = searchParams.get('leadId');

  if (!leadId) {
    return new NextResponse(renderHtmlPage('error', 'Falta el identificador del prospecto (leadId).', null, ''), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 400,
    });
  }

  const lead = await getServerLeadById(leadId);
  if (!lead) {
    return new NextResponse(renderHtmlPage('error', `No se encontró el prospecto con ID: ${leadId}`, null, ''), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 404,
    });
  }

  const isConfirm = action === 'confirm';
  const newStatus = isConfirm ? 'confirmada' : 'cancelada';

  // 1. Actualizar el estatus en la base de datos (Supabase / Store local)
  const updatedLead = await updateServerLeadAppointment(leadId, newStatus);
  const activeLead = updatedLead || lead;

  // 2. Construir enlace de WhatsApp
  const waUrl = isConfirm
    ? buildClientWhatsAppConfirmUrl(activeLead)
    : buildClientWhatsAppCancelUrl(activeLead);

  // 3. Notificar a Telegram la actualización del estado
  try {
    const config = await getServerCommercialConfig();
    const token = process.env.TELEGRAM_BOT_TOKEN || config.telegramConfig?.botToken;
    const chatId = process.env.TELEGRAM_ADVISOR_CHAT_ID || config.telegramConfig?.advisorChatId;

    if (token && chatId) {
      const statusText = isConfirm ? '✅ *CITA CONFIRMADA DESDE MÓVIL*' : '❌ *CITA CANCELADA DESDE MÓVIL*';
      const visitDate = activeLead.appointmentRequest?.confirmedDate || activeLead.appointmentRequest?.preferredDate || 'Por acordar';
      const visitTime = activeLead.appointmentRequest?.confirmedTime || activeLead.appointmentRequest?.timeSlot || 'Por acordar';

      const updateMsg = `${statusText}
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${activeLead.fullName}
📱 *Teléfono:* \`${activeLead.phone}\`
📅 *Visita:* ${visitDate} a las ${visitTime}
📍 *Lugar:* Caseta principal Valle de los Encinos
━━━━━━━━━━━━━━━━━━━━
El estado ha sido actualizado en la base de datos comercial.`;

      await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: updateMsg,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: '💬 Enviar WhatsApp al Cliente', url: waUrl }]],
          },
        }),
      });
    }
  } catch (e) {
    console.warn('Advertencia al enviar confirmación complementaria a Telegram:', e);
  }

  // 4. Renderizar pantalla de confirmación ejecutiva con auto-apertura de WhatsApp
  const html = renderHtmlPage(isConfirm ? 'success' : 'cancelled', '', activeLead, waUrl);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    status: 200,
  });
}

function renderHtmlPage(
  type: 'success' | 'cancelled' | 'error',
  errorMsg: string,
  lead: any,
  waUrl: string
): string {
  const isSuccess = type === 'success';
  const isCancelled = type === 'cancelled';

  const title = isSuccess
    ? '¡Cita Confirmada con Éxito!'
    : isCancelled
    ? 'Cita Marcada como Cancelada'
    : 'Error al Procesar Acción';

  const badgeColor = isSuccess
    ? 'background:#064E3B;color:#6EE7B7;border:1px solid #047857;'
    : isCancelled
    ? 'background:#451A03;color:#FCD34D;border:1px solid #78350F;'
    : 'background:#450A0A;color:#FCA5A5;border:1px solid #7F1D1D;';

  const dateStr = lead?.appointmentRequest?.confirmedDate || lead?.appointmentRequest?.preferredDate || 'Fecha por acordar';
  const timeStr = lead?.appointmentRequest?.confirmedTime || lead?.appointmentRequest?.timeSlot || 'Horario por convenir';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} • Valle de los Encinos</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0B1522; color: #F1F5F9; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
    .card { background: #102033; border: 1px solid #1E354D; border-radius: 24px; max-width: 460px; width: 100%; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
    .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: #0B1929; border: 1px solid #1E354D; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #C09B53; margin-bottom: 20px; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; ${badgeColor} }
    h1 { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 8px; line-height: 1.3; }
    p.subtitle { font-size: 13px; color: #94A3B8; margin-bottom: 20px; }
    .details-box { background: #0B1929; border: 1px solid #1E354D; border-radius: 16px; padding: 16px; text-align: left; margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .details-row:last-child { margin-bottom: 0; }
    .details-label { color: #94A3B8; }
    .details-val { font-weight: 700; color: #FFFFFF; }
    .btn-wa { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; background: #25D366; color: #FFFFFF; font-weight: 800; font-size: 14px; padding: 14px 20px; border-radius: 14px; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 12px rgba(37,211,102,0.3); margin-bottom: 12px; }
    .btn-wa:hover { background: #20BD5A; }
    .btn-panel { display: block; width: 100%; background: #0F2C40; border: 1px solid #C09B53; color: #C09B53; font-weight: 700; font-size: 13px; padding: 12px 20px; border-radius: 14px; text-decoration: none; transition: 0.2s; }
    .btn-panel:hover { background: #153E5A; color: #FFFFFF; }
    .auto-note { font-size: 11px; color: #64748B; margin-top: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">
      🏢 Valle de los Encinos • Salinas Victoria
    </div>

    <div class="status-badge">
      ${isSuccess ? '✓ Base de Datos y CRM Actualizados' : isCancelled ? '✕ Cita Cancelada en CRM' : '⚠ Error'}
    </div>

    <h1>${title}</h1>
    <p class="subtitle">${isSuccess ? 'La visita ha quedado confirmada en la agenda del asesor.' : isCancelled ? 'La visita fue retirada de la agenda activa.' : errorMsg}</p>

    ${
      lead
        ? `
    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Cliente:</span>
        <span class="details-val">${lead.fullName}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Teléfono:</span>
        <span class="details-val">${lead.phone}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Fecha de Visita:</span>
        <span class="details-val">${dateStr} (${timeStr})</span>
      </div>
      <div class="details-row">
        <span class="details-label">Punto de Acceso:</span>
        <span class="details-val">Caseta Calzada del Sol</span>
      </div>
      <div class="details-row">
        <span class="details-label">Vivienda:</span>
        <span class="details-val">Modelo Águila Premier ($1.18M)</span>
      </div>
    </div>
    `
        : ''
    }

    ${
      waUrl
        ? `
    <a href="${waUrl}" class="btn-wa" id="wa-btn">
      <span>💬 Abrir WhatsApp con el Cliente</span>
    </a>
    `
        : ''
    }

    <a href="/panel" class="btn-panel">
      Ir al Panel del Asesor
    </a>

    ${
      waUrl && isSuccess
        ? `
    <p class="auto-note" id="auto-note">Redirigiendo a WhatsApp en 2 segundos...</p>
    <script>
      setTimeout(function() {
        var btn = document.getElementById('wa-btn');
        if (btn) {
          window.location.href = btn.href;
        }
      }, 1800);
    </script>
    `
        : ''
    }
  </div>
</body>
</html>`;
}
