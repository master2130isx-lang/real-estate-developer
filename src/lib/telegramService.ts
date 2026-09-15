import { Lead } from '@/types';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { getServerLeadById, updateServerLeadAppointment } from './leadsServerStore';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getAdvisorChatId(): string | undefined {
  return process.env.TELEGRAM_ADVISOR_CHAT_ID;
}

/**
 * Genera el enlace de WhatsApp pre-armado para confirmar cita con el cliente
 */
export function buildClientWhatsAppConfirmUrl(lead: Lead): string {
  const firstName = lead.fullName.split(' ')[0];
  const cleanPhone = lead.phone.replace(/\D/g, '');
  const date = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'los próximos días';
  const time = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'en horario por convenir';

  const message = `¡Hola ${firstName}! Te escribe ${COMMERCIAL_CONFIG.advisorName}, tu asesor comercial de ${COMMERCIAL_CONFIG.agencyName}.\n\nTu visita para conocer el *Modelo Águila Premier* en *Valle de los Encinos (Salinas Victoria, N.L.)* ha quedado confirmada:\n\n• Día: ${date}\n• Horario: ${time}\n• Punto de reunión: Caseta principal con acceso controlado 24/7 en Calzada del Sol\n\n¿Me confirmas que recibiste estos datos para enviarte la ubicación exacta por GPS?`;

  return `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace de WhatsApp pre-armado para cancelar cita con el cliente
 */
export function buildClientWhatsAppCancelUrl(lead: Lead): string {
  const firstName = lead.fullName.split(' ')[0];
  const cleanPhone = lead.phone.replace(/\D/g, '');

  const message = `¡Hola ${firstName}! Te escribe ${COMMERCIAL_CONFIG.advisorName} de Valle de los Encinos.\n\nTe confirmo la cancelación de tu visita para conocer el *Modelo Águila Premier*. Si más adelante deseas retomar tu asesoría o agendar un nuevo recorrido en las casas muestra, con mucho gusto estoy a tus órdenes por este medio. ¡Excelente día!`;

  return `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Envía una notificación instantánea al bot de Telegram del asesor cuando se solicita una nueva cita
 */
export async function notifyNewAppointmentTelegram(lead: Lead): Promise<{ success: boolean; error?: string }> {
  const token = getBotToken();
  const chatId = getAdvisorChatId();

  if (!token || !chatId) {
    console.warn(
      '⚠️ Telegram Bot no configurado (TELEGRAM_BOT_TOKEN o TELEGRAM_ADVISOR_CHAT_ID no definidos en .env). Modo simulación activo.'
    );
    return { success: false, error: 'Tokens no configurados en variables de entorno' };
  }

  const date = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'Por acordar';
  const time = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'Por acordar';
  const financingLabel = lead.financingType.replace('_', ' ').toUpperCase();
  const waUrl = buildClientWhatsAppConfirmUrl(lead);

  const text = `🚨 *NUEVA SOLICITUD DE CITA*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${lead.fullName}
📱 *Teléfono:* \`${lead.phone}\`
📅 *Fecha:* ${date} a las ${time}
💳 *Forma de pago:* ${financingLabel}
🏠 *Vivienda:* Modelo Águila Premier ($1,180,000 MXN)
📍 *Ubicación:* Valle de los Encinos, Salinas Victoria
${lead.attributionStatus === 'pendiente_inmobiliaria' ? '⚡ *NSS recibido:* Capturado para registrar en constructora\n' : ''}
${lead.appointmentRequest?.notes ? `📝 *Comentarios:* _${lead.appointmentRequest.notes}_\n` : ''}━━━━━━━━━━━━━━━━━━━━
*¿Deseas confirmar o cancelar esta visita?*`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Confirmar Cita', callback_data: `confirm:${lead.id}` },
        { text: '❌ Cancelar Cita', callback_data: `cancel:${lead.id}` },
      ],
      [
        { text: '💬 Abrir WhatsApp del Cliente', url: waUrl },
      ],
    ],
  };

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Error de Telegram API:', data);
      return { success: false, error: data.description };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Fallo de conexión con Telegram:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Procesa la acción del asesor cuando pulsa un botón interactivo (Inline Keyboard) en Telegram
 */
