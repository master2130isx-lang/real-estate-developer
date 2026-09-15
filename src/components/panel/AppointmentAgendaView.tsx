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
  const { updateAppointmentStatus } = useApp();

  const [filterType, setFilterType] = useState<'todas' | 'pendientes' | 'confirmadas' | 'hoy'>('todas');
  const [rescheduleLead, setRescheduleLead] = useState<Lead | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');

  // Filtrar solo los prospectos que tengan cita o solicitud de cita
  const appointmentLeads = leads.filter(
    (l) => l.appointmentRequest || l.commercialStatus === 'cita_solicitada' || l.commercialStatus === 'cita_confirmada'
  );

  // Fecha de hoy para comparar (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointmentLeads.filter((lead) => {
    const apt = lead.appointmentRequest;
    const aptDate = apt?.confirmedDate || apt?.preferredDate || '';

    if (filterType === 'hoy') {
      return aptDate === todayStr;
    }
    if (filterType === 'pendientes') {
      return apt?.status === 'solicitada' || lead.commercialStatus === 'cita_solicitada';
    }
    if (filterType === 'confirmadas') {
      return apt?.status === 'confirmada' || lead.commercialStatus === 'cita_confirmada';
    }
    return true;
  }).sort((a, b) => {
    // Ordenar por fecha de cita más próxima
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
    setRescheduleLead(null);
  };

  const handleCancelAppointment = (leadId: string) => {
    if (confirm('¿Deseas cancelar esta cita de visita? El prospecto seguirá en tu cartera para seguimiento.')) {
      updateAppointmentStatus(leadId, 'cancelada');
    }
  };

  // Contadores rápidos
  const totalCount = appointmentLeads.length;
  const pendingCount = appointmentLeads.filter(
    (l) => l.appointmentRequest?.status === 'solicitada' || l.commercialStatus === 'cita_solicitada'
  ).length;
  const confirmedCount = appointmentLeads.filter(
    (l) => l.appointmentRequest?.status === 'confirmada' || l.commercialStatus === 'cita_confirmada'
  ).length;
  const todayCount = appointmentLeads.filter(
    (l) => (l.appointmentRequest?.confirmedDate || l.appointmentRequest?.preferredDate) === todayStr
  ).length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Acción Rápida de la Agenda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'todas'
                ? 'bg-[#0d233a] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas ({totalCount})
          </button>

          <button
            onClick={() => setFilterType('hoy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'hoy'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Hoy ({todayCount})</span>
          </button>

          <button
            onClick={() => setFilterType('pendientes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'pendientes'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Por Confirmar ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilterType('confirmadas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterType === 'confirmadas'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmadas ({confirmedCount})</span>
          </button>
        </div>

        <button
          onClick={onOpenNewAppointment}
          className="w-full sm:w-auto bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Citas */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((lead) => {
            const apt = lead.appointmentRequest;
            const aptDate = apt?.confirmedDate || apt?.preferredDate || 'Fecha por definir';
            const aptTime = apt?.confirmedTime || apt?.timeSlot || 'Horario por definir';
            const isConfirmed = apt?.status === 'confirmada' || lead.commercialStatus === 'cita_confirmada';
            const isToday = aptDate === todayStr;
            const cleanPhone = lead.phone.replace(/\D/g, '');

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl border transition shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isToday
                    ? 'border-rose-300 ring-2 ring-rose-200'
                    : isConfirmed
                    ? 'border-emerald-200'
                    : 'border-amber-200'
                }`}
              >
                {/* Cabecera de la Cita */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    isToday
                      ? 'bg-rose-50 text-rose-900 border-rose-100'
                      : isConfirmed
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-100'
                      : 'bg-amber-50 text-amber-950 border-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-700" />
                    <div>
                      <span className="font-bold text-xs block">
                        {aptDate} {isToday && <span className="text-rose-600 font-extrabold ml-1">(¡HOY!)</span>}
                      </span>
                      <span className="text-[11px] text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {aptTime}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {isConfirmed ? 'Confirmada' : 'Por Confirmar'}
                  </span>
                </div>

                {/* Cuerpo de la Cita */}
                <div className="p-4 space-y-3 flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {lead.fullName}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400">{lead.folio}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {lead.preferredChannel}
                      </span>
                    </div>
                  </div>

                  {/* Detalles del Inmueble y Esquema */}
                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Vivienda:</span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        Modelo Águila Premier
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Forma de pago:
                      </span>
                      <span className="font-semibold text-slate-700 capitalize text-[11px]">
                        {lead.financingType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        Caseta principal Valle de los Encinos (Calzada del Sol, Salinas Victoria)
                      </span>
                    </div>
                  </div>

                  {/* Notas o Requerimientos */}
                  {apt?.notes && (
                    <div className="text-[11px] text-slate-600 bg-amber-50/40 p-2 rounded-lg border border-amber-100/60">
                      <span className="font-semibold text-amber-900 block">Comentarios del cliente:</span>
                      <p className="italic">{apt.notes}</p>
                    </div>
                  )}

                  {/* Estado de Atribución 15 Días */}
                  {lead.attributionStatus === 'confirmado' && lead.attributionExpiresAt && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Exclusividad activa: vence {lead.attributionExpiresAt.split(' ')[0]}</span>
                    </div>
                  )}
                  {lead.attributionStatus === 'pendiente_inmobiliaria' && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-800 bg-blue-50 px-2 py-1 rounded-lg font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                      <span>NSS capturado: Recuerda ingresarlo a constructora</span>
                    </div>
                  )}
                </div>

                {/* Acciones Rápidas para el Asesor */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center gap-1.5 justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenWhatsApp(lead)}
                      title="Enviar mensaje rápido de WhatsApp"
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2 rounded-xl transition shadow-sm flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${cleanPhone}`}
                      title="Llamar directamente"
                      className="bg-white hover:bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Llamar</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isConfirmed ? (
                      <button
                        onClick={() => handleConfirm(lead.id, aptDate, aptTime)}
                        title="Marcar cita como confirmada"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5" />
                        <span>Confirmar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenReschedule(lead)}
                        title="Reprogramar fecha u horario"
                        className="bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>Cambiar</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenLeadDetail(lead)}
                      title="Ver expediente completo"
                      className="bg-[#0d233a] hover:bg-[#163b5c] text-white p-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío de la Agenda */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              No hay citas en este periodo seleccionado
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Utiliza el botón para registrar visitas de prospectos que te hayan contactado directamente por llamada o WhatsApp.
            </p>
          </div>
          <button
            onClick={onOpenNewAppointment}
            className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Agendar Nueva Cita Ahora</span>
          </button>
        </div>
      )}

      {/* Modal Rápido de Reprogramación */}
      {rescheduleLead && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reprogramar Visita para {rescheduleLead.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                Selecciona la nueva fecha y horario acordados con el cliente
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Fecha de Visita
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nuevo Horario
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a]"
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleCancelAppointment(rescheduleLead.id)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CalendarX2 className="w-3.5 h-3.5" />
                <span>Cancelar Cita</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleSaveReschedule}
                  className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
