import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramCallbackQuery } from '@/lib/telegramService';

/**
 * Webhook de Telegram para recibir interacciones del asesor inmobiliario
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Procesar evento de botón pulsado (callback_query)
    if (update.callback_query) {
      await handleTelegramCallbackQuery(update.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error al procesar webhook de Telegram:', error);
    // Responder 200 a Telegram para evitar reintentos continuos en caso de payloads malformados
    return NextResponse.json({ ok: true, error: error.message });
  }
}

/**
 * Endpoint informativo para diagnóstico y registro del webhook
 */
export async function GET() {
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasChatId = !!process.env.TELEGRAM_ADVISOR_CHAT_ID;

  return NextResponse.json({
    status: 'online',
    description: 'Webhook de Bot de Telegram para Asesor Comercial (Valle de los Encinos)',
    config: {
      hasBotToken: hasToken,
      hasAdvisorChatId: hasChatId,
    },
    instructions: {
      setupWebhookUrl: 'Para registrar este webhook en Telegram ejecuta:',
      command: `https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://www.encuentratucasa.online/api/telegram/webhook`,
    },
  });
}
