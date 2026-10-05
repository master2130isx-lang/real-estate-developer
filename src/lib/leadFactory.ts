/**
 * Construcción de prospectos (Lead) a partir de la entrada de los formularios.
 *
 * Se ejecuta en el servidor (POST /api/leads): el navegador solo envía los datos que el
 * usuario capturó y el servidor genera id, folio, estados de atribución, notas y bitácora.
 * Así nadie puede crear un prospecto "ya confirmado" ni sobrescribir uno existente.
 */
import type { AttributionStatus, FinancingType, Lead, LeadSource, Property, ContactChannel } from '@/types';
import type { CommercialConfig } from '@/config/commercialConfig';
import { shouldRequestCurp, shouldRequestNss } from '@/config/commercialConfig';
import { localDateISO, localTimestamp } from '@/lib/dateUtils';
import { resolveHeroProperty } from '@/lib/heroProperty';

export interface LeadInput {
  fullName: string;
  phone: string;
  email?: string;
  financingType: FinancingType;
  selectedPropertyId?: string;
  preferredChannel?: ContactChannel;
  needsOrientation?: boolean;
  marketingConsentAccepted?: boolean;
  rawNss?: string;
  rawCurp?: string;
  appointment?: {
    preferredDate: string;
    timeSlot: string;
    notes?: string;
  };
  leadSource?: LeadSource;
}

const FINANCING_TYPES: FinancingType[] = ['infonavit', 'fovissste', 'bancario', 'contado', 'otro', 'necesita_orientacion'];
const CHANNELS: ContactChannel[] = ['whatsapp', 'llamada', 'correo'];
const SOURCE_CHANNELS: LeadSource['channel'][] = ['landing', 'registro', 'solicitar_visita', 'panel'];
/** Formato oficial de CURP: 18 caracteres (se usa también en los formularios). */
export const CURP_REGEX = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/** Genera un sufijo aleatorio legible (sin caracteres ambiguos). */
export function randomCode(length = 4): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/** Folio único y legible: PREFIJO-AAMMDD-XXXX (ej. LEAD-261005-K3F9). */
export function generateFolio(prefix: 'LEAD' | 'AGEND', timezone?: string): string {
  const date = localDateISO(new Date(), timezone).replace(/-/g, '').slice(2);
  return `${prefix}-${date}-${randomCode(4)}`;
}

