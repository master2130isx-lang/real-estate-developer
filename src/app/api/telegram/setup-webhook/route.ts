import { NextRequest, NextResponse } from 'next/server';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

async function getBotToken(): Promise<string> {
  if (process.env.TELEGRAM_BOT_TOKEN) return process.env.TELEGRAM_BOT_TOKEN;
  const config = await getServerCommercialConfig();
  return config.telegramConfig?.botToken || '';
}

export async function GET() {
  try {
    const token = await getBotToken();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token no configurado' }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getBotToken();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'Token no configurado' }, { status: 400 });
    }

    const body = await req.json();
    const { action, webhookUrl } = body;

    if (action === 'delete') {
      const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'set') {
      if (!webhookUrl || !webhookUrl.startsWith('https://')) {
        return NextResponse.json({ ok: false, error: 'La URL del webhook debe comenzar con https://' }, { status: 400 });
      }

      const fullUrl = webhookUrl.endsWith('/api/telegram/webhook')
        ? webhookUrl
        : `${webhookUrl.replace(/\/$/, '')}/api/telegram/webhook`;

      const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(fullUrl)}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ ok: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
