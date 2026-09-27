import { NextRequest, NextResponse } from 'next/server';
import { getServerCommercialConfig, saveServerCommercialConfig } from '@/lib/commercialConfigStore';

export async function GET() {
  try {
    const config = await getServerCommercialConfig();
    // Protección absoluta: nunca exponer secretos de bot o tokens al frontend
    if (config.telegramConfig) {
      delete (config.telegramConfig as any).botToken;
    }
    return NextResponse.json({ ok: true, config });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
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
    if (updated.telegramConfig) {
      delete (updated.telegramConfig as any).botToken;
    }
    return NextResponse.json({ ok: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
