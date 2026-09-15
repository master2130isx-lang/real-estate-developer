import fs from 'fs';
import path from 'path';
import { Lead } from '@/types';
import { INITIAL_LEADS } from '@/data/mockData';
import { getSupabase } from './supabaseClient';

// Ruta del archivo local para persistencia de respaldo (fallback) en servidor
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'leadsStore.json');
const TMP_DATA_FILE_PATH = path.join('/tmp', 'leadsStore.json');

// Memoria caché para entornos donde el sistema de archivos sea de solo lectura
let inMemoryLeads: Lead[] = [...INITIAL_LEADS];

// ==============================================================================
// MAPEOS ENTRE DB (SNAKE_CASE) Y TYPESCRIPT (CAMELCASE)
// ==============================================================================

function leadToDbRow(lead: Lead): Record<string, any> {
  return {
    id: lead.id,
    folio: lead.folio,
    created_at: lead.createdAt,
    full_name: lead.fullName,
    phone: lead.phone,
    email: lead.email || null,
    preferred_channel: lead.preferredChannel || 'whatsapp',
    preferred_contact_time: lead.preferredContactTime || 'tarde',
    interested_zone: lead.interestedZone || 'Salinas Victoria, N.L. (Valle de los Encinos)',
    selected_property_id: lead.selectedPropertyId || null,
    selected_property_title: lead.selectedPropertyTitle || null,
    budget_range: lead.budgetRange || 'aun_no_lo_se',
    purchase_timeline: lead.purchaseTimeline || 'corto',
    financing_type: lead.financingType || 'infonavit',
    financing_subtype: lead.financingSubtype || null,
    needs_orientation: !!lead.needsOrientation,
    privacy_consent_accepted: lead.privacyConsentAccepted ?? true,
    marketing_consent_accepted: !!lead.marketingConsentAccepted,
    nss_status: lead.nssStatus || 'no_aplica',
    nss_value_encrypted_mock: lead.nssValueEncryptedMock || null,
    nss_last_four: lead.nssLastFour || null,
    attribution_status: lead.attributionStatus || 'no_aplica',
    attribution_advisor: lead.attributionAdvisor || null,
    attribution_confirmed_at: lead.attributionConfirmedAt || null,
    attribution_expires_at: lead.attributionExpiresAt || null,
    attribution_reference: lead.attributionReference || null,
    attribution_confirmed_by: lead.attributionConfirmedBy || null,
    attribution_notes: lead.attributionNotes || null,
    commercial_status: lead.commercialStatus || 'nuevo',
    compatibility: lead.compatibility || 'media',
    next_action: lead.nextAction || '',
    assigned_advisor: lead.assignedAdvisor || '',
    appointment_request: lead.appointmentRequest || null,
    is_archived: !!lead.isArchived,
    internal_notes: Array.isArray(lead.internalNotes) ? lead.internalNotes : [],
    audit_history: Array.isArray(lead.auditHistory) ? lead.auditHistory : [],
    db_updated_at: new Date().toISOString(),
  };
}

function dbRowToLead(row: any): Lead {
  return {
    id: row.id,
    folio: row.folio,
    createdAt: row.created_at,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || undefined,
    preferredChannel: row.preferred_channel || 'whatsapp',
    preferredContactTime: row.preferred_contact_time || 'tarde',
    interestedZone: row.interested_zone || 'Salinas Victoria, N.L. (Valle de los Encinos)',
    selectedPropertyId: row.selected_property_id || undefined,
    selectedPropertyTitle: row.selected_property_title || undefined,
    budgetRange: row.budget_range || 'aun_no_lo_se',
    purchaseTimeline: row.purchase_timeline || 'corto',
    financingType: row.financing_type || 'infonavit',
    financingSubtype: row.financing_subtype || undefined,
    needsOrientation: !!row.needs_orientation,
    privacyConsentAccepted: row.privacy_consent_accepted ?? true,
    marketingConsentAccepted: !!row.marketing_consent_accepted,
    nssStatus: row.nss_status || 'no_aplica',
    nssValueEncryptedMock: row.nss_value_encrypted_mock || undefined,
    nssLastFour: row.nss_last_four || undefined,
    attributionStatus: row.attribution_status || 'no_aplica',
    attributionAdvisor: row.attribution_advisor || undefined,
    attributionConfirmedAt: row.attribution_confirmed_at || undefined,
    attributionExpiresAt: row.attribution_expires_at || undefined,
    attributionReference: row.attribution_reference || undefined,
    attributionConfirmedBy: row.attribution_confirmed_by || undefined,
    attributionNotes: row.attribution_notes || undefined,
    commercialStatus: row.commercial_status || 'nuevo',
    compatibility: row.compatibility || 'media',
    nextAction: row.next_action || '',
    assignedAdvisor: row.assigned_advisor || '',
    appointmentRequest: row.appointment_request || undefined,
    isArchived: !!row.is_archived,
    internalNotes: Array.isArray(row.internal_notes) ? row.internal_notes : [],
    auditHistory: Array.isArray(row.audit_history) ? row.audit_history : [],
  };
}

