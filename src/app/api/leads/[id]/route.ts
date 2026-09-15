import { NextRequest, NextResponse } from 'next/server';
import { updateServerLeadAppointment, getServerLeadById } from '@/lib/leadsServerStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const lead = await getServerLeadById(id);
    if (!lead) {
      return NextResponse.json({ ok: false, error: 'Prospecto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lead });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { appointmentStatus, confirmedDate, confirmedTime } = body;

    if (!appointmentStatus) {
      return NextResponse.json({ ok: false, error: 'Se requiere appointmentStatus' }, { status: 400 });
    }

    const updatedLead = await updateServerLeadAppointment(
      id,
      appointmentStatus,
      confirmedDate,
      confirmedTime
    );

    if (!updatedLead) {
      return NextResponse.json({ ok: false, error: 'Prospecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
