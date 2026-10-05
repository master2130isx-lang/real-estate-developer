import { Lead } from '@/types';
import { CommercialConfig } from '@/config/commercialConfig';
import { getServerLeadById, updateServerLead } from './leadsServerStore';
import { generateActionToken } from './auth';
import { getServerCommercialConfig } from './commercialConfigStore';
import { buildWhatsAppLink } from './phone';
import { getErrorMessage } from '@/lib/errors';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

type InlineKeyboard = Array<Array<{ text: string; url?: string; callback_data?: string }>>;

function getBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

/**
 * Escapa los caracteres especiales del modo Markdown de Telegram.
 * Sin esto, un nombre como "Juan_Perez" hace que Telegram rechace el mensaje completo.
 */
export function escapeMd(value: string | undefined | null): string {
  return (value || '').replace(/([_*`\[])/g, '\\$1');
}

/** Chat IDs autorizados para operar el bot (destinatarios registrados + variable de entorno). */
function getAuthorizedChatIds(config: CommercialConfig): Set<string> {
  const ids = new Set<string>();
  for (const r of config.telegramConfig?.recipients || []) {
    if (r.chatId?.trim()) ids.add(r.chatId.trim());
  }
  if (config.telegramConfig?.activeChatId?.trim()) ids.add(config.telegramConfig.activeChatId.trim());
  if (config.telegramConfig?.advisorChatId?.trim()) ids.add(config.telegramConfig.advisorChatId.trim());
  if (process.env.TELEGRAM_ADVISOR_CHAT_ID?.trim()) ids.add(process.env.TELEGRAM_ADVISOR_CHAT_ID.trim());
  return ids;
}

function resolveActiveChatId(config: CommercialConfig): string | undefined {
  const active = config.telegramConfig?.recipients?.find((r) => r.isActive && r.chatId?.trim());
  if (active) return active.chatId.trim();
  return (
    config.telegramConfig?.activeChatId?.trim() ||
    config.telegramConfig?.advisorChatId?.trim() ||
    process.env.TELEGRAM_ADVISOR_CHAT_ID
  );
}

export async function getActiveRecipientInfo(): Promise<{ chatId: string; alias: string }> {
  const config = await getServerCommercialConfig();
  const active = config.telegramConfig?.recipients?.find((r) => r.isActive && r.chatId?.trim());
  if (active) {
    return { chatId: active.chatId.trim(), alias: active.alias };
  }
  return { chatId: resolveActiveChatId(config) || '', alias: 'Asesor Principal' };
}

/** Envía un mensaje al destinatario activo. Devuelve false si el bot no está configurado o falla. */
export async function sendTelegramMessage(text: string, keyboard?: InlineKeyboard): Promise<boolean> {
  const token = getBotToken();
  const config = await getServerCommercialConfig();
  const chatId = resolveActiveChatId(config);
  if (!token || !chatId) return false;

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Error de Telegram API sendMessage:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Fallo de conexión con Telegram:', err);
    return false;
  }
}

function getMeetingPoint(config: CommercialConfig): string {
  return config.landing?.meetingPoint || config.contactChannels.officeAddressNote || 'Caseta principal con acceso controlado';
}

/**
 * Genera el enlace de WhatsApp pre-armado para confirmar cita con el cliente
 */
export function buildClientWhatsAppConfirmUrl(lead: Lead, config: CommercialConfig): string {
  const firstName = lead.fullName.split(' ')[0];
  const date = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'los próximos días';
  const time = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'en horario por convenir';
  const propertyTitle = lead.selectedPropertyTitle || 'la vivienda';
  const zone = lead.interestedZone || config.coverageZone;

  const message = `¡Hola ${firstName}! Te escribe ${config.advisorName}, tu asesor comercial de ${config.agencyName}.\n\nTu visita para conocer el *${propertyTitle}* en *${zone}* ha quedado confirmada:\n\n• Día: ${date}\n• Horario: ${time}\n• Punto de reunión: ${getMeetingPoint(config)}\n\n¿Me confirmas que recibiste estos datos para enviarte la ubicación exacta por GPS?`;

  return buildWhatsAppLink(lead.phone, message);
}

/**
 * Genera el enlace de WhatsApp pre-armado para cancelar cita con el cliente
 */
export function buildClientWhatsAppCancelUrl(lead: Lead, config: CommercialConfig): string {
  const firstName = lead.fullName.split(' ')[0];
  const propertyTitle = lead.selectedPropertyTitle || 'la vivienda';

  const message = `¡Hola ${firstName}! Te escribe ${config.advisorName} de ${config.agencyName}.\n\nTe confirmo la cancelación de tu visita para conocer el *${propertyTitle}*. Si más adelante deseas retomar tu asesoría o agendar un nuevo recorrido en las casas muestra, con mucho gusto estoy a tus órdenes por este medio. ¡Excelente día!`;

  return buildWhatsAppLink(lead.phone, message);
}

/**
 * Asegura de forma automática que el webhook de Telegram esté registrado en el dominio de producción
 * y que admita explícitamente eventos callback_query para los botones de aprobar/cancelar.
 * Si existe TELEGRAM_WEBHOOK_SECRET, se registra como secret_token para que el webhook
 * solo acepte peticiones de Telegram.
 */
export async function ensureTelegramWebhook(origin: string): Promise<{ ok: boolean; info?: unknown }> {
  if (!origin || !origin.startsWith('https://')) return { ok: false };
  try {
    const token = getBotToken();
    if (!token) return { ok: false };

    const targetUrl = `${origin.replace(/\/$/, '')}/api/telegram/webhook`;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

    // 1. Verificar si ya está apuntando a la URL correcta y admite callback_query.
    // (getWebhookInfo no expone el secret, así que con secret configurado siempre se re-registra
    // la primera vez por instancia.)
    const checkRes = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getWebhookInfo`);
    const checkData = await checkRes.json();
    const hasCallbackQuery = Array.isArray(checkData.result?.allowed_updates)
      ? checkData.result.allowed_updates.includes('callback_query')
      : true;

    if (checkData.ok && checkData.result?.url === targetUrl && hasCallbackQuery && (!secret || webhookSecretRegistered)) {
      return { ok: true, info: checkData.result };
    }

    // 2. Registrar el webhook con soporte explícito para botones interactivos
    const setRes = await fetch(`${TELEGRAM_API_BASE}/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ['message', 'callback_query'],
        ...(secret ? { secret_token: secret } : {}),
      }),
    });
    const setData = await setRes.json();
    if (setData.ok && secret) webhookSecretRegistered = true;
    return { ok: setData.ok, info: setData };
  } catch (err) {
    console.warn('Advertencia al registrar webhook automático en Telegram:', getErrorMessage(err));
    return { ok: false };
  }
}

let webhookSecretRegistered = false;

function resolvePublicOrigin(customOrigin?: string): string {
  return (
    customOrigin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://www.encuentratucasa.online'
  );
}

function describeSource(lead: Lead): string {
  const src = lead.leadSource;
  if (!src) return '';
  const channelLabels: Record<string, string> = {
    landing: 'Landing',
    registro: 'Registro rápido (anuncios)',
    solicitar_visita: 'Enlace directo de visita',
    panel: 'Panel del asesor',
  };
  const campaign = [src.utmSource, src.utmMedium, src.utmCampaign].filter(Boolean).join(' / ');
  return `📣 *Origen:* ${escapeMd(channelLabels[src.channel] || src.channel)}${campaign ? ` (${escapeMd(campaign)})` : ''}\n`;
}

/**
 * Envía una notificación instantánea al bot de Telegram del asesor cuando se solicita una nueva cita
 */
export async function notifyNewAppointmentTelegram(
  lead: Lead,
  customOrigin?: string
): Promise<{ success: boolean; error?: string }> {
  const token = getBotToken();
  const config = await getServerCommercialConfig();
  const chatId = resolveActiveChatId(config);

  if (!token || !chatId) {
    console.warn('⚠️ Telegram Bot no configurado (TELEGRAM_BOT_TOKEN o destinatario activo). Modo simulación activo.');
    return { success: false, error: 'Tokens no configurados en variables de entorno' };
  }

  const resolvedOrigin = resolvePublicOrigin(customOrigin);
  if (resolvedOrigin.startsWith('https://')) {
    ensureTelegramWebhook(resolvedOrigin).catch(() => {});
  }

  const hasAppointment = !!lead.appointmentRequest;
  const date = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'Por acordar';
  const time = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'Por acordar';
  const financingLabel = ((lead.financingType || 'infonavit') as string).replace(/_/g, ' ').toUpperCase();
  const waUrl = buildClientWhatsAppConfirmUrl(lead, config);
  const days = config.attributionRules.durationDays;

  // NSS o CURP visible para que el asesor pueda copiarlo de inmediato
  const nssRaw = lead.nssValueEncryptedMock || (lead.nssLastFour ? `*******${lead.nssLastFour}` : null);
  const curpRaw = lead.curpValue || (lead.curpLastFour ? `**************${lead.curpLastFour}` : null);

  let identifierSection = '';
  if (lead.financingType === 'fovissste' || lead.curpValue) {
    identifierSection = curpRaw
      ? `🏛️ *CURP (FOVISSSTE):* \`${curpRaw}\`\n⚡ _(Listo para precalificar y activar exclusividad)_\n`
      : `⚠️ *CURP (FOVISSSTE):* Pendiente de solicitar al cliente\n`;
  } else if (nssRaw) {
    identifierSection = `🔢 *NSS (Infonavit):* \`${nssRaw}\`\n⚡ _(Listo para registrar en constructora y activar ${days} días de atribución)_\n`;
  } else if (lead.financingType === 'infonavit') {
    identifierSection = `⚠️ *NSS:* Pendiente de solicitar al cliente\n`;
  } else {
    identifierSection = `ℹ️ *Identificador:* No aplica (${escapeMd(financingLabel)})\n`;
  }

  const title = hasAppointment ? '🚨 *NUEVA SOLICITUD DE CITA*' : '✨ *NUEVO PROSPECTO WEB REGISTRADO*';
  const visitSection = hasAppointment
    ? `📅 *Visita Solicitada:* ${escapeMd(date)} a las ${escapeMd(time)}\n`
    : `⏰ *Horario de contacto:* ${escapeMd(lead.preferredContactTime || 'Tarde')} vía ${escapeMd(lead.preferredChannel || 'WhatsApp')}\n`;

  const footerPrompt = hasAppointment ? '*¿Deseas confirmar o cancelar esta visita?*' : '*¿Deseas contactar a este prospecto?*';

  const text = `${title}
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${escapeMd(lead.fullName)}
📱 *Teléfono:* \`${lead.phone}\`
🧾 *Folio:* ${escapeMd(lead.folio)}
${visitSection}💳 *Forma de compra:* ${escapeMd(financingLabel)}
${identifierSection}🏠 *Vivienda:* ${escapeMd(lead.selectedPropertyTitle || 'Vivienda seleccionada')}
📍 *Ubicación:* ${escapeMd(lead.interestedZone || config.coverageZone || config.agencyName)}
${describeSource(lead)}${lead.appointmentRequest?.notes ? `📝 *Comentarios:* ${escapeMd(lead.appointmentRequest.notes)}\n` : ''}━━━━━━━━━━━━━━━━━━━━
${footerPrompt}`;

  // URL de acción directa web con token HMAC firmado
  const confirmToken = generateActionToken(lead.id, 'confirm');
  const webConfirmUrl = `${resolvedOrigin}/api/telegram/action?action=confirm&leadId=${lead.id}&token=${confirmToken}`;

  const keyboard: InlineKeyboard = hasAppointment
    ? [
        [
          { text: '✅ Confirmar Cita', callback_data: `confirm:${lead.id}` },
          { text: '❌ Cancelar Cita', callback_data: `cancel:${lead.id}` },
        ],
        [{ text: '⚡ Confirmar en Web (1-Clic)', url: webConfirmUrl }],
        [{ text: '💬 Abrir WhatsApp del Cliente', url: waUrl }],
      ]
    : [[{ text: '💬 Abrir WhatsApp del Cliente', url: waUrl }]];

  const sent = await sendTelegramMessage(text, keyboard);
  return sent ? { success: true } : { success: false, error: 'No se pudo enviar el mensaje a Telegram' };
}

/**
 * Procesa la acción del asesor cuando pulsa un botón interactivo (Inline Keyboard) en Telegram
 */
/** Campos que se usan de un callback_query de Telegram (botones inline). */
export interface TelegramCallbackQuery {
  id: string;
  data?: string;
  message?: { message_id?: number; chat?: { id?: number | string } };
}

export async function handleTelegramCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<{ ok: boolean }> {
  const token = getBotToken();
  if (!token) return { ok: false };

  const callbackQueryId = callbackQuery.id;
  const data: string = callbackQuery.data || '';
  const messageId = callbackQuery.message?.message_id;
  const chatId = callbackQuery.message?.chat?.id;
  const config = await getServerCommercialConfig();

  // Solo los chats registrados en el directorio de destinatarios pueden operar las citas
  if (!chatId || !getAuthorizedChatIds(config).has(String(chatId))) {
    await answerCallbackQuery(token, callbackQueryId, 'Este chat no está autorizado para gestionar citas.', true);
    return { ok: false };
  }

  if (!data.includes(':')) {
    await answerCallbackQuery(token, callbackQueryId, 'Acción no reconocida', true);
    return { ok: false };
  }

  const [action, leadId] = data.split(':');
  if (action !== 'confirm' && action !== 'cancel') {
    await answerCallbackQuery(token, callbackQueryId, 'Acción no reconocida', true);
    return { ok: false };
  }

  const lead = await getServerLeadById(leadId);
  if (!lead) {
    await answerCallbackQuery(token, callbackQueryId, 'No se encontró el prospecto.', true);
    return { ok: false };
  }

  const isConfirm = action === 'confirm';
  let updatedLead: Lead | null = null;
  try {
    updatedLead = await updateServerLead(
      leadId,
      { type: 'appointment', status: isConfirm ? 'confirmada' : 'cancelada' },
      {
        actor: 'Bot de Telegram',
        durationDays: config.attributionRules.durationDays,
        timezone: config.schedule?.timezone,
      }
    );
  } catch (err) {
    console.error('Error al actualizar cita desde Telegram:', err);
  }

  if (!updatedLead) {
    await answerCallbackQuery(token, callbackQueryId, '⚠️ No se pudo guardar el cambio. Intenta desde el panel.', true);
    return { ok: false };
  }

  await answerCallbackQuery(
    token,
    callbackQueryId,
    isConfirm ? '✅ ¡Cita confirmada con éxito! Actualizada en el sistema.' : '❌ Cita marcada como cancelada en el sistema.',
    true
  );

  const nssRaw = updatedLead.nssValueEncryptedMock || (updatedLead.nssLastFour ? `*******${updatedLead.nssLastFour}` : null);
  const nssLine = nssRaw ? `🔢 *NSS:* \`${nssRaw}\`\n` : '';

  if (messageId) {
    if (isConfirm) {
      const date = updatedLead.appointmentRequest?.confirmedDate || updatedLead.appointmentRequest?.preferredDate;
      const time = updatedLead.appointmentRequest?.confirmedTime || updatedLead.appointmentRequest?.timeSlot;
      const updatedText = `✅ *CITA CONFIRMADA EN EL SISTEMA*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${escapeMd(updatedLead.fullName)}
📱 *Teléfono:* \`${updatedLead.phone}\`
${nssLine}📅 *Cita confirmada:* ${escapeMd(date)} a las ${escapeMd(time)}
📍 *Punto de reunión:* ${escapeMd(getMeetingPoint(config))}
🏠 *Vivienda:* ${escapeMd(updatedLead.selectedPropertyTitle || 'Vivienda seleccionada')}
━━━━━━━━━━━━━━━━━━━━
✅ *Estado:* Confirmada en CRM y Base de Datos.
💬 Toca el botón inferior para abrir WhatsApp con el mensaje pre-armado:`;

      await editTelegramMessage(token, chatId, messageId, updatedText, [
        [{ text: '💬 Enviar WhatsApp al Cliente', url: buildClientWhatsAppConfirmUrl(updatedLead, config) }],
      ]);
    } else {
      const updatedText = `❌ *CITA CANCELADA EN EL SISTEMA*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${escapeMd(updatedLead.fullName)}
📱 *Teléfono:* \`${updatedLead.phone}\`
${nssLine}━━━━━━━━━━━━━━━━━━━━
❌ *Estado:* Cancelada en CRM y Base de Datos.
💬 Puedes enviar un mensaje formal de cortesía con el botón inferior:`;

      await editTelegramMessage(token, chatId, messageId, updatedText, [
        [{ text: '💬 Enviar Mensaje de Cortesía por WhatsApp', url: buildClientWhatsAppCancelUrl(updatedLead, config) }],
      ]);
    }
  }
  return { ok: true };
}

async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text: string,
  showAlert: boolean = true
): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API_BASE}/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
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
  inlineKeyboard: InlineKeyboard
): Promise<void> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/editMessageText`, {
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
    const data = await res.json();
    if (!data.ok) {
      console.warn('Aviso al editar mensaje de Telegram:', data.description);
    }
  } catch (e) {
    console.error('Error al editar mensaje de Telegram:', e);
  }
}
