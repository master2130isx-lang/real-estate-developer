import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getBotToken() {
  // 1. Intentar desde .env.local
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const match = content.match(/TELEGRAM_BOT_TOKEN=["']?([^"'\r\n]+)/);
    if (match && match[1]) return match[1].trim();
  }

  // 2. Intentar desde commercialConfigStore.json
  const configPath = path.join(rootDir, 'src', 'data', 'commercialConfigStore.json');
  if (fs.existsSync(configPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (data?.telegramConfig?.botToken) return data.telegramConfig.botToken.trim();
    } catch {}
  }

  // 3. Fallback de desarrollo
  return '8744099329:AAEKPsqni4ugVioOXYd7dMi3zZREBP0RrKc';
}

async function startPoller() {
  const token = getBotToken();
  if (!token) {
    console.error('❌ [Telegram Poller] No se encontró TELEGRAM_BOT_TOKEN.');
    process.exit(1);
  }

  console.log('🤖 [Telegram Poller] Iniciando receptor local de eventos para el bot...');
  console.log(`🔑 [Telegram Poller] Token activo: ${token.substring(0, 10)}...`);

  // Verificar si hay un webhook configurado y deshabilitarlo temporalmente para permitir polling en local
  try {
    const webhookInfoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const webhookInfo = await webhookInfoRes.json();
    if (webhookInfo.ok && webhookInfo.result?.url) {
      console.log(`⚠️ [Telegram Poller] Había un webhook registrado (${webhookInfo.result.url}).`);
      console.log('🔄 [Telegram Poller] Desactivando webhook para habilitar el receptor local...');
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
      console.log('✅ [Telegram Poller] Modo local activado correctamente.');
    }
  } catch (err) {
    console.warn('⚠️ [Telegram Poller] No se pudo consultar getWebhookInfo:', err.message);
  }

  let offset = 0;
  console.log('🚀 [Telegram Poller] Receptor listo: cuando pulses [✅ Confirmar Cita] o [❌ Cancelar] en Telegram, se procesará al instante en localhost:3000.');

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.callback_query) {
            const dataAction = update.callback_query.data;
            console.log(`⚡ [Telegram Poller] Botón pulsado en móvil: "${dataAction}"`);

            try {
              const hookRes = await fetch('http://localhost:3000/api/telegram/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update),
              });

              const hookResult = await hookRes.json();
              console.log('✅ [Telegram Poller] Respuesta de webhook local:', hookResult);
            } catch (postErr) {
              console.error('❌ [Telegram Poller] Error al conectar con http://localhost:3000/api/telegram/webhook:', postErr.message);
            }
          }
        }
      } else if (!data.ok) {
        console.warn('⚠️ [Telegram Poller] Telegram API devolvió error:', data.description);
        await new Promise((r) => setTimeout(r, 5000));
      }
    } catch (err) {
      // Error de red o timeout de petición
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startPoller();
