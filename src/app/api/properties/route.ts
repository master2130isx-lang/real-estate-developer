import { NextRequest, NextResponse } from 'next/server';
import { getServerProperties, saveServerProperty } from '@/lib/propertiesServerStore';
import { Property } from '@/types';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DEFAULT_CLOSING_COSTS, PLACEHOLDER_PROPERTY_IMAGE } from '@/lib/propertyDefaults';
import { getErrorMessage } from '@/lib/errors';

export async function GET() {
  try {
    const properties = await getServerProperties();
    return NextResponse.json({ ok: true, properties });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const prop = body as Partial<Property>;

    if (!prop.name || !prop.model || !prop.price) {
      return NextResponse.json(
        { ok: false, error: 'Campos requeridos faltantes (nombre, modelo, precio)' },
        { status: 400 }
      );
    }

    // Generar ID único si no viene
    const id = prop.id || `prop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const code = prop.code || `MOD-${prop.model.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newProperty: Property = {
      id,
      code,
      name: prop.name,
      model: prop.model,
      development: prop.development || prop.name,
      address: prop.address || '',
      zone: prop.zone || prop.city || '',
      city: prop.city || '',
      price: Number(prop.price),
      priceFormatted: prop.priceFormatted || `$${Number(prop.price).toLocaleString('es-MX')} MXN`,
      bedrooms: Number(prop.bedrooms) || 2,
      bathrooms: Number(prop.bathrooms) || 1,
      hasStayArea: !!prop.hasStayArea,
      constructionM2: Number(prop.constructionM2) || 70,
      landM2: Number(prop.landM2) || 90,
      parkingSpots: Number(prop.parkingSpots) || 1,
      admittedFinancing: prop.admittedFinancing && prop.admittedFinancing.length > 0
        ? prop.admittedFinancing
        : ['infonavit', 'bancario', 'contado'],
      availabilityStatus: prop.availabilityStatus || 'disponible',
      lastUpdated: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
      estimatedClosingCosts: prop.estimatedClosingCosts || DEFAULT_CLOSING_COSTS,
      image: prop.image || (prop.images && prop.images[0]) || PLACEHOLDER_PROPERTY_IMAGE,
      images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [prop.image || PLACEHOLDER_PROPERTY_IMAGE],
      tags: prop.tags || [prop.development || prop.name],
      description: prop.description || '',
      keyFeatures: prop.keyFeatures || [],
      amenities: prop.amenities || [],
      nearbyServices: prop.nearbyServices || [],
      isIllustrativeDemo: false,
      isHero: !!prop.isHero,
    };

    const saved = await saveServerProperty(newProperty);
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, property: saved }, { status: 201 });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
