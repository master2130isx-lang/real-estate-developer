const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
const lines = env.split(/\r?\n/);
const envVars = {};
for (const line of lines) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
}

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const milanPhotos = [
    'https://jxipvyhigdjffrqrpuhf.supabase.co/storage/v1/object/public/property-images/milan/1790482176408-wjoq5n.webp',
    'https://jxipvyhigdjffrqrpuhf.supabase.co/storage/v1/object/public/property-images/milan/1790482176556-vulv5h.webp',
    'https://jxipvyhigdjffrqrpuhf.supabase.co/storage/v1/object/public/property-images/milan/1790482176707-3j0waq.webp',
    'https://jxipvyhigdjffrqrpuhf.supabase.co/storage/v1/object/public/property-images/milan/1790482177072-rjkh6w.webp'
  ];

  const aguilaPhotos = [
    '/images/properties/aguila-premier/01-facade.jpg',
    '/images/properties/aguila-premier/02-living-room-wide.jpg',
    '/images/properties/aguila-premier/03-living-room.jpg',
    '/images/properties/aguila-premier/04-living-dining.jpg',
    '/images/properties/aguila-premier/05-dining-room.jpg',
    '/images/properties/aguila-premier/06-kitchen-dining.jpg',
    '/images/properties/aguila-premier/07-kitchen.jpg',
    '/images/properties/aguila-premier/08-stairs-hall.jpg',
    '/images/properties/aguila-premier/09-hallway-upstairs.jpg',
    '/images/properties/aguila-premier/10-master-bedroom.jpg',
    '/images/properties/aguila-premier/11-master-bedroom-angle.jpg',
    '/images/properties/aguila-premier/12-secondary-bedroom.jpg',
    '/images/properties/aguila-premier/13-bathroom-upstairs.jpg',
    '/images/properties/aguila-premier/14-half-bathroom.jpg',
    '/images/properties/aguila-premier/15-patio-terrace.jpg',
    '/images/properties/aguila-premier/16-patio-garden.jpg',
    '/images/properties/aguila-premier/17-patio-side.jpg'
  ];

  const aguilaRow = {
    id: 'prop-aguila-premier',
    code: 'VDE-AGU-01',
    name: 'Valle de los Encinos',
    model: 'Modelo Águila Premier',
    development: 'Valle de los Encinos',
    address: 'Calzada del Sol, Salinas Victoria, N.L.',
    zone: 'Salinas Victoria, N.L. (Valle de los Encinos)',
    city: 'Salinas Victoria, N.L.',
    price: 1180000,
    price_formatted: '$1,180,000 MXN',
    bedrooms: 2,
    bathrooms: 1.5,
    has_stay_area: true,
    construction_m2: 74.39,
    land_m2: 98,
    parking_spots: 2,
    admitted_financing: ['infonavit', 'bancario', 'contado'],
    availability_status: 'disponible',
    last_updated: 'Septiembre 2026',
    estimated_closing_costs: 'Aprox. 5% a 7%',
    image: aguilaPhotos[0],
    images: aguilaPhotos,
    tags: ['Valle de los Encinos', 'Pet Park', 'Canchas Sintéticas'],
    description: 'Casa de dos plantas con 2 recámaras, estancia en planta alta, 1.5 baños, acabados con vitropiso, patio con pasillo lateral y estacionamiento para 2 autos en fraccionamiento privado.',
    key_features: ['2 recámaras con clóset', 'Estancia en planta alta', 'Vitropiso instalado', 'Patio con pasillo lateral'],
    amenities: ['Pet Park para mascotas', 'Canchas sintéticas', 'Palapa familiar', 'Acceso controlado 24/7'],
    nearby_services: ['Escuelas', 'Comercios', 'Rutas de transporte'],
    is_illustrative_demo: false,
    updated_at: new Date().toISOString()
  };

  const milanRow = {
    id: 'prop-milan',
    code: 'VDE-MIL-01',
    name: 'Valle de los Encinos',
    model: 'Modelo Milán',
    development: 'Valle de los Encinos',
    address: 'Calzada del Sol, Salinas Victoria, N.L.',
    zone: 'Salinas Victoria, N.L. (Valle de los Encinos)',
    city: 'Salinas Victoria, N.L.',
    price: 1250000,
    price_formatted: '$1,250,000 MXN',
    bedrooms: 2,
    bathrooms: 1.5,
    has_stay_area: true,
    construction_m2: 78.5,
    land_m2: 98,
    parking_spots: 2,
    admitted_financing: ['infonavit', 'bancario', 'contado'],
    availability_status: 'disponible',
    last_updated: 'Septiembre 2026',
    estimated_closing_costs: 'Aprox. 5% a 7%',
    image: milanPhotos[0],
    images: milanPhotos,
    tags: ['Valle de los Encinos', 'Fachada Contemporánea', 'Nuevo Modelo'],
    description: 'Hermosa residencia contemporánea de 2 plantas en fraccionamiento privado con caseta de vigilancia 24/7 y amenidades familiares.',
    key_features: ['2 recámaras amplias', 'Estancia familiar', 'Cochera para 2 autos', 'Patio de servicio'],
    amenities: ['Pet Park para mascotas', 'Canchas deportivas', 'Palapa para eventos', 'Acceso controlado'],
    nearby_services: ['Transporte público', 'Zonas comerciales', 'Escuelas'],
    is_illustrative_demo: false,
    updated_at: new Date().toISOString()
  };

  const { error: errAguila } = await supabase.from('properties').upsert(aguilaRow, { onConflict: 'id' });
  console.log('Upsert Aguila:', errAguila ? errAguila.message : 'OK');

  const { error: errMilan } = await supabase.from('properties').upsert(milanRow, { onConflict: 'id' });
  console.log('Upsert Milan:', errMilan ? errMilan.message : 'OK');

  const { data: allProps, error: selectErr } = await supabase.from('properties').select('id, name, model, price');
  console.log('Current properties in Supabase:', allProps, 'Select error:', selectErr);

  // También actualizar src/data/propertiesStore.json
  const storePath = path.join(process.cwd(), 'src', 'data', 'propertiesStore.json');
  const storeData = [
    {
      id: aguilaRow.id,
      code: aguilaRow.code,
      name: aguilaRow.name,
      model: aguilaRow.model,
      development: aguilaRow.development,
      address: aguilaRow.address,
      zone: aguilaRow.zone,
      city: aguilaRow.city,
      price: aguilaRow.price,
      priceFormatted: aguilaRow.price_formatted,
      bedrooms: aguilaRow.bedrooms,
      bathrooms: aguilaRow.bathrooms,
      hasStayArea: aguilaRow.has_stay_area,
      constructionM2: aguilaRow.construction_m2,
      landM2: aguilaRow.land_m2,
      parkingSpots: aguilaRow.parking_spots,
      admittedFinancing: aguilaRow.admitted_financing,
      availabilityStatus: aguilaRow.availability_status,
      lastUpdated: aguilaRow.last_updated,
      estimatedClosingCosts: aguilaRow.estimated_closing_costs,
      image: aguilaRow.image,
      images: aguilaRow.images,
      tags: aguilaRow.tags,
      description: aguilaRow.description,
      keyFeatures: aguilaRow.key_features,
      amenities: aguilaRow.amenities,
      nearbyServices: aguilaRow.nearby_services,
      isIllustrativeDemo: aguilaRow.is_illustrative_demo,
      isHero: false
    },
    {
      id: milanRow.id,
      code: milanRow.code,
      name: milanRow.name,
      model: milanRow.model,
      development: milanRow.development,
      address: milanRow.address,
      zone: milanRow.zone,
      city: milanRow.city,
      price: milanRow.price,
      priceFormatted: milanRow.price_formatted,
      bedrooms: milanRow.bedrooms,
      bathrooms: milanRow.bathrooms,
      hasStayArea: milanRow.has_stay_area,
      constructionM2: milanRow.construction_m2,
      landM2: milanRow.land_m2,
      parkingSpots: milanRow.parking_spots,
      admittedFinancing: milanRow.admitted_financing,
      availabilityStatus: milanRow.availability_status,
      lastUpdated: milanRow.last_updated,
      estimatedClosingCosts: milanRow.estimated_closing_costs,
      image: milanRow.image,
      images: milanRow.images,
      tags: milanRow.tags,
      description: milanRow.description,
      keyFeatures: milanRow.key_features,
      amenities: milanRow.amenities,
      nearbyServices: milanRow.nearby_services,
      isIllustrativeDemo: milanRow.is_illustrative_demo,
      isHero: true
    }
  ];

  fs.writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf-8');
  console.log('propertiesStore.json updated with both models!');
}

seed();