// ==============================================================================
// FUNCIONES DE ALMACENAMIENTO LOCAL /tmp (FALLBACK)
// ==============================================================================

function readFromLocalStorage(): Lead[] {
  try {
    if (fs.existsSync(TMP_DATA_FILE_PATH)) {
      const tmpData = fs.readFileSync(TMP_DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(tmpData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLeads = parsed;
        return parsed;
      }
    }
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLeads = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Advertencia al leer leadsStore.json local, usando memoria:', error);
  }
  return inMemoryLeads;
}

function writeToLocalStorage(leads: Lead[]): void {
  inMemoryLeads = leads;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_DATA_FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Persistiendo únicamente en memoria de la función serverless:', tmpErr);
    }
  }
}

// ==============================================================================
// OPERACIONES PRINCIPALES CON SOPORTE SUPABASE + FALLBACK TRANSPARENTE
// ==============================================================================

export async function getServerLeads(): Promise<Lead[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Si la tabla de Supabase está recién creada y vacía, auto-sembrar los leads de demostración
        if (data.length === 0 && INITIAL_LEADS.length > 0) {
          const rowsToSeed = INITIAL_LEADS.map(leadToDbRow);
          await supabase.from('leads').insert(rowsToSeed);
          return INITIAL_LEADS;
        }

        return data.map(dbRowToLead);
      }
      if (error) {
        console.warn('Fallo consulta a Supabase leads, usando fallback local:', error.message);
      }
    } catch (err) {
      console.warn('Error de conexión a Supabase leads, usando fallback local:', err);
    }
  }

  return readFromLocalStorage();
}

export async function getServerLeadById(id: string): Promise<Lead | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return dbRowToLead(data);
      }
    } catch (err) {
      console.warn('Error al buscar lead por ID en Supabase:', err);
    }
  }

  const localLeads = readFromLocalStorage();
  return localLeads.find((l) => l.id === id) || null;
}

export async function saveServerLead(lead: Lead): Promise<Lead> {
  // 1. Guardar siempre en local/tmp como respaldo inmediato
  const localLeads = readFromLocalStorage();
  const existingIdx = localLeads.findIndex((l) => l.id === lead.id);
  if (existingIdx >= 0) {
    localLeads[existingIdx] = lead;
  } else {
    localLeads.unshift(lead);
  }
  writeToLocalStorage(localLeads);

  // 2. Persistir en Supabase PostgreSQL si está configurado
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = leadToDbRow(lead);
      const { error } = await supabase.from('leads').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error('Error al hacer upsert en Supabase leads:', error.message);
      }
    } catch (err) {
      console.error('Error al persistir lead en Supabase:', err);
    }
  }

  return lead;
}

export async function updateServerLeadAppointment(
  leadId: string,
  appointmentStatus: 'confirmada' | 'cancelada' | 'reprogramada' | 'archivada',
  confirmedDate?: string,
  confirmedTime?: string
): Promise<Lead | null> {
  const lead = await getServerLeadById(leadId);
  if (!lead) return null;

  const existingReq = lead.appointmentRequest;
  const newDate =
    confirmedDate || existingReq?.confirmedDate || existingReq?.preferredDate || new Date().toISOString().split('T')[0];
  const newTime =
    confirmedTime || existingReq?.confirmedTime || existingReq?.timeSlot || '11:00 AM';

  lead.appointmentRequest = {
    modality: existingReq?.modality || 'presencial',
    preferredDate: newDate,
    timeSlot: newTime,
    status: appointmentStatus,
    confirmedDate: newDate,
    confirmedTime: newTime,
    cancelledAt: appointmentStatus === 'cancelada' ? new Date().toISOString() : existingReq?.cancelledAt,
    archivedAt: appointmentStatus === 'archivada' ? new Date().toISOString() : existingReq?.archivedAt,
    notes: existingReq?.notes || 'Actualizado vía Bot de Telegram o Panel Web',
  };

  if (appointmentStatus === 'confirmada') {
    lead.commercialStatus = 'cita_confirmada';
  } else if (appointmentStatus === 'cancelada' || appointmentStatus === 'archivada') {
    lead.commercialStatus = 'en_seguimiento';
  } else if (appointmentStatus === 'reprogramada') {
    lead.commercialStatus = 'cita_solicitada';
  }

  if (appointmentStatus === 'archivada') {
    lead.isArchived = true;
  }

  lead.internalNotes = [
    {
      id: `note-${Date.now()}`,
      author: 'Bot de Telegram / Sistema',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: `Visita ${appointmentStatus.toUpperCase()} para el ${newDate} (${newTime}) desde interacción del asesor.`,
    },
    ...lead.internalNotes,
  ];

  lead.auditHistory = [
    {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Bot de Telegram / Sistema',
      action: `Visita marcada como ${appointmentStatus.toUpperCase()}`,
    },
    ...lead.auditHistory,
  ];

  await saveServerLead(lead);
  return lead;
}
