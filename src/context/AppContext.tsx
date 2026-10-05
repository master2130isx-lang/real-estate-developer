'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Property, Lead, CommercialStatus, FunnelEvent, AppointmentStatus, LeadSource } from '../types';
import { PROPERTIES_DATA } from '../data/mockData';
import { COMMERCIAL_CONFIG, CommercialConfig, mergeCommercialConfig } from '../config/commercialConfig';
import { applyLeadAction, type LeadAction } from '@/lib/leadActions';
import type { LeadInput } from '@/lib/leadFactory';

export type NewLeadInput = Omit<LeadInput, 'leadSource'> & { channel?: LeadSource['channel'] };

export interface AppointmentInput {
  fullName: string;
  phone: string;
  email?: string;
  financingType: Lead['financingType'];
  selectedPropertyId?: string;
  preferredDate: string;
  timeSlot: string;
  notes?: string;
  rawNss?: string;
  rawCurp?: string;
}

type CreateLeadResult = { ok: true; lead: Lead } | { ok: false; error: string };

interface AppContextType {
  leads: Lead[];
  leadsLoaded: boolean;
  /** true cuando la configuración completa (con directorio de Telegram) ya llegó del servidor */
  configSynced: boolean;
  properties: Property[];
  funnelEvents: FunnelEvent[];
  commercialConfig: CommercialConfig;
  syncError: string | null;
  clearSyncError: () => void;
  updateCommercialConfig: (configUpdate: Partial<CommercialConfig>) => Promise<boolean>;
  addProperty: (propertyData: Partial<Property>) => Promise<Property | null>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  reloadProperties: () => Promise<void>;
  setHeroProperty: (propertyId: string) => Promise<void>;
  archiveLead: (leadId: string, archive: boolean) => void;
  createLeadFromPrequalification: (input: NewLeadInput) => Promise<CreateLeadResult>;
  scheduleNewAppointment: (input: AppointmentInput) => Promise<CreateLeadResult>;
  updateLeadStatus: (leadId: string, status: CommercialStatus, noteText?: string) => void;
  updateAppointmentStatus: (
    leadId: string,
    appointmentStatus: AppointmentStatus,
    confirmedDate?: string,
    confirmedTime?: string
  ) => void;
  addLeadNote: (leadId: string, content: string) => void;
  revealNssWithAudit: (leadId: string, reason: string) => { success: boolean; nss?: string; error?: string };
  confirmAttributionInAgency: (
    leadId: string,
    reference: string,
    confirmedAt: string,
    confirmedBy: string,
    notes?: string
  ) => void;
  markAttributionConflict: (leadId: string, reason: string) => void;
  logFunnelEvent: (eventName: FunnelEvent['eventName'], metadata?: Record<string, string | number | boolean>) => void;
  resetToDemoDefaults: () => void;
  purgeAllLeads: (confirmationCode: string) => Promise<{ ok: boolean; message: string; error?: string }>;
  resetLeadsToDemo: (confirmationCode: string) => Promise<{ ok: boolean; message: string; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = 'red_mvp_leads_v2';
const STORAGE_KEY_PROPERTIES = 'red_mvp_properties_v1.1';
const STORAGE_KEY_FUNNEL = 'red_mvp_funnel_v1.1';
const STORAGE_KEY_SOURCE = 'red_lead_source_v1';
const LEGACY_STORAGE_KEYS = ['red_mvp_leads_v1.1', 'red_mvp_config_v1.1'];

// Helper defensivo para garantizar que cualquier objeto Lead tenga todas sus propiedades
function normalizeLead(lead: any): Lead {
  return {
    ...lead,
    folio: lead.folio || 'SIN-FOLIO',
    fullName: lead.fullName || 'Interesado',
    phone: lead.phone || '',
    preferredChannel: lead.preferredChannel || 'whatsapp',
    preferredContactTime: lead.preferredContactTime || 'tarde',
    interestedZone: lead.interestedZone || '',
    budgetRange: lead.budgetRange || 'aun_no_lo_se',
    purchaseTimeline: lead.purchaseTimeline || 'corto',
    financingType: lead.financingType || 'infonavit',
    needsOrientation: !!lead.needsOrientation,
    privacyConsentAccepted: lead.privacyConsentAccepted ?? true,
    marketingConsentAccepted: !!lead.marketingConsentAccepted,
    nssStatus: lead.nssStatus || 'no_aplica',
    curpLastFour: lead.curpLastFour || (lead.curpValue ? lead.curpValue.slice(-4) : undefined),
    attributionStatus: lead.attributionStatus || 'no_aplica',
    commercialStatus: lead.commercialStatus || 'nuevo',
    compatibility: lead.compatibility || 'media',
    nextAction: lead.nextAction || 'Contactar vía WhatsApp',
    assignedAdvisor: lead.assignedAdvisor || '',
    internalNotes: Array.isArray(lead.internalNotes) ? lead.internalNotes : [],
    auditHistory: Array.isArray(lead.auditHistory) ? lead.auditHistory : [],
  };
}

function isPanelPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/panel');
}

/**
 * Captura el origen de la visita (utm_source, utm_medium, utm_campaign, utm_content o ?src=)
 * la primera vez que el visitante llega, y lo conserva durante la sesión del navegador.
 */
function captureLeadSource(): Omit<LeadSource, 'channel'> {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      utmSource: params.get('utm_source') || params.get('src') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || undefined,
    };
    if (Object.values(fromUrl).some(Boolean)) {
      const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
      const source = { ...fromUrl, referrer };
      sessionStorage.setItem(STORAGE_KEY_SOURCE, JSON.stringify(source));
      return source;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY_SOURCE);
    if (stored) return JSON.parse(stored);
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      return { referrer: document.referrer };
    }
  } catch {}
  return {};
}

