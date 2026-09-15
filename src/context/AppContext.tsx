'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, CommercialStatus, FunnelEvent, LeadNote, AuditEvent, AttributionStatus } from '../types';
import { INITIAL_LEADS } from '../data/mockData';
import { shouldRequestNss } from '../config/commercialConfig';

interface AppContextType {
  leads: Lead[];
  funnelEvents: FunnelEvent[];
  createLeadFromPrequalification: (leadData: Partial<Lead>, rawNss?: string) => Lead;
  scheduleNewAppointment: (appointmentData: {
    fullName: string;
    phone: string;
    email?: string;
    financingType: Lead['financingType'];
    preferredDate: string;
    timeSlot: string;
    notes?: string;
    rawNss?: string;
  }) => Lead;
  updateLeadStatus: (leadId: string, status: CommercialStatus, noteText?: string) => void;
  updateAppointmentStatus: (
    leadId: string,
    appointmentStatus: 'solicitada' | 'confirmada' | 'reprogramada' | 'cancelada',
    confirmedDate?: string,
    confirmedTime?: string
  ) => void;
  addLeadNote: (leadId: string, content: string, author?: string) => void;
  revealNssWithAudit: (leadId: string, reason: string, advisorName?: string) => { success: boolean; nss?: string; error?: string };
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_LEADS = 'red_mvp_leads_v1.1';
const STORAGE_KEY_FUNNEL = 'red_mvp_funnel_v1.1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Inicializador perezoso (Lazy Initializer) que evita setState en useEffect
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
        if (storedLeads) {
          return JSON.parse(storedLeads);
        }
      } catch (e) {
        console.error('Error al leer leads locales:', e);
      }
    }
    return INITIAL_LEADS;
  });

  const [funnelEvents, setFunnelEvents] = useState<FunnelEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedFunnel = localStorage.getItem(STORAGE_KEY_FUNNEL);
        if (storedFunnel) {
          return JSON.parse(storedFunnel);
        }
      } catch (e) {
        console.error('Error al leer telemetría local:', e);
      }
    }
    return [];
  });

  // Sincronización con el servidor para reflejar en tiempo real confirmaciones desde Telegram
  useEffect(() => {
    let isMounted = true;
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.leads) && isMounted) {
            setLeads(data.leads);
          }
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

  // Guardar en localStorage únicamente cuando el estado cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      } catch (e) {
        console.error('Error al guardar leads:', e);
      }
    }
  }, [leads]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_FUNNEL, JSON.stringify(funnelEvents));
      } catch (e) {
        console.error('Error al guardar telemetría:', e);
      }
    }
  }, [funnelEvents]);

  const logFunnelEvent = (
    eventName: FunnelEvent['eventName'],
    metadata?: Record<string, string | number | boolean>
  ) => {
    // REGLA ESTRICTA: Filtrar y excluir PII (NSS, nombres, teléfonos)
    const sanitizedMetadata: Record<string, string | number | boolean> = {};
    if (metadata) {
      for (const [key, val] of Object.entries(metadata)) {
        if (!['nss', 'phone', 'email', 'fullname', 'nombre', 'telefono'].includes(key.toLowerCase())) {
          sanitizedMetadata[key] = val;
        }
      }
    }

    const newEvent: FunnelEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      metadata: sanitizedMetadata,
    };

    setFunnelEvents((prev) => [newEvent, ...prev].slice(0, 100));
  };

  const createLeadFromPrequalification = (
    data: Partial<Lead>,
    rawNss?: string
  ): Lead => {
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace('T', ' ').substring(0, 16);
    const folioNumber = Math.floor(100 + Math.random() * 900);
    const folio = `LEAD-2026-${folioNumber}`;

    // Compatibilidad explicable
    let compatibility: Lead['compatibility'] = 'media';
    if (data.needsOrientation || data.financingType === 'necesita_orientacion') {
      compatibility = 'requiere_orientacion';
    } else if (
      (data.budgetRange === '1.6m_a_2.2m' || data.budgetRange === 'mas_de_2.2m') &&
      data.purchaseTimeline !== 'explorando'
    ) {
      compatibility = 'alta';
    } else if (data.purchaseTimeline === 'explorando' || data.budgetRange === 'aun_no_lo_se') {
      compatibility = 'requiere_orientacion';
    } else {
      compatibility = 'alta';
    }

    // REGLA FUNDAMENTAL DE NEGOCIO:
    // NSS recibido en web ≠ bloqueo confirmado en inmobiliaria
    const isNssApplicable = shouldRequestNss(data.financingType || '');
    let nssStatus: Lead['nssStatus'] = 'no_aplica';
    let attributionStatus: AttributionStatus = 'no_aplica';
    let nssLastFour: string | undefined = undefined;
    let nssValueEncryptedMock: string | undefined = undefined;

    if (isNssApplicable) {
      if (rawNss && rawNss.trim().length === 11) {
        nssStatus = 'recibido';
        nssLastFour = rawNss.slice(-4);
        nssValueEncryptedMock = rawNss.trim();
        // Un envío web SOLO avanza a 'pendiente_inmobiliaria'
        attributionStatus = 'pendiente_inmobiliaria';
      } else {
        nssStatus = 'pendiente';
        attributionStatus = 'pendiente_nss';
      }
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      folio,
      createdAt: formattedDate,
      fullName: data.fullName || 'Interesado Anónimo',
      phone: data.phone || '',
      email: data.email || undefined,
      preferredChannel: data.preferredChannel || 'whatsapp',
      preferredContactTime: data.preferredContactTime || 'tarde',
      interestedZone: data.interestedZone || 'Zona de Interés',
      selectedPropertyId: data.selectedPropertyId,
      selectedPropertyTitle: data.selectedPropertyTitle,
      budgetRange: data.budgetRange || 'aun_no_lo_se',
      purchaseTimeline: data.purchaseTimeline || 'corto',
      financingType: data.financingType || 'infonavit',
      financingSubtype: data.financingSubtype,
      needsOrientation: !!data.needsOrientation,
      privacyConsentAccepted: true,
      marketingConsentAccepted: !!data.marketingConsentAccepted,
      nssStatus,
      nssLastFour,
      nssValueEncryptedMock,
      attributionStatus,
      commercialStatus: data.appointmentRequest ? 'cita_solicitada' : 'nuevo',
      compatibility,
      nextAction:
        attributionStatus === 'pendiente_inmobiliaria'
          ? 'Registrar NSS en sistema interno de la inmobiliaria y preparar mensaje de WhatsApp'
          : 'Preparar mensaje de WhatsApp para dar atención y confirmar visita',
      assignedAdvisor: 'Asesor Asignado (Demostración)',
      appointmentRequest: data.appointmentRequest,
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Sistema',
          createdAt: formattedDate,
          content: `Solicitud recibida vía web. Estado de atribución: ${
            attributionStatus === 'pendiente_inmobiliaria'
              ? 'Pendiente de registrar en inmobiliaria (NSS recibido; no constituye bloqueo confirmado).'
              : attributionStatus === 'pendiente_nss'
              ? 'El prospecto eligió recibir orientación antes de registrarse con NSS.'
              : 'No aplica atribución por NSS para este esquema.'
          }`,
        },
      ],
      auditHistory: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Sistema',
          action: `Registro web completado. Atribución: ${attributionStatus}`,
          ipMasked: '189.240.xx.xx (Demo)',
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);

    // Sincronizar con servidor y disparar alerta instantánea a Telegram
    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch(() => {});
    }

    logFunnelEvent('solicitud_enviada', {
      folio: newLead.folio,
      forma_compra: newLead.financingType,
      tiene_cita: !!newLead.appointmentRequest,
      attribution_status: newLead.attributionStatus,
    });

    return newLead;
  };

  const updateLeadStatus = (leadId: string, status: CommercialStatus, noteText?: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const updatedNotes = [...lead.internalNotes];
        if (noteText && noteText.trim()) {
          updatedNotes.push({
            id: `note-${Date.now()}`,
            author: 'Asesor Asignado (Demostración)',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            content: noteText.trim(),
          });
        }

        const auditEvent: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Asesor Asignado (Demostración)',
          action: `Estado comercial actualizado a '${status}'`,
        };

        return {
          ...lead,
          commercialStatus: status,
          internalNotes: updatedNotes,
          auditHistory: [auditEvent, ...lead.auditHistory],
        };
      })
    );
  };

  const scheduleNewAppointment = (appointmentData: {
    fullName: string;
    phone: string;
    email?: string;
    financingType: Lead['financingType'];
    preferredDate: string;
    timeSlot: string;
    notes?: string;
    rawNss?: string;
  }): Lead => {
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace('T', ' ').substring(0, 16);
    const folioNumber = Math.floor(100 + Math.random() * 900);
    const folio = `AGEND-2026-${folioNumber}`;

    const isNssApplicable = shouldRequestNss(appointmentData.financingType);
    let nssStatus: Lead['nssStatus'] = 'no_aplica';
    let attributionStatus: AttributionStatus = 'no_aplica';
    let nssLastFour: string | undefined = undefined;
    let nssValueEncryptedMock: string | undefined = undefined;

    if (isNssApplicable) {
      if (appointmentData.rawNss && appointmentData.rawNss.trim().length === 11) {
        nssStatus = 'recibido';
        nssLastFour = appointmentData.rawNss.slice(-4);
        nssValueEncryptedMock = appointmentData.rawNss.trim();
        attributionStatus = 'pendiente_inmobiliaria';
      } else {
        nssStatus = 'pendiente';
        attributionStatus = 'pendiente_nss';
      }
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      folio,
      createdAt: formattedDate,
      fullName: appointmentData.fullName.trim(),
      phone: appointmentData.phone.trim(),
      email: appointmentData.email?.trim() || undefined,
      preferredChannel: 'whatsapp',
      preferredContactTime: 'tarde',
      interestedZone: 'Salinas Victoria, N.L. (Valle de los Encinos)',
      selectedPropertyId: 'prop-aguila-premier',
      selectedPropertyTitle: 'Modelo Águila Premier (Valle de los Encinos)',
      budgetRange: '1.2m_a_1.6m',
      purchaseTimeline: 'inmediato',
      financingType: appointmentData.financingType,
      needsOrientation: false,
      privacyConsentAccepted: true,
      marketingConsentAccepted: false,
      nssStatus,
      nssLastFour,
      nssValueEncryptedMock,
      attributionStatus,
      commercialStatus: 'cita_confirmada',
      compatibility: 'alta',
      nextAction: `Recibir a ${appointmentData.fullName.trim()} en caseta de Valle de los Encinos el ${appointmentData.preferredDate} a las ${appointmentData.timeSlot}`,
      assignedAdvisor: 'Asesor Comercial Asignado',
      appointmentRequest: {
        modality: 'presencial',
        preferredDate: appointmentData.preferredDate,
        timeSlot: appointmentData.timeSlot,
        status: 'confirmada',
        confirmedDate: appointmentData.preferredDate,
        confirmedTime: appointmentData.timeSlot,
        notes: appointmentData.notes || 'Cita agendada directamente por el asesor comercial.',
      },
      internalNotes: [
        {
          id: `note-${Date.now()}`,
          author: 'Asesor Comercial',
          createdAt: formattedDate,
          content: `Cita registrada directamente en agenda. Visita programada para el ${appointmentData.preferredDate} (${appointmentData.timeSlot}).`,
        },
      ],
      auditHistory: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Asesor Comercial',
          action: `Cita agendada para ${appointmentData.preferredDate} a las ${appointmentData.timeSlot}`,
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);

    // Sincronizar con servidor y disparar alerta instantánea a Telegram
    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch(() => {});
    }

    logFunnelEvent('cita_solicitada', {
      folio: newLead.folio,
      origen: 'panel_asesor',
      fecha_cita: appointmentData.preferredDate,
    });

    return newLead;
  };

  const updateAppointmentStatus = (
    leadId: string,
    appointmentStatus: 'solicitada' | 'confirmada' | 'reprogramada' | 'cancelada',
    confirmedDate?: string,
    confirmedTime?: string
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const existingReq = lead.appointmentRequest;
        const updatedReq = {
          modality: existingReq?.modality || 'presencial',
          preferredDate: confirmedDate || existingReq?.preferredDate || new Date().toISOString().split('T')[0],
          timeSlot: confirmedTime || existingReq?.timeSlot || '11:00 AM',
          status: appointmentStatus,
          confirmedDate: confirmedDate || existingReq?.confirmedDate,
          confirmedTime: confirmedTime || existingReq?.confirmedTime,
          notes: existingReq?.notes || 'Cita gestionada desde el panel del asesor.',
        };

        let newCommercialStatus = lead.commercialStatus;
        if (appointmentStatus === 'confirmada') {
          newCommercialStatus = 'cita_confirmada';
        } else if (appointmentStatus === 'cancelada') {
          newCommercialStatus = 'en_seguimiento';
        } else if (appointmentStatus === 'reprogramada') {
          newCommercialStatus = 'cita_solicitada';
        }

        const auditEvent: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Asesor Comercial',
          action: `Visita ${appointmentStatus}: ${confirmedDate || updatedReq.preferredDate} (${confirmedTime || updatedReq.timeSlot})`,
        };

        const noteText = `Cita de visita ${appointmentStatus.toUpperCase()}: ${confirmedDate || updatedReq.preferredDate} a las ${confirmedTime || updatedReq.timeSlot}`;
        const newNote: LeadNote = {
          id: `note-${Date.now()}`,
          author: 'Asesor Comercial',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content: noteText,
        };

        return {
          ...lead,
          commercialStatus: newCommercialStatus,
          appointmentRequest: updatedReq,
          internalNotes: [newNote, ...lead.internalNotes],
          auditHistory: [auditEvent, ...lead.auditHistory],
        };
      })
    );

    // Sincronizar actualización de cita con el servidor
    if (typeof window !== 'undefined') {
      fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentStatus,
          confirmedDate,
          confirmedTime,
        }),
      }).catch(() => {});
    }
  };

  const addLeadNote = (leadId: string, content: string, author: string = 'Asesor Asignado (Demostración)') => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const newNote: LeadNote = {
          id: `note-${Date.now()}`,
          author,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content,
        };
        return {
          ...lead,
          internalNotes: [newNote, ...lead.internalNotes],
        };
      })
    );
  };

  /**
   * Simulación de confirmación efectiva del registro en la inmobiliaria.
   * Regla de negocio: Los 15 días inician a partir de esta fecha/hora de confirmación,
   * NUNCA desde la llegada a la web.
   */
  const confirmAttributionInAgency = (
    leadId: string,
    reference: string,
    confirmedAt: string,
    confirmedBy: string,
    notes?: string
  ) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        // Calcular vencimiento a 15 días posteriores
        const baseDate = new Date(confirmedAt || Date.now());
        const expireDate = new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000);
        const expiresAtFormatted = `${expireDate.toISOString().replace('T', ' ').substring(0, 16)} (Estimado Demo)`;

        const auditEvent: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: confirmedBy || 'Asesor Asignado (Demostración)',
          action: `Registro interno confirmado en inmobiliaria (Folio/Ref: ${reference || 'N/A'})`,
          reason: notes || 'Confirmación manual en mecanismo interno de inmobiliaria',
        };

        const updatedNotes = [...lead.internalNotes];
        updatedNotes.push({
          id: `note-${Date.now()}`,
          author: confirmedBy || 'Asesor Asignado (Demostración)',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content: `Registro confirmado en inmobiliaria. Ref: ${reference || 'Sin folio'}. Vigencia estimada de 15 días hasta ${expiresAtFormatted}.`,
        });

        return {
          ...lead,
          attributionStatus: 'confirmado',
          attributionConfirmedAt: confirmedAt,
          attributionExpiresAt: expiresAtFormatted,
          attributionReference: reference,
          attributionConfirmedBy: confirmedBy,
          attributionNotes: notes,
          internalNotes: updatedNotes,
          auditHistory: [auditEvent, ...lead.auditHistory],
        };
      })
    );
  };

  const markAttributionConflict = (leadId: string, reason: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;

        const auditEvent: AuditEvent = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Asesor Asignado (Demostración)',
          action: 'Registro en inmobiliaria rechazado / conflicto de duplicidad',
          reason,
        };

        const updatedNotes = [...lead.internalNotes];
        updatedNotes.push({
          id: `note-${Date.now()}`,
          author: 'Asesor Asignado (Demostración)',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          content: `Conflicto en inmobiliaria: ${reason}. Atribución no asignada.`,
        });

        return {
          ...lead,
          attributionStatus: 'conflicto_rechazo',
          internalNotes: updatedNotes,
          auditHistory: [auditEvent, ...lead.auditHistory],
        };
      })
    );
  };

  const revealNssWithAudit = (
    leadId: string,
    reason: string,
    advisorName: string = 'Asesor Asignado (Demostración)'
  ): { success: boolean; nss?: string; error?: string } => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return { success: false, error: 'Prospecto no encontrado' };

    if (lead.nssStatus !== 'recibido' || !lead.nssValueEncryptedMock) {
      return { success: false, error: 'Este prospecto no cuenta con NSS registrado' };
    }

    if (!reason || reason.trim().length < 5) {
      return { success: false, error: 'Debes especificar un motivo válido para la consulta (mínimo 5 letras)' };
    }

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: advisorName,
      action: 'CONSULTA DE NSS (SIMULACIÓN DEMO)',
      reason: reason.trim(),
      ipMasked: '189.240.xx.xx (Sesión Demo)',
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          auditHistory: [auditEvent, ...l.auditHistory],
        };
      })
    );

    return {
      success: true,
      nss: lead.nssValueEncryptedMock,
    };
  };

  const resetToDemoDefaults = () => {
    setLeads(INITIAL_LEADS);
    setFunnelEvents([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_LEADS);
        localStorage.removeItem(STORAGE_KEY_FUNNEL);
      } catch {}
    }
  };

  return (
    <AppContext.Provider
      value={{
        leads,
        funnelEvents,
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
