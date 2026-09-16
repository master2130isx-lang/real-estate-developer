import { NextRequest, NextResponse } from 'next/server';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const config = await getServerCommercialConfig();

    const token = body.token?.trim() || config.telegramConfig?.botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = body.chatId?.trim() || config.telegramConfig?.advisorChatId?.trim() || process.env.TELEGRAM_ADVISOR_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { ok: false, error: 'Falta Token o Chat ID de Telegram' },
        { status: 400 }
      );
    }

    const testMessage = `🤖 *¡CONEXIÓN EXITOSA CON TU BOT!*
━━━━━━━━━━━━━━━━━━━━
Tu bot está vinculado correctamente con tu plataforma inmobiliaria.

A partir de ahora, cuando un cliente solicite una cita en la web, recibirás aquí la notificación instantánea con los botones de:
• ✅ *Confirmar Cita*
• ❌ *Cancelar Cita*
• 💬 *Abrir WhatsApp con el Cliente*

¡Todo listo para vender más propiedades! 🚀`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ ok: false, error: data.description }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Mensaje enviado a Telegram con éxito' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
