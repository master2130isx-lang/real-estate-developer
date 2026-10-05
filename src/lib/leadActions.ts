/**
 * Acciones del panel sobre un prospecto.
 *
 * `applyLeadAction` es una función pura que se ejecuta en el servidor (PATCH /api/leads/[id])
 * para persistir el cambio, y en el navegador para mostrarlo de inmediato (actualización
 * optimista). Así notas, estados y confirmaciones ya no se pierden con la sincronización.
 */
import type { AppointmentStatus, CommercialStatus, Lead } from '@/types';
import { eventId } from '@/lib/leadFactory';
import { localTimestamp } from '@/lib/dateUtils';

export type LeadAction =
  | { type: 'status'; status: CommercialStatus; note?: string }
  | { type: 'note'; content: string }
  | { type: 'appointment'; status: AppointmentStatus; date?: string; time?: string }
  | { type: 'archive'; archive: boolean }
  | { type: 'attribution_confirm'; reference: string; confirmedAt: string; confirmedBy: string; notes?: string }
  | { type: 'attribution_conflict'; reason: string }
  | { type: 'attribution_expire' }
  | { type: 'nss_reveal'; reason: string };

export interface LeadActionContext {
  actor: string;
  durationDays: number;
  timezone?: string;
}

const COMMERCIAL_STATUSES: CommercialStatus[] = [
  'nuevo',
  'pendiente_info',
  'listo_revision',
  'contactado',
  'cita_solicitada',
  'cita_confirmada',
  'en_seguimiento',
  'cerrado',
  'no_compatible',
];
const APPOINTMENT_STATUSES: AppointmentStatus[] = ['solicitada', 'confirmada', 'reprogramada', 'cancelada', 'archivada'];

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Valida una acción recibida por la API. Devuelve null si no es válida. */
export function parseLeadAction(raw: unknown): LeadAction | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const a = raw as Record<string, unknown>;
  switch (a.type) {
    case 'status':
      return COMMERCIAL_STATUSES.includes(a.status as CommercialStatus)
        ? { type: 'status', status: a.status as CommercialStatus, note: text(a.note, 1000) || undefined }
        : null;
    case 'note': {
      const content = text(a.content, 2000);
      return content ? { type: 'note', content } : null;
    }
    case 'appointment':
      return APPOINTMENT_STATUSES.includes(a.status as AppointmentStatus)
        ? {
            type: 'appointment',
            status: a.status as AppointmentStatus,
            date: /^\d{4}-\d{2}-\d{2}$/.test(text(a.date, 10)) ? text(a.date, 10) : undefined,
            time: text(a.time, 20) || undefined,
          }
        : null;
    case 'archive':
      return { type: 'archive', archive: a.archive === true };
    case 'attribution_confirm': {
      const confirmedAt = text(a.confirmedAt, 16);
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(confirmedAt)) return null;
      return {
        type: 'attribution_confirm',
        reference: text(a.reference, 120),
        confirmedAt,
        confirmedBy: text(a.confirmedBy, 120),
        notes: text(a.notes, 1000) || undefined,
      };
    }
    case 'attribution_conflict': {
      const reason = text(a.reason, 500);
      return reason ? { type: 'attribution_conflict', reason } : null;
    }
    case 'attribution_expire':
      return { type: 'attribution_expire' };
    case 'nss_reveal': {
      const reason = text(a.reason, 500);
      return reason.length >= 5 ? { type: 'nss_reveal', reason } : null;
    }
    default:
      return null;
  }
}

