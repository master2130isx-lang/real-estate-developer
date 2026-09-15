export type FinancingType =
  | 'infonavit'
  | 'bancario'
  | 'contado'
  | 'otro'
  | 'necesita_orientacion';

export type PurchaseTimeline =
  | 'inmediato' // Menos de 30 días
  | 'corto' // 1 a 3 meses
  | 'medio' // 3 a 6 meses
  | 'explorando'; // Más de 6 meses / solo explorando

export type BudgetRange =
  | 'hasta_1.2m'
  | '1.2m_a_1.6m'
  | '1.6m_a_2.2m'
  | 'mas_de_2.2m'
  | 'aun_no_lo_se';

export type CommercialStatus =
  | 'nuevo'
  | 'pendiente_info'
  | 'listo_revision'
  | 'contactado'
  | 'cita_solicitada'
  | 'cita_confirmada'
  | 'en_seguimiento'
  | 'cerrado'
  | 'no_compatible';

export type NssStatus =
  | 'no_aplica'
  | 'pendiente'
  | 'recibido'
  | 'eliminado_conservacion';

/**
 * Estados del seguimiento de atribución comercial en el sistema interno de la inmobiliaria (15 días).
 * IMPORTANTE: Un envío web NUNCA crea automáticamente un registro confirmado.
 * El paso web solo puede avanzar hasta 'pendiente_inmobiliaria'.
 */
export type AttributionStatus =
  | 'no_aplica'                 // Para esquemas que no aplican registro por NSS
  | 'pendiente_nss'             // El usuario solicitó orientación previa sin ingresar NSS
  | 'pendiente_inmobiliaria'    // NSS recibido en web; pendiente que el asesor registre en inmobiliaria
  | 'confirmado'                // Bloqueo / asignación confirmado en la inmobiliaria (15 días activos)
  | 'conflicto_rechazo'         // Duplicado, ya asignado a otro asesor o rechazado por la inmobiliaria
  | 'vencido';                  // Concluyeron los 15 días sin cierre ni renovación

export type CompatibilityLevel = 'alta' | 'media' | 'baja' | 'requiere_orientacion';

export type ContactChannel = 'whatsapp' | 'llamada' | 'correo';

export type PreferredContactTime = 'manana' | 'tarde' | 'noche';

export interface Property {
  id: string;
  code: string;
  name: string;
  model: string;
  development?: string;
  address?: string;
  zone: string;
  city: string;
  price: number;
  priceFormatted: string;
  bedrooms: number;
  bathrooms: number;
  hasStayArea?: boolean; // Estancia
  constructionM2: number;
  landM2: number;
  parkingSpots: number;
  admittedFinancing: FinancingType[];
  availabilityStatus: 'disponible' | 'ultimas_unidades' | 'preventa' | 'agotado';
  lastUpdated: string;
  estimatedClosingCosts: string; // Gastos de escrituración estimados
  image: string;
  images?: string[]; // Galería de fotografías
  tags: string[];
  description: string;
  keyFeatures: string[];
  amenities?: string[]; // Pet park, canchas, palapa, acceso controlado
  nearbyServices?: string[]; // Escuelas, comercios, transporte
  isIllustrativeDemo: boolean;
}

export interface AppointmentRequest {
  modality: 'presencial' | 'virtual';
  preferredDate: string;
  timeSlot: '10:00 - 13:00' | '14:00 - 17:00' | '17:00 - 19:00' | 'sabado_manana' | string;
  notes?: string;
  status: 'solicitada' | 'confirmada' | 'reprogramada' | 'cancelada' | 'archivada';
  confirmedDate?: string;
  confirmedTime?: string;
  cancelledAt?: string;
  archivedAt?: string;
}

export interface LeadNote {
  id: string;
  author: string;
  createdAt: string;
  content: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  reason?: string;
  ipMasked?: string;
}

export interface Lead {
  id: string;
  folio: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredChannel: ContactChannel;
  preferredContactTime: PreferredContactTime;
  interestedZone: string;
  selectedPropertyId?: string;
  selectedPropertyTitle?: string;
  budgetRange: BudgetRange;
  purchaseTimeline: PurchaseTimeline;
  financingType: FinancingType;
  financingSubtype?: string;
  needsOrientation: boolean;
  privacyConsentAccepted: boolean;
  marketingConsentAccepted: boolean;
  
  // Manejo de NSS
  nssStatus: NssStatus;
  nssValueEncryptedMock?: string; // Simulación de demostración (no guardar en claro en prod)
  nssLastFour?: string; // Para ofuscación segura
  
  // Seguimiento de atribución comercial interna (15 días)
  attributionStatus: AttributionStatus;
  attributionAdvisor?: string;
  attributionConfirmedAt?: string;
  attributionExpiresAt?: string;
  attributionReference?: string;
  attributionConfirmedBy?: string;
  attributionNotes?: string;

  // Gestión comercial y de citas
  commercialStatus: CommercialStatus;
  compatibility: CompatibilityLevel;
  nextAction: string;
  assignedAdvisor: string;
  
  appointmentRequest?: AppointmentRequest;
  isArchived?: boolean;
  internalNotes: LeadNote[];
  auditHistory: AuditEvent[];
}

export interface FunnelEvent {
  eventName:
    | 'visita_landing'
    | 'consulta_propiedad'
    | 'inicio_precalificacion'
    | 'paso_completado'
    | 'paso_nss_presentado'
    | 'paso_nss_completado'
    | 'paso_nss_omitido'
    | 'solicitud_enviada'
    | 'cita_solicitada';
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}
