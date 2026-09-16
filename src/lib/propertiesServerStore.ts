import fs from 'fs';
import path from 'path';
import { Property } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { getSupabase } from './supabaseClient';

const PROPERTIES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'propertiesStore.json');
const TMP_PROPERTIES_FILE_PATH = path.join('/tmp', 'propertiesStore.json');

// Memoria caché inicializada con el catálogo predeterminado
let inMemoryProperties: Property[] = [...PROPERTIES_DATA];

// ==============================================================================
// MAPEOS ENTRE DB (SNAKE_CASE) Y TYPESCRIPT (CAMELCASE)
// ==============================================================================

function propertyToDbRow(prop: Property): Record<string, any> {
  return {
    id: prop.id,
    code: prop.code,
    name: prop.name,
    model: prop.model,
    development: prop.development || 'Valle de los Encinos',
    address: prop.address || '',
    zone: prop.zone,
    city: prop.city,
    price: prop.price,
    price_formatted: prop.priceFormatted || `$${prop.price.toLocaleString('es-MX')} MXN`,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    has_stay_area: !!prop.hasStayArea,
    construction_m2: prop.constructionM2,
    land_m2: prop.landM2,
    parking_spots: prop.parkingSpots,
    admitted_financing: prop.admittedFinancing || ['infonavit', 'bancario', 'contado'],
    availability_status: prop.availabilityStatus || 'disponible',
    last_updated: prop.lastUpdated || new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
    estimated_closing_costs: prop.estimatedClosingCosts || 'Aprox. 5% a 7% (Escrituración y aranceles notariales en N.L.)',
    image: prop.image,
    images: prop.images || (prop.image ? [prop.image] : []),
    tags: prop.tags || [],
    description: prop.description || '',
    key_features: prop.keyFeatures || [],
    amenities: prop.amenities || [],
    nearby_services: prop.nearbyServices || [],
    is_illustrative_demo: !!prop.isIllustrativeDemo,
    updated_at: new Date().toISOString(),
  };
}

function dbRowToProperty(row: any): Property {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    model: row.model,
    development: row.development || 'Valle de los Encinos',
    address: row.address || '',
    zone: row.zone || 'Salinas Victoria, N.L.',
    city: row.city || 'Salinas Victoria, N.L.',
    price: Number(row.price) || 0,
    priceFormatted: row.price_formatted || `$${Number(row.price).toLocaleString('es-MX')} MXN`,
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 1,
    hasStayArea: !!row.has_stay_area,
    constructionM2: Number(row.construction_m2) || 0,
    landM2: Number(row.land_m2) || 0,
    parkingSpots: Number(row.parking_spots) || 1,
    admittedFinancing: Array.isArray(row.admitted_financing) ? row.admitted_financing : ['infonavit', 'bancario', 'contado'],
    availabilityStatus: row.availability_status || 'disponible',
    lastUpdated: row.last_updated || 'Actualizado recientemente',
    estimatedClosingCosts: row.estimated_closing_costs || 'Aprox. 5% a 7%',
    image: row.image || (row.images && row.images[0]) || '/images/properties/aguila-premier/01-facade.jpg',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [row.image || '/images/properties/aguila-premier/01-facade.jpg'],
    tags: Array.isArray(row.tags) ? row.tags : [],
    description: row.description || '',
    keyFeatures: Array.isArray(row.key_features) ? row.key_features : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    nearbyServices: Array.isArray(row.nearby_services) ? row.nearby_services : [],
    isIllustrativeDemo: !!row.is_illustrative_demo,
  };
}

// ==============================================================================
// FUNCIONES DE ALMACENAMIENTO LOCAL /tmp (RESPALDO Y DESARROLLO)
// ==============================================================================

function readPropertiesFromLocalStorage(): Property[] {
  try {
    if (fs.existsSync(TMP_PROPERTIES_FILE_PATH)) {
      const tmpData = fs.readFileSync(TMP_PROPERTIES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(tmpData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProperties = parsed;
        return parsed;
      }
    }
    if (fs.existsSync(PROPERTIES_FILE_PATH)) {
      const fileData = fs.readFileSync(PROPERTIES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProperties = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Advertencia al leer propertiesStore.json local, usando memoria:', error);
  }
  return inMemoryProperties;
}

function writePropertiesToLocalStorage(properties: Property[]): void {
  inMemoryProperties = properties;
  try {
    const dir = path.dirname(PROPERTIES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PROPERTIES_FILE_PATH, JSON.stringify(properties, null, 2), 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_PROPERTIES_FILE_PATH, JSON.stringify(properties, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Persistiendo propiedades únicamente en memoria:', tmpErr);
    }
  }
}

// ==============================================================================
// FUNCIONES PÚBLICAS DEL SERVIDOR
// ==============================================================================

/**
 * Obtiene todas las propiedades registradas
 */
export async function getServerProperties(): Promise<Property[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data && data.length > 0) {
        const parsed = data.map(dbRowToProperty);
        writePropertiesToLocalStorage(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Advertencia al consultar propiedades en Supabase, recurriendo a local:', err);
    }
  }

  return readPropertiesFromLocalStorage();
}

/**
 * Obtiene una propiedad específica por su ID o código
 */
export async function getServerPropertyById(id: string): Promise<Property | null> {
  const properties = await getServerProperties();
  return properties.find((p) => p.id === id || p.code === id) || null;
}

/**
 * Guarda o actualiza un modelo de propiedad
 */
export async function saveServerProperty(property: Property): Promise<Property> {
  // Asegurar formateo de precio si viene solo el numérico
  if (!property.priceFormatted && property.price) {
    property.priceFormatted = `$${property.price.toLocaleString('es-MX')} MXN`;
  }
  if (!property.lastUpdated) {
    property.lastUpdated = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  // 1. Guardar en local / memoria
  const localList = readPropertiesFromLocalStorage();
  const existingIndex = localList.findIndex((p) => p.id === property.id);

  if (existingIndex >= 0) {
    localList[existingIndex] = property;
  } else {
    localList.push(property);
  }

  writePropertiesToLocalStorage(localList);

  // 2. Persistir en Supabase si está disponible
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = propertyToDbRow(property);
      const { error } = await supabase
        .from('properties')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Error al guardar propiedad en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Fallo al persistir propiedad en Supabase:', err);
    }
  }

  return property;
}

/**
 * Elimina un modelo de propiedad
 */
export async function deleteServerProperty(id: string): Promise<boolean> {
  // 1. Eliminar de local / memoria
  const localList = readPropertiesFromLocalStorage();
  const filtered = localList.filter((p) => p.id !== id);
  writePropertiesToLocalStorage(filtered);

  // 2. Eliminar de Supabase si la tabla está disponible
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Aviso al eliminar propiedad en Supabase (usando local):', error.message);
      }
    } catch (err: any) {
      console.warn('Fallo al eliminar propiedad de Supabase:', err.message);
    }
  }

  return true;
}
