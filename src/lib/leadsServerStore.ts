import fs from 'fs';
import path from 'path';
import { Lead } from '@/types';
import { INITIAL_LEADS } from '@/data/mockData';
import { getSupabase } from './supabaseClient';
import { applyLeadAction, type LeadAction, type LeadActionContext } from './leadActions';

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
    interested_zone: lead.interestedZone || '',
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
    curp_value: lead.curpValue || null,
    curp_last_four: lead.curpLastFour || null,
    lead_source: lead.leadSource || null,
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
    interestedZone: row.interested_zone || '',
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
    curpValue: row.curp_value || undefined,
    curpLastFour: row.curp_last_four || undefined,
    leadSource: row.lead_source || undefined,
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
        // Mapear filas existentes (si está vacía, devuelve [] respetando la limpieza del developer)
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

/**
 * Purgado completo de prospectos y citas (Exclusivo Developer)
 * Elimina todas las filas de la tabla leads en Supabase y vacía el almacenamiento local
 */
export async function purgeAllServerLeads(): Promise<number> {
  const localList = readFromLocalStorage();
  const count = localList.length;

  // 1. Limpiar almacenamiento local y memoria
  writeToLocalStorage([]);
  inMemoryLeads = [];

  // 2. Limpiar tabla en Supabase PostgreSQL
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Error al purgar leads en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Fallo al purgar leads en Supabase:', err);
    }
  }

  return count;
}

/**
 * Restablece los prospectos de demostración iniciales
 */
export async function resetServerLeadsToDemo(): Promise<Lead[]> {
  writeToLocalStorage(INITIAL_LEADS);
  inMemoryLeads = [...INITIAL_LEADS];

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (const demoLead of INITIAL_LEADS) {
        await upsertLeadRow(leadToDbRow(demoLead));
      }
    } catch (err) {
      console.error('Error al resetear leads a demo en Supabase:', err);
    }
  }

  return INITIAL_LEADS;
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

// Columnas agregadas en la migración 2026-10-05. Si aún no se ejecuta en Supabase,
// se reintenta el guardado sin ellas para no perder el prospecto.
const OPTIONAL_LEAD_COLUMNS = ['curp_value', 'curp_last_four', 'lead_source'];

let warnedMissingColumns = false;

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === 'PGRST204' || error.code === '42703' || /column/i.test(error.message || '');
}

function isUniqueFolioError(error: { code?: string; message?: string } | null): boolean {
  return !!error && error.code === '23505' && /folio/i.test(error.message || '');
}

async function upsertLeadRow(row: Record<string, unknown>): Promise<{ code?: string; message?: string } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let { error } = await supabase.from('leads').upsert(row, { onConflict: 'id' });
  if (isMissingColumnError(error)) {
    if (!warnedMissingColumns) {
      console.warn(
        'Supabase: faltan columnas nuevas en "leads" (curp_value, curp_last_four, lead_source). ' +
          'Ejecuta supabase/migrations/2026-10-05_curp_origen_configuracion.sql. Guardando sin ellas.'
      );
      warnedMissingColumns = true;
    }
    const legacyRow = { ...row };
    for (const col of OPTIONAL_LEAD_COLUMNS) delete legacyRow[col];
    ({ error } = await supabase.from('leads').upsert(legacyRow, { onConflict: 'id' }));
  }
  return error;
}

export class LeadPersistenceError extends Error {}

/**
 * Guarda (inserta o actualiza) un prospecto en Supabase y en el respaldo local.
 * Si Supabase está configurado y el guardado falla, lanza LeadPersistenceError para que
 * la API pueda avisar en lugar de perder el registro en silencio.
 *
 * `regenerateFolio` se usa al crear: si el folio choca con uno existente se genera otro.
 */
export async function saveServerLead(lead: Lead, regenerateFolio?: () => string): Promise<Lead> {
  let current = lead;
  const supabase = getSupabase();

  if (supabase) {
    let error = await upsertLeadRow(leadToDbRow(current));
    for (let attempt = 0; attempt < 3 && regenerateFolio && isUniqueFolioError(error); attempt++) {
      current = { ...current, folio: regenerateFolio() };
      error = await upsertLeadRow(leadToDbRow(current));
    }
    if (error) {
      console.error('Error al guardar prospecto en Supabase:', error.message);
      throw new LeadPersistenceError(error.message || 'No se pudo guardar el prospecto');
    }
  }

  // Respaldo local / tmp (fuente principal cuando no hay Supabase)
  const localLeads = readFromLocalStorage();
  const existingIdx = localLeads.findIndex((l) => l.id === current.id);
  if (existingIdx >= 0) {
    localLeads[existingIdx] = current;
  } else {
    localLeads.unshift(current);
  }
  writeToLocalStorage(localLeads);

  return current;
}

/**
 * Aplica una acción del panel (o de Telegram) sobre un prospecto y la persiste.
 * Devuelve el prospecto actualizado o null si no existe.
 */
export async function updateServerLead(
  leadId: string,
  action: LeadAction,
  ctx: LeadActionContext
): Promise<Lead | null> {
  const lead = await getServerLeadById(leadId);
  if (!lead) return null;
  const updated = applyLeadAction(lead, action, ctx);
  return saveServerLead(updated);
}
