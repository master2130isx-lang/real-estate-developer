import { NextRequest, NextResponse } from 'next/server';
import { getServerProperties, saveServerProperty } from '@/lib/propertiesServerStore';
import { Property } from '@/types';

export async function GET() {
  try {
    const properties = await getServerProperties();
    return NextResponse.json({ ok: true, properties });
  } catch (error: any) {
    console.error('Error al obtener propiedades:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      development: prop.development || 'Valle de los Encinos',
      address: prop.address || 'Calzada del Sol, Salinas Victoria, N.L.',
      zone: prop.zone || 'Salinas Victoria, N.L. (Valle de los Encinos)',
      city: prop.city || 'Salinas Victoria, N.L.',
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
      estimatedClosingCosts: prop.estimatedClosingCosts || 'Aprox. 5% a 7% (Escrituración y aranceles notariales en N.L.)',
      image: prop.image || (prop.images && prop.images[0]) || '/images/properties/aguila-premier/01-facade.jpg',
      images: Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [prop.image || '/images/properties/aguila-premier/01-facade.jpg'],
      tags: prop.tags || [prop.development || 'Valle de los Encinos'],
      description: prop.description || '',
      keyFeatures: prop.keyFeatures || [],
      amenities: prop.amenities || [],
      nearbyServices: prop.nearbyServices || [],
      isIllustrativeDemo: false,
    };

    const saved = await saveServerProperty(newProperty);
    return NextResponse.json({ ok: true, property: saved }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear propiedad:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