/** Suma días a una marca local "YYYY-MM-DD HH:mm" sin depender de la zona horaria del equipo. */
export function addDaysToStamp(stamp: string, days: number): string {
  const [datePart, timePart = '00:00'] = stamp.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const base = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.toISOString().slice(0, 10)} ${timePart}`;
}

export function applyLeadAction(lead: Lead, action: LeadAction, ctx: LeadActionContext): Lead {
  const stamp = localTimestamp(new Date(), ctx.timezone);
  const nowIso = new Date().toISOString();
  const note = (content: string, author = ctx.actor) => ({ id: eventId('note'), author, createdAt: stamp, content });
  const audit = (actionText: string, reason?: string) => ({
    id: eventId('aud'),
    timestamp: nowIso,
    actor: ctx.actor,
    action: actionText,
    ...(reason ? { reason } : {}),
  });
  const notes = lead.internalNotes || [];
  const history = lead.auditHistory || [];

  switch (action.type) {
    case 'status':
      return {
        ...lead,
        commercialStatus: action.status,
        internalNotes: action.note ? [note(action.note), ...notes] : notes,
        auditHistory: [audit(`Estado comercial actualizado a '${action.status}'`), ...history],
      };

    case 'note':
      return { ...lead, internalNotes: [note(action.content), ...notes] };

    case 'appointment': {
      const existing = lead.appointmentRequest;
      const date = action.date || existing?.confirmedDate || existing?.preferredDate || stamp.slice(0, 10);
      const time = action.time || existing?.confirmedTime || existing?.timeSlot || '11:00 AM';
      const commercialStatus: CommercialStatus =
        action.status === 'confirmada'
          ? 'cita_confirmada'
          : action.status === 'reprogramada'
          ? 'cita_solicitada'
          : action.status === 'cancelada' || action.status === 'archivada'
          ? 'en_seguimiento'
          : lead.commercialStatus;
      return {
        ...lead,
        commercialStatus,
        isArchived: action.status === 'archivada' ? true : lead.isArchived,
        appointmentRequest: {
          modality: existing?.modality || 'presencial',
          preferredDate: existing?.preferredDate || date,
          timeSlot: existing?.timeSlot || time,
          notes: existing?.notes,
          status: action.status,
          statusBeforeArchive: action.status === 'archivada' ? existing?.status : existing?.statusBeforeArchive,
          confirmedDate: action.status === 'cancelada' ? existing?.confirmedDate : date,
          confirmedTime: action.status === 'cancelada' ? existing?.confirmedTime : time,
          cancelledAt: action.status === 'cancelada' ? nowIso : existing?.cancelledAt,
          archivedAt: action.status === 'archivada' ? nowIso : existing?.archivedAt,
        },
        internalNotes: [note(`Cita de visita ${action.status.toUpperCase()}: ${date} a las ${time}`), ...notes],
        auditHistory: [audit(`Visita ${action.status}: ${date} (${time})`), ...history],
      };
    }

    case 'archive': {
      const apt = lead.appointmentRequest;
      let appointmentRequest = apt;
      if (apt) {
        appointmentRequest = action.archive
          ? {
              ...apt,
              status: 'archivada',
              statusBeforeArchive: apt.status === 'archivada' ? apt.statusBeforeArchive : apt.status,
              archivedAt: nowIso,
            }
          : {
              ...apt,
              status: apt.status === 'archivada' ? apt.statusBeforeArchive || 'solicitada' : apt.status,
              statusBeforeArchive: undefined,
              archivedAt: undefined,
            };
      }
      return {
        ...lead,
        isArchived: action.archive,
        appointmentRequest,
        auditHistory: [audit(action.archive ? 'Prospecto archivado' : 'Prospecto restaurado del archivo'), ...history],
      };
    }

    case 'attribution_confirm': {
      const expiresAt = addDaysToStamp(action.confirmedAt, ctx.durationDays);
      return {
        ...lead,
        attributionStatus: 'confirmado',
        attributionConfirmedAt: action.confirmedAt,
        attributionExpiresAt: expiresAt,
        attributionReference: action.reference,
        attributionConfirmedBy: action.confirmedBy || ctx.actor,
        attributionNotes: action.notes,
        internalNotes: [
          note(
            `Registro confirmado en inmobiliaria. Ref: ${action.reference || 'Sin folio'}. Vigencia de ${ctx.durationDays} días hasta ${expiresAt}.`
          ),
          ...notes,
        ],
        auditHistory: [
          audit(
            `Registro interno confirmado en inmobiliaria (Folio/Ref: ${action.reference || 'N/A'})`,
            action.notes || 'Confirmación manual en mecanismo interno de inmobiliaria'
          ),
          ...history,
        ],
      };
    }

    case 'attribution_conflict':
      return {
        ...lead,
        attributionStatus: 'conflicto_rechazo',
        internalNotes: [note(`Conflicto en inmobiliaria: ${action.reason}. Atribución no asignada.`), ...notes],
        auditHistory: [audit('Registro en inmobiliaria rechazado / conflicto de duplicidad', action.reason), ...history],
      };

    case 'attribution_expire':
      return {
        ...lead,
        attributionStatus: 'vencido',
        internalNotes: [
          note(`Vigencia de atribución concluida (${lead.attributionExpiresAt || 'sin fecha'}).`, 'Sistema'),
          ...notes,
        ],
        auditHistory: [audit('Atribución vencida automáticamente'), ...history],
      };

    case 'nss_reveal':
      return {
        ...lead,
        auditHistory: [audit('CONSULTA DE NSS / CURP', action.reason), ...history],
      };
  }
}
