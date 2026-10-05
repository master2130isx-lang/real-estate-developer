import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerCommercialConfig, saveServerCommercialConfig } from '@/lib/commercialConfigStore';
import { getSessionFromRequest } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const config = await getServerCommercialConfig();
    const session = getSessionFromRequest(req);

    // Si el usuario no tiene sesión autenticada de asesor, omitir telegramConfig
    // para evitar exponer Chat IDs o alias a visitantes anónimos de la landing
    if (!session) {
      const publicConfig = { ...config };
      delete publicConfig.telegramConfig;
      return NextResponse.json({ ok: true, config: publicConfig });
    }

    // Para asesores autenticados, incluir telegramConfig pero asegurar que nunca exponga el botToken
    if (config.telegramConfig) {
      delete config.telegramConfig.botToken;
    }
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Bloquear inyecciones de credenciales por API
    if (body?.telegramConfig) {
      delete body.telegramConfig.botToken;
    }
    const updated = await saveServerCommercialConfig(body);
    revalidatePath('/', 'layout');
    if (updated.telegramConfig) {
      delete updated.telegramConfig.botToken;
    }
    return NextResponse.json({ ok: true, config: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