export async function handleTelegramCallbackQuery(callbackQuery: any): Promise<{ ok: boolean }> {
  const token = getBotToken();
  if (!token) return { ok: false };

  const callbackQueryId = callbackQuery.id;
  const data = callbackQuery.data || '';
  const messageId = callbackQuery.message?.message_id;
  const chatId = callbackQuery.message?.chat?.id;

  if (!data.includes(':')) {
    await answerCallbackQuery(token, callbackQueryId, 'Acción no reconocida');
    return { ok: false };
  }

  const [action, leadId] = data.split(':');
  const lead = await getServerLeadById(leadId);

  if (!lead) {
    await answerCallbackQuery(token, callbackQueryId, 'Prospecto no encontrado en el sistema');
    return { ok: false };
  }

  if (action === 'confirm') {
    // 1. Actualizar el estatus en la base de datos compartida del servidor
    const updatedLead = await updateServerLeadAppointment(leadId, 'confirmada');
    await answerCallbackQuery(token, callbackQueryId, '✅ ¡Cita confirmada en el sistema!');

    // 2. Editar el mensaje en Telegram mostrando el estatus confirmado y el link directo a WhatsApp
    if (updatedLead && messageId && chatId) {
      const waUrl = buildClientWhatsAppConfirmUrl(updatedLead);
      const date = updatedLead.appointmentRequest?.confirmedDate || updatedLead.appointmentRequest?.preferredDate;
      const time = updatedLead.appointmentRequest?.confirmedTime || updatedLead.appointmentRequest?.timeSlot;

      const updatedText = `✅ *CITA CONFIRMADA EN EL SISTEMA*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${updatedLead.fullName}
📱 *Teléfono:* \`${updatedLead.phone}\`
📅 *Cita confirmada:* ${date} a las ${time}
📍 *Punto de reunión:* Caseta principal Valle de los Encinos
🏠 *Vivienda:* Modelo Águila Premier ($1.18M)
━━━━━━━━━━━━━━━━━━━━
El estado ha sido actualizado en la página web.

👉 [Toca aquí para enviar confirmación por WhatsApp al cliente](${waUrl})`;

      await editTelegramMessage(token, chatId, messageId, updatedText, [
        [{ text: '💬 Enviar WhatsApp al Cliente', url: waUrl }],
      ]);
    }
    return { ok: true };
  }

  if (action === 'cancel') {
    // 1. Actualizar a cancelada
    const updatedLead = await updateServerLeadAppointment(leadId, 'cancelada');
    await answerCallbackQuery(token, callbackQueryId, '❌ Cita marcada como cancelada.');

    // 2. Editar el mensaje en Telegram con el enlace a WhatsApp con mensaje formal de cancelación
    if (updatedLead && messageId && chatId) {
      const waCancelUrl = buildClientWhatsAppCancelUrl(updatedLead);

      const updatedText = `❌ *CITA CANCELADA EN EL SISTEMA*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${updatedLead.fullName}
📱 *Teléfono:* \`${updatedLead.phone}\`
━━━━━━━━━━━━━━━━━━━━
El estado ha sido actualizado en la página web como cancelada.

👉 [Toca aquí para enviar mensaje de cortesía por WhatsApp](${waCancelUrl})`;

      await editTelegramMessage(token, chatId, messageId, updatedText, [
        [{ text: '💬 Enviar Mensaje de Cancelación por WhatsApp', url: waCancelUrl }],
      ]);
    }
    return { ok: true };
  }

  return { ok: false };
}

async function answerCallbackQuery(token: string, callbackQueryId: string, text: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: false,
      }),
    });
  } catch (e) {
    console.error('Error al responder callback query:', e);
  }
}

async function editTelegramMessage(
  token: string,
  chatId: number | string,
  messageId: number,
  text: string,
  inlineKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>
): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: inlineKeyboard },
      }),
    });
  } catch (e) {
    console.error('Error al editar mensaje de Telegram:', e);
  }
}
