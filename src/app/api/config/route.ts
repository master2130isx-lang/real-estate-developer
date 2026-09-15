import { NextRequest, NextResponse } from 'next/server';
import { getServerCommercialConfig, saveServerCommercialConfig } from '@/lib/commercialConfigStore';

export async function GET() {
  try {
    const config = await getServerCommercialConfig();
    return NextResponse.json({ ok: true, config });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveServerCommercialConfig(body);
    return NextResponse.json({ ok: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
