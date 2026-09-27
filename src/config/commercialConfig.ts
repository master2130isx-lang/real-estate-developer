/**
 * Configuración comercial centralizada para el prototipo (Fase 1.1)
 * Todo el contenido marcado como demostración debe identificarse claramente
 * hasta que el responsable del negocio confirme la información definitiva.
 */

export interface TelegramRecipient {
  id: string;
  alias: string;
  chatId: string;
  isActive: boolean;
  createdAt?: string;
  notes?: string;
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
}

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
};

/**
 * Función centralizada que determina si un prospecto requiere NSS (Infonavit)
 */
export function shouldRequestNss(financingType: string): boolean {
  if (financingType === 'infonavit') {
    return COMMERCIAL_CONFIG.attributionRules.requireNssForInfonavit;
  }
  return false;
}

/**
 * Función centralizada que determina si un prospecto requiere CURP (ISSSTE)
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
