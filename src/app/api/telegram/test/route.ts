import { NextRequest, NextResponse } from 'next/server';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';
import { checkRateLimit, getClientIp, TELEGRAM_TEST_RATE_LIMIT } from '@/lib/rateLimit';
import { requireAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

/** Devuelve el @usuario del bot configurado (para mostrarlo en el panel). */
export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: 'TELEGRAM_BOT_TOKEN no configurado' });
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (!data.ok) return NextResponse.json({ ok: false, error: data.description });
    return NextResponse.json({ ok: true, username: data.result?.username || '' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 mensajes de prueba por minuto
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`tg-test:${ip}`, TELEGRAM_TEST_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados mensajes de prueba. Intenta de nuevo en 1 minuto.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const config = await getServerCommercialConfig();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId =
      body.chatId?.trim() ||
      config.telegramConfig?.recipients?.find((r) => r.isActive)?.chatId ||
      config.telegramConfig?.activeChatId?.trim() ||
      config.telegramConfig?.advisorChatId?.trim() ||
      process.env.TELEGRAM_ADVISOR_CHAT_ID;

    const alias = body.alias?.trim() || 'Asesor / Desarrollador';

    if (!token || !chatId) {
      return NextResponse.json(
        { ok: false, error: 'Falta Token o Chat ID de Telegram' },
        { status: 400 }
      );
    }

    const testMessage = `🤖 *¡CONEXIÓN EXITOSA CON TU BOT!*
━━━━━━━━━━━━━━━━━━━━
📍 *Destinatario:* ${alias}
🆔 *Chat ID:* \`${chatId}\`

Tu bot está vinculado correctamente con tu plataforma comercial inmobiliaria.

A partir de ahora, cuando un cliente solicite una cita en la web, recibirás aquí la notificación instantánea con:
• ✅ *Confirmar Cita*
• ❌ *Cancelar Cita*
• 💬 *Abrir WhatsApp con el Cliente*

¡Todo listo para gestionar tus citas en tiempo real! 🚀`;

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
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
