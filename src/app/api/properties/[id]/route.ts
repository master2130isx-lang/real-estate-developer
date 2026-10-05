import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerPropertyById, saveServerProperty, deleteServerProperty } from '@/lib/propertiesServerStore';
import { Property } from '@/types';
import { requireAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await getServerPropertyById(id);

    if (!property) {
      return NextResponse.json({ ok: false, error: 'Propiedad no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, property });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const { id } = await params;
    const existing = await getServerPropertyById(id);

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Propiedad no encontrada' }, { status: 404 });
    }

    const updates = await req.json();

    const updatedProperty: Property = {
      ...existing,
      ...updates,
      id: existing.id, // Prevenir mutación de ID
      lastUpdated: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
    };

    if (updates.price) {
      updatedProperty.price = Number(updates.price);
      updatedProperty.priceFormatted = `$${updatedProperty.price.toLocaleString('es-MX')} MXN`;
    }

    const saved = await saveServerProperty(updatedProperty);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, property: saved });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const { id } = await params;
    const success = await deleteServerProperty(id);

    if (!success) {
      return NextResponse.json({ ok: false, error: 'No se pudo eliminar la propiedad' }, { status: 500 });
    }

    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, message: 'Propiedad eliminada con éxito' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
