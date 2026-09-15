/**
 * Configuración comercial centralizada para el prototipo (Fase 1.1)
 * Todo el contenido marcado como demostración debe identificarse claramente
 * hasta que el responsable del negocio confirme la información definitiva.
 */

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
    advisorChatId?: string;
  };
  featuredPrice: {
    amountFormatted: string;
    hasSupportingOffer: boolean;
    referenceNote: string;
  };
  attributionRules: {
    durationDays: number;
    requireNssForInfonavit: boolean;
    requireNssForBancario: boolean;
    requireNssForContado: boolean;
  };
}

export const COMMERCIAL_CONFIG: CommercialConfig = {
  isDemoMode: false,
  agencyName: 'Valle de los Encinos - Salinas Victoria',
  agencyLegalStatus: 'demostracion_pendiente_confirmacion',
  advisorName: 'Asesor Comercial Asignado',
  advisorRole: 'Asesor Certificado de Atención Inmobiliaria',
  advisorVerificationStatus: 'verificado',
  coverageZone: 'Valle de los Encinos, Salinas Victoria, N.L.',
  contactChannels: {
    phone: '+52 33 4254 6271',
    whatsapp: '523342546271',
    email: 'atencion@valledelosencinos.com',
    officeAddressNote: 'Calzada del Sol, Salinas Victoria, N.L. Atención con cita previa.',
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    youtube: '',
  },
  telegramConfig: {
    botToken: '8744099329:AAEKPsqni4ugVioOXYd7dMi3zZREBP0RrKc',
    advisorChatId: '948786976',
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
};

/**
 * Función centralizada que determina si un prospecto requiere NSS
 * según las reglas comerciales de la inmobiliaria.
 */
export function shouldRequestNss(financingType: string): boolean {
  if (financingType === 'infonavit') {
    return COMMERCIAL_CONFIG.attributionRules.requireNssForInfonavit;
  }
  if (financingType === 'bancario') {
    return COMMERCIAL_CONFIG.attributionRules.requireNssForBancario;
  }
  if (financingType === 'contado') {
    return COMMERCIAL_CONFIG.attributionRules.requireNssForContado;
  }
  return false;
}
