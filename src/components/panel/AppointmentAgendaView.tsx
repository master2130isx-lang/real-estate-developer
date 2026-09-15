'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  CreditCard,
  Plus,
  ShieldCheck,
  CalendarCheck2,
  CalendarX2,
  X,
  Copy,
  Check,
  Archive,
  ArchiveRestore,
  MessageSquare,
} from 'lucide-react';
import { Lead } from '@/types';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface AppointmentAgendaViewProps {
  leads: Lead[];
  onOpenNewAppointment: () => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenLeadDetail: (lead: Lead) => void;
}

export function AppointmentAgendaView({
  leads,
  onOpenNewAppointment,
  onOpenWhatsApp,
  onOpenLeadDetail,
}: AppointmentAgendaViewProps) {
  const { updateAppointmentStatus, archiveLead, commercialConfig } = useApp();

  const [filterType, setFilterType] = useState<
    'todas' | 'hoy' | 'pendientes' | 'confirmadas' | 'canceladas' | 'archivadas'
  >('todas');

  const [rescheduleLead, setRescheduleLead] = useState<Lead | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [whatsappActionModal, setWhatsappActionModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    message: string;
    phone: string;
  } | null>(null);
  const [copiedAction, setCopiedAction] = useState(false);

  // Fecha de hoy para comparar (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper para verificar auto-archivado (canceladas con más de 14 días o archivadas explícitamente)
  const isLeadArchived = (lead: Lead) => {
    if (lead.isArchived || lead.appointmentRequest?.status === 'archivada') {
      return true;
    }
    if (lead.appointmentRequest?.status === 'cancelada') {
      const cancelDate =
        lead.appointmentRequest.cancelledAt ||
        lead.appointmentRequest.confirmedDate ||
        lead.appointmentRequest.preferredDate;
      if (cancelDate) {
        const diffMs = Date.now() - new Date(cancelDate).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 14;
      }
    }
    return false;
  };

  // Filtrar solo los prospectos con registro de cita
  const appointmentLeads = leads.filter(
    (l) => l.appointmentRequest || l.commercialStatus === 'cita_solicitada' || l.commercialStatus === 'cita_confirmada'
  );

  // Contadores por categoría
  const activeAppointments = appointmentLeads.filter((l) => !isLeadArchived(l));
  const archivedAppointments = appointmentLeads.filter((l) => isLeadArchived(l));

  const totalCount = activeAppointments.length;
  const todayCount = activeAppointments.filter(
    (l) => (l.appointmentRequest?.confirmedDate || l.appointmentRequest?.preferredDate) === todayStr
  ).length;
  const pendingCount = activeAppointments.filter(
    (l) => l.appointmentRequest?.status === 'solicitada' || l.commercialStatus === 'cita_solicitada'
  ).length;
  const confirmedCount = activeAppointments.filter(
    (l) => l.appointmentRequest?.status === 'confirmada' || l.commercialStatus === 'cita_confirmada'
  ).length;
  const cancelledCount = activeAppointments.filter(
    (l) => l.appointmentRequest?.status === 'cancelada'
  ).length;
  const archivedCount = archivedAppointments.length;

  // Filtrado actual
  const filteredAppointments = appointmentLeads
    .filter((lead) => {
      const isArchived = isLeadArchived(lead);
      const apt = lead.appointmentRequest;
      const aptDate = apt?.confirmedDate || apt?.preferredDate || '';

      if (filterType === 'archivadas') {
        return isArchived;
      }

      // Si no es pestaña de archivadas, excluimos las archivadas
      if (isArchived) return false;

      if (filterType === 'hoy') {
        return aptDate === todayStr;
      }
      if (filterType === 'pendientes') {
        return apt?.status === 'solicitada' || lead.commercialStatus === 'cita_solicitada';
      }
      if (filterType === 'confirmadas') {
        return apt?.status === 'confirmada' || lead.commercialStatus === 'cita_confirmada';
      }
      if (filterType === 'canceladas') {
        return apt?.status === 'cancelada';
      }
      return true; // 'todas'
    })
    .sort((a, b) => {
      const dateA = a.appointmentRequest?.confirmedDate || a.appointmentRequest?.preferredDate || '9999';
      const dateB = b.appointmentRequest?.confirmedDate || b.appointmentRequest?.preferredDate || '9999';
      return dateA.localeCompare(dateB);
    });

  const handleConfirm = (leadId: string, currentDate: string, currentTime: string) => {
    updateAppointmentStatus(leadId, 'confirmada', currentDate, currentTime);
  };

  const handleOpenReschedule = (lead: Lead) => {
    setRescheduleLead(lead);
    setNewDate(lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || todayStr);
    setNewTime(lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || '11:00 AM');
  };

  const handleSaveReschedule = () => {
    if (!rescheduleLead || !newDate) return;
    updateAppointmentStatus(rescheduleLead.id, 'reprogramada', newDate, newTime);

    const firstName = rescheduleLead.fullName.split(' ')[0];
    const cleanPhone = rescheduleLead.phone.replace(/\D/g, '');
    const message = `¡Hola ${firstName}! Te escribe ${commercialConfig.advisorName}, tu asesor comercial de ${commercialConfig.agencyName}.\n\nTe confirmo que tu visita para conocer las viviendas residenciales ha sido reprogramada:\n\n• Nueva fecha: ${newDate}\n• Nuevo horario: ${newTime}\n• Punto de reunión: Caseta principal con acceso controlado en ${commercialConfig.coverageZone}\n\n¿Me confirmas de enterado? ¡Quedo a tus órdenes!`;

    const waUrl = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`;

    const currentLead = rescheduleLead;
    setRescheduleLead(null);
    setWhatsappActionModal({
      isOpen: true,
      title: '¡Visita Reprogramada con Éxito!',
      subtitle: 'Notifica al cliente por WhatsApp con 1 toque:',
      message,
      phone: currentLead.phone,
    });

    try {
      window.open(waUrl, '_blank');
    } catch {}
  };

  const handleCancelAppointment = (leadId: string) => {
    const lead = rescheduleLead || leads.find((l) => l.id === leadId);
    if (!lead) return;

    if (
      confirm(
        `¿Deseas marcar como cancelada la cita de ${lead.fullName}? Se mantendrá en el sistema y podrás reactivarla o archivarla cuando desees.`
      )
    ) {
      updateAppointmentStatus(lead.id, 'cancelada');

      const firstName = lead.fullName.split(' ')[0];
      const cleanPhone = lead.phone.replace(/\D/g, '');
      const message = `¡Hola ${firstName}! Te escribe ${commercialConfig.advisorName} de ${commercialConfig.agencyName}.\n\nTe confirmo la cancelación de tu visita para conocer el *Modelo Águila Premier*. Si más adelante deseas retomar tu asesoría o agendar un nuevo recorrido en las casas muestra, con mucho gusto estoy a tus órdenes por este medio. ¡Excelente día!`;

      const waUrl = `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`;

      setRescheduleLead(null);
      setWhatsappActionModal({
        isOpen: true,
        title: 'Cita Cancelada en el Sistema',
        subtitle: 'Envía este mensaje formal de cortesía al cliente por WhatsApp:',
        message,
        phone: lead.phone,
      });

      try {
        window.open(waUrl, '_blank');
      } catch {}
    }
  };

  const handleToggleArchive = (leadId: string, archive: boolean) => {
    archiveLead(leadId, archive);
  };

  return (
    <div className="space-y-3.5">
      {/* Barra de Filtros Ejecutiva */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('todas')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterType === 'todas'
                ? 'bg-[#0d233a] dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({totalCount})
          </button>

          <button
            onClick={() => setFilterType('hoy')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'hoy'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Hoy ({todayCount})</span>
          </button>

          <button
            onClick={() => setFilterType('pendientes')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'pendientes'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Por Confirmar ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterType('confirmadas')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'confirmadas'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmadas ({confirmedCount})</span>
          </button>

          <button
            onClick={() => setFilterType('canceladas')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'canceladas'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
            }`}
          >
            <CalendarX2 className="w-3.5 h-3.5" />
            <span>Canceladas ({cancelledCount})</span>
          </button>

          <button
            onClick={() => setFilterType('archivadas')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'archivadas'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Citas canceladas hace más de 14 días o archivadas manualmente"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archivadas ({archivedCount})</span>
          </button>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="w-full sm:w-auto bg-[#0d233a] hover:bg-[#163b5c] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
          <span>Agendar Cita</span>
        </button>
      </div>

      {/* Grid de Tarjetas Compactas */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAppointments.map((lead) => {
            const apt = lead.appointmentRequest;
            const aptDate = apt?.confirmedDate || apt?.preferredDate || 'Fecha por definir';
            const aptTime = apt?.confirmedTime || apt?.timeSlot || 'Horario por definir';
            const isCancelled = apt?.status === 'cancelada';
            const isArchived = isLeadArchived(lead);
            const isConfirmed = !isCancelled && !isArchived && (apt?.status === 'confirmada' || lead.commercialStatus === 'cita_confirmada');
            const isPending = !isCancelled && !isArchived && !isConfirmed;
            const isToday = !isCancelled && !isArchived && aptDate === todayStr;
            const cleanPhone = lead.phone.replace(/\D/g, '');

            return (
              <div
                key={lead.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden text-xs ${
                  isArchived
                    ? 'border-slate-300 dark:border-slate-800 opacity-80 bg-slate-50/50 dark:bg-slate-900/50'
                    : isCancelled
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/15 dark:bg-rose-950/20'
                    : isToday
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/50'
                    : isConfirmed
                    ? 'border-emerald-300 dark:border-emerald-800'
                    : 'border-amber-300 dark:border-amber-800'
                }`}
              >
                {/* Cabecera Compacta (Fecha, Hora y Estado) */}
                <div
                  className={`px-3 py-2 border-b flex items-center justify-between ${
                    isArchived
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      : isCancelled
                      ? 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900'
                      : isToday
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-100 dark:border-rose-900'
                      : isConfirmed
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 border-emerald-100 dark:border-emerald-900'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border-amber-100 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    <span>{aptDate}</span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <Clock className="w-3 h-3" />
                      {aptTime}
                    </span>
                    {isToday && (
                      <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-1 animate-pulse">
                        Hoy
                      </span>
                    )}
                  </div>

                  <div>
                    {isArchived ? (
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                        📦 Archivada
                      </span>
                    ) : isCancelled ? (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ❌ Cancelada
                      </span>
                    ) : isConfirmed ? (
                      <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        ✅ Confirmada
                      </span>
                    ) : (
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        ⏳ Por Confirmar
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido Compacto */}
                <div className="p-3 space-y-2 flex-1">
                  {/* Fila 1: Nombre del Prospecto, Folio y Teléfono */}
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-[13px] leading-snug">
                        {lead.fullName || 'Prospecto'}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] mt-0.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{lead.phone || 'Sin teléfono'}</span>
                        </a>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500 dark:text-slate-400 capitalize">{lead.preferredChannel || 'whatsapp'}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium border dark:border-slate-700">
                      {lead.folio || 'N/A'}
                    </span>
                  </div>

                  {/* Fila 2: Inmueble y Esquema de Compra en Tira Compacta */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Modelo Águila Premier</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="capitalize font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      {((lead.financingType || 'infonavit') as string).replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Caseta Principal
                    </span>
                  </div>

                  {/* Notas o comentarios del cliente si existen */}
                  {apt?.notes && (
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/40 italic truncate" title={apt.notes}>
                      💬 &quot;{apt.notes}&quot;
                    </div>
                  )}

                  {/* Protección 15 Días */}
                  {lead.attributionStatus === 'confirmado' && lead.attributionExpiresAt && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg font-semibold border border-emerald-200 dark:border-emerald-900/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Exclusividad activa: {lead.attributionExpiresAt.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                {/* Barra de Acciones Ejecutivas */}
                <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenWhatsApp(lead)}
                      title="Enviar mensaje rápido de WhatsApp"
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-1.5 rounded-xl transition shadow-sm flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${cleanPhone}`}
                      title="Llamar directamente"
                      className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Botones según estado */}
                    {isArchived ? (
                      <button
                        onClick={() => handleToggleArchive(lead.id, false)}
                        title="Restaurar cita a la agenda activa"
                        className="bg-slate-700 hover:bg-slate-800 text-white px-2 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <ArchiveRestore className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    ) : isCancelled ? (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(lead)}
                          title="Reactivar y reprogramar cita"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reagendar</span>
                        </button>
                        <button
                          onClick={() => handleToggleArchive(lead.id, true)}
                          title="Archivar de inmediato"
                          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-xl text-[11px] font-semibold transition cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : isPending ? (
                      <>
                        <button
                          onClick={() => handleConfirm(lead.id, aptDate, aptTime)}
                          title="Confirmar cita"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmar</span>
                        </button>
                        <button
                          onClick={() => handleOpenReschedule(lead)}
                          title="Reagendar horario o fecha"
                          className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(lead.id)}
                          title="Cancelar cita y enviar WhatsApp"
                          className="bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-[11px] transition cursor-pointer"
                        >
                          <CalendarX2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenReschedule(lead)}
                          title="Reagendar horario o fecha"
                          className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>Reagendar</span>
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(lead.id)}
                          title="Cancelar cita"
                          className="bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-[11px] transition cursor-pointer"
                        >
                          <CalendarX2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onOpenLeadDetail(lead)}
                      title="Ver expediente"
                      className="bg-[#0d233a] hover:bg-[#163b5c] dark:bg-slate-800 dark:hover:bg-slate-700 text-white p-1.5 rounded-xl transition text-[11px] font-semibold cursor-pointer border dark:border-slate-700"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío de la Agenda */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              No hay citas en este periodo seleccionado
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Utiliza el botón para registrar visitas de prospectos que te hayan contactado directamente por llamada o WhatsApp.
            </p>
          </div>
          <button
            onClick={onOpenNewAppointment}
            className="bg-[#0d233a] hover:bg-[#163b5c] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            <span>Agendar Nueva Cita Ahora</span>
          </button>
        </div>
      )}

      {/* Modal Rápido de Reprogramación */}
      {rescheduleLead && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reprogramar Visita para {rescheduleLead.fullName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona la nueva fecha y horario acordados con el cliente
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nueva Fecha de Visita
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0d233a] dark:focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nuevo Horario
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0d233a] dark:focus:ring-amber-500"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleCancelAppointment(rescheduleLead.id)}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CalendarX2 className="w-3.5 h-3.5" />
                <span>Cancelar Cita</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  className="bg-[#0d233a] hover:bg-[#163b5c] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Guardar y Notificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación Rápida a WhatsApp tras Reagenda o Cancelación */}
      {whatsappActionModal?.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <WhatsAppIcon className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{whatsappActionModal.title}</h3>
              </div>
              <button
                onClick={() => setWhatsappActionModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">{whatsappActionModal.subtitle}</p>

            <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans max-h-48 overflow-y-auto">
              {whatsappActionModal.message}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(whatsappActionModal.message);
                  setCopiedAction(true);
                  setTimeout(() => setCopiedAction(false), 2000);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedAction ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              <a
                href={`https://wa.me/52${whatsappActionModal.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappActionModal.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setWhatsappActionModal(null)}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Abrir WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
