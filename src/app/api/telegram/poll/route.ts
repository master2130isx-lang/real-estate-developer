import { NextResponse } from 'next/server';
import { handleTelegramCallbackQuery } from '@/lib/telegramService';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

async function getBotToken(): Promise<string> {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;
  const config = await getServerCommercialConfig();
  return config.telegramConfig?.botToken || '';
}

/**
 * Endpoint de soporte y diagnóstico para consultar y procesar updates pendientes en Telegram
 */
export async function GET() {
  try {
    const token = await getBotToken();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token no configurado' }, { status: 400 });
    }

    // 1. Obtener estado actual del webhook
    const webhookRes = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getWebhookInfo`);
    const webhookInfo = await webhookRes.json();

    // 2. Si hay webhook configurado, no se puede hacer getUpdates a menos que se use webhook
    if (webhookInfo.ok && webhookInfo.result?.url) {
      return NextResponse.json({
        ok: true,
        mode: 'webhook',
        webhookUrl: webhookInfo.result.url,
        pendingUpdateCount: webhookInfo.result.pending_update_count,
        message: 'El bot está operando en modo Webhook con entrega automática de eventos.',
      });
    }

    // 3. Si no hay webhook, consultar getUpdates y procesar callbacks pendientes
    const updatesRes = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getUpdates?limit=20`);
    const updatesData = await updatesRes.json();

    let processedCount = 0;
    if (updatesData.ok && Array.isArray(updatesData.result)) {
      for (const update of updatesData.result) {
        if (update.callback_query) {
          await handleTelegramCallbackQuery(update.callback_query);
          processedCount++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      mode: 'polling',
      processedCallbacks: processedCount,
      updatesFound: updatesData.result?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