/** Identificador corto para notas y eventos de bitácora. */
export function eventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomCode(4).toLowerCase()}`;
}

/**
 * Valida y limpia la entrada recibida del navegador.
 * Devuelve `{ input }` si es válida o `{ error }` con un mensaje para el usuario.
 */
export function parseLeadInput(raw: unknown): { input?: LeadInput; error?: string } {
  if (typeof raw !== 'object' || raw === null) return { error: 'Datos de prospecto inválidos' };
  const body = raw as Record<string, unknown>;

  const fullName = str(body.fullName, 120);
  if (!fullName || fullName.length < 3) return { error: 'Ingresa tu nombre completo' };

  let phone = String(body.phone ?? '').replace(/\D/g, '');
  if (phone.length === 12 && phone.startsWith('52')) phone = phone.slice(2);
  if (phone.length !== 10) return { error: 'Ingresa un número celular a 10 dígitos' };

  const financingType = FINANCING_TYPES.includes(body.financingType as FinancingType)
    ? (body.financingType as FinancingType)
    : 'necesita_orientacion';

  const rawNssDigits = String(body.rawNss ?? '').replace(/\D/g, '');
  const rawCurpClean = String(body.rawCurp ?? '').trim().toUpperCase();

  const input: LeadInput = {
    fullName,
    phone,
    email: str(body.email, 200),
    financingType,
    selectedPropertyId: str(body.selectedPropertyId, 100),
    preferredChannel: CHANNELS.includes(body.preferredChannel as ContactChannel)
      ? (body.preferredChannel as ContactChannel)
      : 'whatsapp',
    needsOrientation: body.needsOrientation === true,
    marketingConsentAccepted: body.marketingConsentAccepted === true,
    rawNss: rawNssDigits.length === 11 ? rawNssDigits : undefined,
    rawCurp: CURP_REGEX.test(rawCurpClean) ? rawCurpClean : undefined,
  };

  if (typeof body.appointment === 'object' && body.appointment !== null) {
    const apt = body.appointment as Record<string, unknown>;
    const preferredDate = str(apt.preferredDate, 10);
    const timeSlot = str(apt.timeSlot, 20);
    if (preferredDate && /^\d{4}-\d{2}-\d{2}$/.test(preferredDate) && timeSlot) {
      input.appointment = { preferredDate, timeSlot, notes: str(apt.notes, 500) };
    }
  }

  if (typeof body.leadSource === 'object' && body.leadSource !== null) {
    const src = body.leadSource as Record<string, unknown>;
    input.leadSource = {
      channel: SOURCE_CHANNELS.includes(src.channel as LeadSource['channel'])
        ? (src.channel as LeadSource['channel'])
        : 'landing',
      utmSource: str(src.utmSource, 100),
      utmMedium: str(src.utmMedium, 100),
      utmCampaign: str(src.utmCampaign, 100),
      utmContent: str(src.utmContent, 100),
      referrer: str(src.referrer, 200),
    };
  }

  return { input };
}

interface BuildContext {
  config: CommercialConfig;
  properties: Property[];
  /** 'web' = formulario público; 'panel' = cita registrada por el asesor autenticado. */
  origin: 'web' | 'panel';
  actor?: string;
}

/** Construye el Lead completo a partir de una entrada ya validada. */
export function buildLead(input: LeadInput, ctx: BuildContext): Lead {
  const { config, properties, origin } = ctx;
  const timezone = config.schedule?.timezone;
  const now = new Date();
  const stamp = localTimestamp(now, timezone);
  const isPanel = origin === 'panel';
  const actor = ctx.actor || (isPanel ? config.advisorName : 'Sistema');

  const property =
    properties.find((p) => p.id === input.selectedPropertyId) || resolveHeroProperty(properties, config);

  // REGLA FUNDAMENTAL: identificador recibido (NSS o CURP) ≠ bloqueo confirmado en la inmobiliaria
  const isNssApplicable = shouldRequestNss(input.financingType, config);
  const isCurpApplicable = shouldRequestCurp(input.financingType);
  let nssStatus: Lead['nssStatus'] = 'no_aplica';
  let attributionStatus: AttributionStatus = 'no_aplica';

  if (isNssApplicable) {
    nssStatus = input.rawNss ? 'recibido' : 'pendiente';
    attributionStatus = input.rawNss ? 'pendiente_inmobiliaria' : 'pendiente_nss';
  } else if (isCurpApplicable) {
    attributionStatus = input.rawCurp ? 'pendiente_inmobiliaria' : 'pendiente_nss';
  }

  const needsOrientation = input.needsOrientation || input.financingType === 'necesita_orientacion';
  const compatibility: Lead['compatibility'] = needsOrientation
    ? 'requiere_orientacion'
    : input.rawNss || input.rawCurp || input.financingType === 'contado' || input.financingType === 'bancario'
    ? 'alta'
    : 'media';

  const meetingPoint = config.landing?.meetingPoint || 'caseta de acceso';
  let nextAction: string;
  if (isPanel && input.appointment) {
    nextAction = `Recibir a ${input.fullName} en ${meetingPoint} el ${input.appointment.preferredDate} a las ${input.appointment.timeSlot}`;
  } else if (attributionStatus === 'pendiente_inmobiliaria') {
    nextAction = isCurpApplicable
      ? 'Registrar CURP en sistema interno de la inmobiliaria y preparar mensaje de WhatsApp'
      : 'Registrar NSS en sistema interno de la inmobiliaria y preparar mensaje de WhatsApp';
  } else {
    nextAction = 'Preparar mensaje de WhatsApp para dar atención y confirmar visita';
  }

  const attributionNote =
    attributionStatus === 'pendiente_inmobiliaria'
      ? 'Pendiente de registrar en inmobiliaria (identificador recibido; no constituye bloqueo confirmado).'
      : attributionStatus === 'pendiente_nss'
      ? 'El prospecto eligió recibir orientación antes de compartir su NSS / CURP.'
      : 'No aplica atribución por NSS / CURP para este esquema.';

  const appointmentStatus = isPanel ? 'confirmada' : 'solicitada';

  return {
    id: `lead-${Date.now()}-${randomCode(6).toLowerCase()}`,
    folio: generateFolio(isPanel ? 'AGEND' : 'LEAD', timezone),
    createdAt: stamp,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    preferredChannel: input.preferredChannel || 'whatsapp',
    preferredContactTime: 'tarde',
    interestedZone: property?.zone || config.coverageZone,
    selectedPropertyId: property?.id,
    selectedPropertyTitle: property ? `${property.model} (${property.priceFormatted})` : undefined,
    budgetRange: 'aun_no_lo_se',
    purchaseTimeline: isPanel ? 'inmediato' : 'corto',
    financingType: input.financingType,
    needsOrientation,
    privacyConsentAccepted: true,
    marketingConsentAccepted: !!input.marketingConsentAccepted,
    nssStatus,
    nssLastFour: input.rawNss ? input.rawNss.slice(-4) : undefined,
    nssValueEncryptedMock: input.rawNss,
    curpValue: input.rawCurp,
    curpLastFour: input.rawCurp ? input.rawCurp.slice(-4) : undefined,
    attributionStatus,
    commercialStatus: input.appointment ? (isPanel ? 'cita_confirmada' : 'cita_solicitada') : 'nuevo',
    compatibility,
    nextAction,
    assignedAdvisor: config.advisorName,
    appointmentRequest: input.appointment
      ? {
          modality: 'presencial',
          preferredDate: input.appointment.preferredDate,
          timeSlot: input.appointment.timeSlot,
          notes: input.appointment.notes || (isPanel ? 'Cita agendada directamente por el asesor comercial.' : undefined),
          status: appointmentStatus,
          ...(isPanel
            ? { confirmedDate: input.appointment.preferredDate, confirmedTime: input.appointment.timeSlot }
            : {}),
        }
      : undefined,
    leadSource: input.leadSource || { channel: isPanel ? 'panel' : 'landing' },
    internalNotes: [
      {
        id: eventId('note'),
        author: actor,
        createdAt: stamp,
        content: isPanel
          ? `Cita registrada directamente en agenda${input.appointment ? ` para el ${input.appointment.preferredDate} (${input.appointment.timeSlot})` : ''}. ${attributionNote}`
          : `Solicitud recibida vía web. Estado de atribución: ${attributionNote}`,
      },
    ],
    auditHistory: [
      {
        id: eventId('aud'),
        timestamp: now.toISOString(),
        actor,
        action: isPanel
          ? `Cita agendada desde el panel. Atribución: ${attributionStatus}`
          : `Registro web completado. Atribución: ${attributionStatus}`,
      },
    ],
  };
}