export function AppProvider({
  children,
  initialConfig,
  initialProperties,
}: {
  children: React.ReactNode;
  initialConfig?: Partial<CommercialConfig>;
  initialProperties?: Property[];
}) {
  const [commercialConfig, setCommercialConfig] = useState<CommercialConfig>(() =>
    mergeCommercialConfig(COMMERCIAL_CONFIG, initialConfig)
  );

  // Los modelos llegan desde el servidor en el primer render (sin parpadeo de datos de ejemplo)
  const [properties, setProperties] = useState<Property[]>(() =>
    initialProperties && initialProperties.length > 0 ? initialProperties : PROPERTIES_DATA
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoaded, setLeadsLoaded] = useState(false);
  const [funnelEvents, setFunnelEvents] = useState<FunnelEvent[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [configSynced, setConfigSynced] = useState(false);
  const leadsRef = useRef<Lead[]>([]);
  leadsRef.current = leads;
  // Acciones enviadas al servidor que aún no responden (por prospecto): la sincronización
  // periódica no debe sobrescribir esos prospectos con una versión anterior.
  const pendingActionsRef = useRef<Map<string, number>>(new Map());

  // Hidratación desde localStorage después del montaje (evita errores de hidratación SSR)
  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      if (isPanelPath()) {
        const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          if (Array.isArray(parsed)) setLeads(parsed.map(normalizeLead));
        }
      }
      const storedFunnel = localStorage.getItem(STORAGE_KEY_FUNNEL);
      if (storedFunnel) setFunnelEvents(JSON.parse(storedFunnel));
      captureLeadSource();
    } catch (e) {
      console.error('Error al leer datos locales:', e);
    }
  }, []);

  // En el panel, el servidor es la fuente de verdad: se recarga la lista cada 10 segundos
  // para reflejar confirmaciones hechas desde Telegram o desde otro dispositivo.
  useEffect(() => {
    if (!isPanelPath()) return;
    let isMounted = true;
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/leads', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && Array.isArray(data.leads) && isMounted) {
          const pending = pendingActionsRef.current;
          setLeads((current) =>
            data.leads.map((serverLead: Lead) => {
              if (pending.get(serverLead.id)) {
                return current.find((l) => l.id === serverLead.id) || normalizeLead(serverLead);
              }
              return normalizeLead(serverLead);
            })
          );
          setLeadsLoaded(true);
        }
      } catch {}
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sincronizar catálogo de propiedades desde el servidor
  const reloadProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties);
          try {
            localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(data.properties));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Error al sincronizar propiedades:', err);
    }
  };

  useEffect(() => {
    reloadProperties();
  }, []);

  // Refrescar configuración en segundo plano (en el panel incluye el directorio de Telegram)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.config && isMounted) {
          setCommercialConfig(mergeCommercialConfig(COMMERCIAL_CONFIG, data.config));
          setConfigSynced(true);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPanelPath() || !leadsLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
    } catch {}
  }, [leads, leadsLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FUNNEL, JSON.stringify(funnelEvents));
    } catch {}
  }, [funnelEvents]);

  const logFunnelEvent = (eventName: FunnelEvent['eventName'], metadata?: Record<string, string | number | boolean>) => {
    // REGLA ESTRICTA: Filtrar y excluir PII (NSS, nombres, teléfonos)
    const sanitizedMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
      for (const [key, val] of Object.entries(metadata)) {
        if (!['nss', 'curp', 'phone', 'email', 'fullname', 'nombre', 'telefono'].includes(key.toLowerCase())) {
          sanitizedMetadata[key] = val;
        }
      }
    }
    setFunnelEvents((prev) => [{ eventName, timestamp: new Date().toISOString(), metadata: sanitizedMetadata }, ...prev].slice(0, 100));
  };

  const postLead = async (body: Record<string, unknown>): Promise<CreateLeadResult> => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.lead) {
        return { ok: false, error: data?.error || 'No pudimos enviar tu solicitud. Intenta de nuevo.' };
      }
      const lead = normalizeLead(data.lead);
      setLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
      return { ok: true, lead };
    } catch {
      return { ok: false, error: 'Sin conexión. Revisa tu internet e intenta de nuevo.' };
    }
  };

  const createLeadFromPrequalification = async (input: NewLeadInput): Promise<CreateLeadResult> => {
    const { channel = 'landing', ...rest } = input;
    const result = await postLead({ ...rest, leadSource: { channel, ...captureLeadSource() } });
    if (result.ok) {
      logFunnelEvent('solicitud_enviada', {
        folio: result.lead.folio,
        forma_compra: result.lead.financingType,
        tiene_cita: !!result.lead.appointmentRequest,
        attribution_status: result.lead.attributionStatus,
      });
    }
    return result;
  };

  const scheduleNewAppointment = async (input: AppointmentInput): Promise<CreateLeadResult> => {
    const { preferredDate, timeSlot, notes, ...rest } = input;
    const result = await postLead({
      ...rest,
      origin: 'panel',
      appointment: { preferredDate, timeSlot, notes },
      leadSource: { channel: 'panel' },
    });
    if (result.ok) {
      logFunnelEvent('cita_solicitada', { folio: result.lead.folio, origen: 'panel_asesor', fecha_cita: preferredDate });
    }
    return result;
  };

  /**
   * Aplica una acción del panel: se muestra de inmediato (optimista) y se confirma con el servidor,
   * cuya respuesta reemplaza al prospecto local. Si el servidor falla se avisa en el panel.
   */
  const runLeadAction = (leadId: string, action: LeadAction) => {
    const ctx = {
      actor: commercialConfig.advisorName,
      durationDays: commercialConfig.attributionRules.durationDays,
      timezone: commercialConfig.schedule?.timezone,
    };
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? applyLeadAction(lead, action, ctx) : lead)));

    const pending = pendingActionsRef.current;
    pending.set(leadId, (pending.get(leadId) || 0) + 1);

    fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);
        // Solo se toma la versión del servidor cuando ya no quedan acciones en curso
        if ((pending.get(leadId) || 0) <= 1) {
          const serverLead = normalizeLead(data.lead);
          setLeads((prev) => prev.map((lead) => (lead.id === leadId ? serverLead : lead)));
        }
      })
      .catch((err) => {
        console.error('No se pudo guardar el cambio en el servidor:', err);
        setSyncError('No se pudo guardar el último cambio en el servidor. Revisa tu conexión e inténtalo de nuevo.');
      })
      .finally(() => {
        const remaining = (pending.get(leadId) || 1) - 1;
        if (remaining > 0) pending.set(leadId, remaining);
        else pending.delete(leadId);
      });
  };

  const updateLeadStatus = (leadId: string, status: CommercialStatus, noteText?: string) =>
    runLeadAction(leadId, { type: 'status', status, note: noteText?.trim() || undefined });

  const updateAppointmentStatus = (
    leadId: string,
    appointmentStatus: AppointmentStatus,
    confirmedDate?: string,
    confirmedTime?: string
  ) => runLeadAction(leadId, { type: 'appointment', status: appointmentStatus, date: confirmedDate, time: confirmedTime });

  const archiveLead = (leadId: string, archive: boolean) => runLeadAction(leadId, { type: 'archive', archive });

  const addLeadNote = (leadId: string, content: string) => runLeadAction(leadId, { type: 'note', content });

  const confirmAttributionInAgency = (
    leadId: string,
    reference: string,
    confirmedAt: string,
    confirmedBy: string,
    notes?: string
  ) => runLeadAction(leadId, { type: 'attribution_confirm', reference, confirmedAt, confirmedBy, notes });

  const markAttributionConflict = (leadId: string, reason: string) =>
    runLeadAction(leadId, { type: 'attribution_conflict', reason });

  const revealNssWithAudit = (leadId: string, reason: string): { success: boolean; nss?: string; error?: string } => {
    const lead = leadsRef.current.find((l) => l.id === leadId);
    if (!lead) return { success: false, error: 'Prospecto no encontrado' };
    if (lead.nssStatus !== 'recibido' || !lead.nssValueEncryptedMock) {
      return { success: false, error: 'Este prospecto no cuenta con NSS registrado' };
    }
    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Debes especificar un motivo válido para la consulta (mínimo 5 letras)' };
    }
    runLeadAction(leadId, { type: 'nss_reveal', reason: reason.trim() });
    return { success: true, nss: lead.nssValueEncryptedMock };
  };

  const updateCommercialConfig = async (update: Partial<CommercialConfig>): Promise<boolean> => {
    setCommercialConfig((prev) => mergeCommercialConfig(prev, update));
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Error ${res.status}`);
      setCommercialConfig(mergeCommercialConfig(COMMERCIAL_CONFIG, data.config));
      return true;
    } catch (e) {
      console.warn('Error al guardar configuración en servidor:', e);
      setSyncError('No se pudo guardar la configuración en el servidor.');
      return false;
    }
  };

  const resetToDemoDefaults = () => {
    setFunnelEvents([]);
    try {
      localStorage.removeItem(STORAGE_KEY_LEADS);
      localStorage.removeItem(STORAGE_KEY_FUNNEL);
      localStorage.removeItem(STORAGE_KEY_PROPERTIES);
    } catch {}
  };

  const persistProperties = (updated: Property[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(updated));
    } catch {}
  };

  const addProperty = async (propertyData: Partial<Property>): Promise<Property | null> => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });
      const data = await res.json();
      if (data.ok && data.property) {
        setProperties((prev) => {
          const updated = [data.property, ...prev];
          persistProperties(updated);
          return updated;
        });
        return data.property;
      }
      return null;
    } catch {
      return null;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.ok && data.property) {
        setProperties((prev) => {
          const updated = prev.map((p) => (p.id === id ? data.property : p));
          persistProperties(updated);
          return updated;
        });
        return data.property;
      }
      return null;
    } catch {
      return null;
    }
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setProperties((prev) => {
          const updated = prev.filter((p) => p.id !== id);
          persistProperties(updated);
          return updated;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const setHeroProperty = async (propertyId: string) => {
    await updateCommercialConfig({ heroPropertyId: propertyId });
  };

  const purgeAllLeads = async (confirmationCode: string): Promise<{ ok: boolean; message: string; error?: string }> => {
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.error || 'Error al purgar citas', error: data.error };
      }
      setLeads([]);
      try {
        localStorage.removeItem(STORAGE_KEY_LEADS);
      } catch {}
      return { ok: true, message: data.message || 'Citas eliminadas con éxito.' };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Error de red al purgar citas', error: err.message };
    }
  };

  const resetLeadsToDemo = async (confirmationCode: string): Promise<{ ok: boolean; message: string; error?: string }> => {
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode, action: 'reset_demo' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, message: data.error || 'Error al restablecer citas', error: data.error };
      }
      if (Array.isArray(data.leads)) {
        setLeads(data.leads.map(normalizeLead));
      }
      return { ok: true, message: data.message || 'Citas restablecidas a datos de prueba.' };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Error de red', error: err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        leads,
        leadsLoaded,
        configSynced,
        properties,
        funnelEvents,
        commercialConfig,
        syncError,
        clearSyncError: () => setSyncError(null),
        updateCommercialConfig,
        addProperty,
        updateProperty,
        deleteProperty,
        reloadProperties,
        setHeroProperty,
        archiveLead,
        createLeadFromPrequalification,
        scheduleNewAppointment,
        updateLeadStatus,
        updateAppointmentStatus,
        addLeadNote,
        revealNssWithAudit,
        confirmAttributionInAgency,
        markAttributionConflict,
        logFunnelEvent,
        resetToDemoDefaults,
        purgeAllLeads,
        resetLeadsToDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
