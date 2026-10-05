import { NextRequest, NextResponse } from 'next/server';
import { updateServerLead, getServerLeadById, LeadPersistenceError } from '@/lib/leadsServerStore';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';
import { parseLeadAction } from '@/lib/leadActions';
import { requireAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const { id } = await context.params;
    const lead = await getServerLeadById(id);
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Prospecto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

/**
 * Aplica una acción del panel sobre el prospecto.
 * Cuerpo: { action: { type: 'note' | 'status' | 'appointment' | 'archive' | 'attribution_confirm' | ... } }
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const action = parseLeadAction(body?.action);
    if (!action) {
      return NextResponse.json({ ok: false, error: 'Acción inválida' }, { status: 400 });
    }

    const config = await getServerCommercialConfig();
    const updatedLead = await updateServerLead(id, action, {
      actor: config.advisorName,
      durationDays: config.attributionRules.durationDays,
      timezone: config.schedule?.timezone,
    });

    if (!updatedLead) {
      return NextResponse.json({ ok: false, error: 'Prospecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updatedLead });
  } catch (error) {
    const status = error instanceof LeadPersistenceError ? 503 : 500;
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status });
  }
}
