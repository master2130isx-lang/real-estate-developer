/**
 * Configuración comercial centralizada.
 *
 * COMMERCIAL_CONFIG contiene únicamente los valores por defecto. La configuración real
 * se edita desde el panel (Configuración Comercial) y se guarda en Supabase; se combina
 * con estos valores mediante `mergeCommercialConfig` para que los campos nuevos siempre
 * tengan un valor.
 */

export interface TelegramRecipient {
  id: string;
  alias: string;
  chatId: string;
  isActive: boolean;
  createdAt?: string;
  notes?: string;
}

export interface ConnectivityItem {
  title: string;
  description: string;
}

/** Textos editables de la landing (cambian con cada fraccionamiento o campaña). */
export interface LandingContent {
  topBarText: string; // Vacío = "VISITAS PRIVADAS · {coverageZone}"
  heroEyebrow: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroBadge: string;
  propertiesIntro: string;
  whatsappDefaultMessage: string;
  mapQuery: string; // Dirección para Google Maps / Waze (vacío = officeAddressNote)
  accessBadge: string; // Ej. "Caseta 24/7" (vacío = se oculta)
  meetingPoint: string; // Ej. "Caseta de acceso con control 24/7"
  connectivity: ConnectivityItem[];
  footerDescription: string;
  footerDisclaimer: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ScheduleConfig {
  visitHours: string[];
  timezone: string;
}

export interface CommercialConfig {
  isDemoMode: boolean;
  agencyName: string;
  agencyLegalStatus: 'demostracion_pendiente_confirmacion' | 'confirmado';
  advisorName: string;
  advisorRole: string;
  advisorVerificationStatus: 'demostracion_sin_acreditacion_real' | 'verificado';
  coverageZone: string;
  contactChannels: {
    phone: string;
    whatsapp: string;
    email: string;
    officeAddressNote: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  telegramConfig?: {
    botToken?: string;
    botUsername?: string;
    advisorChatId?: string;
    activeChatId?: string;
    recipients?: TelegramRecipient[];
  };
  featuredPrice: {
    amountFormatted: string;
    hasSupportingOffer: boolean;
    referenceNote: string;
  };
  heroPropertyId?: string; // ID de la casa mostrada en la portada principal (Hero)
  attributionRules: {
    durationDays: number;
    requireNssForInfonavit: boolean;
    requireNssForBancario: boolean;
    requireNssForContado: boolean;
  };
  landing: LandingContent;
  schedule: ScheduleConfig;
}

export const DEFAULT_VISIT_HOURS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export const COMMERCIAL_CONFIG: CommercialConfig = {
  isDemoMode: false,
  heroPropertyId: 'prop-aguila-premier',
  agencyName: 'Valle de los Encinos - Salinas Victoria',
  agencyLegalStatus: 'confirmado',
  advisorName: 'Ismael Zapata',
  advisorRole: 'Asesor Certificado de Atención Inmobiliaria',
  advisorVerificationStatus: 'verificado',
  coverageZone: 'Valle de los Encinos, Salinas Victoria, N.L.',
  contactChannels: {
    phone: '+52 3143529773',
    whatsapp: '523143529773',
    email: 'master2130.isx@gmail.com',
    officeAddressNote: 'Calzada del Sol, Salinas Victoria, N.L. Atención con cita previa.',
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    youtube: '',
  },
  telegramConfig: {
    advisorChatId: process.env.TELEGRAM_ADVISOR_CHAT_ID || '948786976',
    activeChatId: '948786976',
    recipients: [
      {
        id: 'rec-dev',
        alias: 'Mi Celular (Developer)',
        chatId: '948786976',
        isActive: true,
        createdAt: '2026-09-26',
      },
    ],
  },
  featuredPrice: {
    amountFormatted: '$1,180,000 MXN',
    hasSupportingOffer: true,
    referenceNote: 'Precio para Modelo Águila Premier (98 m² terreno, 74.39 m² construcción) en Valle de los Encinos, Salinas Victoria, N.L.',
  },
  attributionRules: {
    durationDays: 15,
    requireNssForInfonavit: true,
    requireNssForBancario: false,
    requireNssForContado: false,
  },
  landing: {
    topBarText: '',
    heroEyebrow: 'Colección residencial 2026',
    heroTitle: 'Una casa que',
    heroTitleHighlight: 'se siente tuya.',
    heroDescription:
      'Diseñamos una forma de empezar: casas luminosas, un entorno tranquilo y el acompañamiento que necesitas para dar el siguiente paso.',
    heroCtaLabel: 'Conocer la casa muestra',
    heroBadge: 'Casa Muestra en Exhibición',
    propertiesIntro:
      'Vivienda de dos plantas en fraccionamiento privado con acceso controlado en Salinas Victoria, N.L. Conoce las fotografías reales de la casa muestra y agenda tu visita personalizada.',
    whatsappDefaultMessage:
      '¡Hola! Me interesa conocer más sobre las viviendas en la Zona Norte de Nuevo León. ¿Me podrían brindar información?',
    mapQuery: 'Calzada del Sol, Salinas Victoria, Nuevo León, México',
    accessBadge: 'Caseta 24/7',
    meetingPoint: 'Caseta de acceso con control 24/7',
    connectivity: [
      {
        title: 'Vialidades principales',
        description:
          'Conexión fluida hacia Carretera a Colombia, Libramiento Noreste y salidas rápidas hacia Escobedo y San Nicolás.',
      },
      {
        title: 'Transporte público',
        description: 'Rutas de transporte colectivo urbano con paradas accesibles sobre Calzada del Sol y avenidas perimetrales.',
      },
      {
        title: 'Escuelas y comercios locales',
        description: 'Planteles educativos de nivel básico, tiendas de autoservicio, farmacias y comercios a pocos minutos.',
      },
      {
        title: 'Centros de trabajo',
        description:
          'Ubicación estratégica próxima a los principales parques industriales y centros logísticos del norte metropolitano.',
      },
    ],
    footerDescription:
      'Asesoría inmobiliaria personalizada, catálogo de vivienda y acompañamiento integral para tu crédito Infonavit, FOVISSSTE o bancario.',
    footerDisclaimer:
      '* Los precios y especificaciones son de referencia y pueden cambiar sin previo aviso. Los gastos notariales y de escrituración varían según la legislación y el municipio aplicable.',
    seoTitle: 'Residencial & Asesoría Inmobiliaria | Valle de los Encinos',
    seoDescription:
      'Portal comercial y precalificación transparente para compra de vivienda con Infonavit, FOVISSSTE, crédito bancario o contado en Valle de los Encinos, Salinas Victoria, N.L.',
  },
  schedule: {
    visitHours: DEFAULT_VISIT_HOURS,
    timezone: 'America/Monterrey',
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Combina una configuración guardada (posiblemente parcial o de una versión anterior)
 * con los valores por defecto. Los objetos se combinan en profundidad; los arreglos
 * guardados reemplazan a los de por defecto.
 */
export function mergeCommercialConfig(base: CommercialConfig, override?: unknown): CommercialConfig {
  if (!isPlainObject(override)) return base;
  const merge = (a: unknown, b: unknown): unknown => {
    if (b === undefined) return a;
    if (isPlainObject(a) && isPlainObject(b)) {
      const result: Record<string, unknown> = { ...a };
      for (const [key, value] of Object.entries(b)) {
        result[key] = merge(a[key], value);
      }
      return result;
    }
    return b;
  };
  return merge(base, override) as CommercialConfig;
}

/** Texto del cintillo superior de la landing. */
export function getTopBarText(config: CommercialConfig): string {
  return config.landing.topBarText.trim() || `Visitas privadas · ${config.coverageZone}`;
}

/** Dirección usada para Google Maps / Waze. */
export function getMapQuery(config: CommercialConfig): string {
  return config.landing.mapQuery.trim() || config.contactChannels.officeAddressNote;
}

/**
 * Función centralizada que determina si un prospecto requiere NSS (Infonavit)
 */
export function shouldRequestNss(financingType: string, config: CommercialConfig = COMMERCIAL_CONFIG): boolean {
  if (financingType === 'infonavit') {
    return config.attributionRules.requireNssForInfonavit;
  }
  return false;
}

/**
 * Función centralizada que determina si un prospecto requiere CURP (FOVISSSTE)
 */
export function shouldRequestCurp(financingType: string): boolean {
  return financingType === 'fovissste' || financingType === 'issste';
}

/**
 * Determina si la forma de adquisición requiere algún identificador crediticio (NSS o CURP)
 */
export function shouldRequestCreditIdentifier(financingType: string): boolean {
  return shouldRequestNss(financingType) || shouldRequestCurp(financingType);
}
