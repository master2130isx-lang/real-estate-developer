'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Shield,
  ShieldAlert,
  Lock,
  Eye,
  CheckCircle2,
  MessageSquare,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Lead, CommercialStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { WhatsAppDraftModal } from './WhatsAppDraftModal';
import { ConfirmRegistrationModal } from './ConfirmRegistrationModal';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const { updateLeadStatus, updateAppointmentStatus, addLeadNote, revealNssWithAudit } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'atribucion' | 'cita' | 'notas' | 'auditoria'>('info');
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CommercialStatus | ''>('');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  // Modales adicionales
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isConfirmRegModalOpen, setIsConfirmRegModalOpen] = useState(false);

  // Estados para revelado de NSS
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [revealedNss, setRevealedNss] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);

  // Estados para cita confirmada
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');

  if (!lead) return null;

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    updateLeadStatus(lead.id, selectedStatus, statusChangeReason ? `Motivo: ${statusChangeReason}` : undefined);
    setSelectedStatus('');
    setStatusChangeReason('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addLeadNote(lead.id, newNote.trim());
    setNewNote('');
  };

  const handleConfirmAppointment = () => {
    updateAppointmentStatus(lead.id, 'confirmada', confirmedDate, confirmedTime);
  };

  const handleCancelAppointment = () => {
    updateAppointmentStatus(lead.id, 'cancelada');
  };

  const handleExecuteRevealNss = () => {
    if (!revealReason || revealReason.trim().length < 5) {
      setRevealError('Debes ingresar un motivo comercial o legal justificado (mínimo 5 letras).');
      return;
    }
    setRevealError(null);
    const result = revealNssWithAudit(lead.id, revealReason);
    if (result.success && result.nss) {
      setRevealedNss(result.nss);
      setIsRevealModalOpen(false);
      setRevealReason('');
    } else {
      setRevealError(result.error || 'Error al autorizar consulta.');
    }
  };

  const commercialStatusLabels: Record<CommercialStatus, string> = {
    nuevo: 'Nuevo',
    pendiente_info: 'Pendiente de Información',
    listo_revision: 'Listo para Revisión',
    contactado: 'Contactado',
    cita_solicitada: 'Cita Solicitada',
    cita_confirmada: 'Cita Confirmada',
    en_seguimiento: 'En Seguimiento',
    cerrado: 'Cerrado',
    no_compatible: 'No Compatible',
  };

  const attributionLabels: Record<Lead['attributionStatus'], { label: string; bg: string; text: string }> = {
    no_aplica: { label: 'No aplica', bg: 'bg-slate-100', text: 'text-slate-600' },
    pendiente_nss: { label: 'Pendiente de NSS (Orientación)', bg: 'bg-amber-100', text: 'text-amber-800' },
    pendiente_inmobiliaria: { label: 'Pendiente de registro en inmobiliaria', bg: 'bg-blue-100', text: 'text-blue-900' },
    confirmado: { label: 'Registro confirmado (15 días activos)', bg: 'bg-emerald-100', text: 'text-emerald-900' },
    conflicto_rechazo: { label: 'Conflicto o rechazo', bg: 'bg-rose-100', text: 'text-rose-800' },
    vencido: { label: 'Vencido (Plazo concluido)', bg: 'bg-slate-200', text: 'text-slate-700' },
  };

  const currentAttribution = (lead.attributionStatus && attributionLabels[lead.attributionStatus]) || {
    label: 'No aplica / Sin registro',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del expediente */}
        <div className="border-b border-slate-200 pb-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
              {lead.folio || 'FOLIO-N/A'}
            </span>
            <span className="text-xs text-slate-500">Registrado en web: {lead.createdAt || 'Reciente'}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 id="lead-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {lead.fullName || 'Interesado'}
            </h2>
            {/* Botón de acción rápida: WhatsApp */}
            <button
              onClick={() => setIsWaModalOpen(true)}
              className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Preparar WhatsApp</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0d233a] text-white">
              Estado: {commercialStatusLabels[lead.commercialStatus] || lead.commercialStatus || 'Nuevo'}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${currentAttribution.bg} ${currentAttribution.text}`}>
              Atribución: {currentAttribution.label}
            </span>
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Compatibilidad: <strong className="capitalize">{((lead.compatibility || 'media') as string).replace(/_/g, ' ')}</strong>
            </span>
          </div>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="flex border-b border-slate-200 gap-4 mb-5 text-xs font-bold overflow-x-auto">
          {[
            { id: 'info', label: 'Resumen' },
            { id: 'atribucion', label: 'Registro Inmobiliaria (15 días)' },
            { id: 'cita', label: 'Visita Solicitada' },
            { id: 'notas', label: `Notas (${(lead.internalNotes || []).length})` },
            { id: 'auditoria', label: `Auditoría (${(lead.auditHistory || []).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'info' | 'atribucion' | 'cita' | 'notas' | 'auditoria')}
              className={`pb-2.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#0d233a] text-[#0d233a]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PESTAÑA 1: RESUMEN COMERCIAL */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Datos de Contacto
                </p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>
                    <strong>Teléfono:</strong> {lead.phone || 'Sin teléfono'}
                  </span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>
                      <strong>Correo:</strong> {lead.email}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    <strong>Preferencia:</strong> {lead.preferredChannel || 'whatsapp'} ({lead.preferredContactTime || 'tarde'})
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Búsqueda y Financiamiento
                </p>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>
                    <strong>Zona:</strong> {lead.interestedZone || 'Salinas Victoria, N.L. (Valle de los Encinos)'}
                  </span>
                </div>
                <div>
                  <strong>Forma de compra:</strong> {((lead.financingType || 'infonavit') as string).replace(/_/g, ' ')}
                </div>
                <div>
                  <strong>Presupuesto:</strong> {((lead.budgetRange || 'Aún no lo sé') as string).replace(/_/g, ' ')}
                </div>
                <div>
                  <strong>Plazo:</strong> {lead.purchaseTimeline || 'En evaluación'}
                </div>
                {lead.selectedPropertyTitle && (
                  <div className="text-amber-900 font-medium pt-1">
                    🎯 <strong>Modelo de interés:</strong> {lead.selectedPropertyTitle}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN SEGURA DEL NSS */}
            <div className="bg-[#0d233a] text-white p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    NSS Recibido en Web (Simulación Demo)
                  </span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Enmascarado por defecto
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                El NSS se utiliza exclusivamente para solicitar el registro de atribución comercial ante la inmobiliaria. Permanece oculto y su consulta queda registrada en la bitácora de auditoría.
              </p>

              <div className="bg-slate-800/80 p-3.5 rounded-xl flex items-center justify-between border border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 block">Número de Seguridad Social:</span>
                  <span className="font-mono text-base font-bold tracking-widest text-amber-300">
                    {revealedNss
                      ? revealedNss
                      : lead.nssStatus === 'recibido'
                      ? `•••• •••• ${lead.nssLastFour || '••••'}`
                      : lead.nssStatus === 'pendiente'
                      ? 'No proporcionado en formulario'
                      : 'No aplica'}
                  </span>
                </div>

                {lead.nssStatus === 'recibido' && !revealedNss && (
                  <button
                    onClick={() => setIsRevealModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revelar NSS</span>
                  </button>
                )}
              </div>

              {revealedNss && (
                <div className="bg-emerald-950/80 border border-emerald-700 p-2.5 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
                  <span>✓ NSS revelado bajo auditoría simulada.</span>
                  <button
                    onClick={() => setRevealedNss(null)}
                    className="text-xs text-emerald-400 underline cursor-pointer"
                  >
                    Ocultar de nuevo
                  </button>
                </div>
              )}
            </div>

            {/* Actualizar Estado Comercial */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Actualizar Estado Comercial
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CommercialStatus)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">Selecciona nuevo estado comercial...</option>
                  {Object.entries(commercialStatusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Nota breve del cambio (Opcional)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <button
                disabled={!selectedStatus}
                onClick={handleStatusUpdate}
                className="bg-[#0d233a] disabled:bg-slate-300 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Guardar Cambio de Estado
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: REGISTRO INTERNO · 15 DÍAS */}
        {activeTab === 'atribucion' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Mecanismo de Atribución Comercial (15 Días)
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${currentAttribution.bg} ${currentAttribution.text}`}>
                  {currentAttribution.label}
                </span>
              </div>

              {/* DISTINCIÓN FUNDAMENTAL */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Distinción Fundamental:
                </p>
                <p className="leading-relaxed">
                  <strong>NSS recibido en la web ≠ bloqueo confirmado en la inmobiliaria.</strong> La fuente de verdad es el mecanismo interno de la inmobiliaria. Si la inmobiliaria opera otro sistema, el asesor debe registrar allí al prospecto antes de considerar activa la atribución.
                </p>
              </div>

              {lead.attributionStatus === 'confirmado' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asesor Asignado:</span>
                    <strong className="text-slate-900">{lead.attributionAdvisor || 'Asesor Asignado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Folio / Referencia Inmobiliaria:</span>
                    <strong className="text-slate-900">{lead.attributionReference || 'Sin referencia'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fecha efectiva de registro:</span>
                    <strong className="text-slate-900">{lead.attributionConfirmedAt}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vencimiento de atribución:</span>
                    <strong className="text-amber-700">{lead.attributionExpiresAt}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Registrado en demo por:</span>
                    <span className="text-slate-700 font-medium">{lead.attributionConfirmedBy}</span>
                  </div>
                </div>
              ) : lead.attributionStatus === 'pendiente_inmobiliaria' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-2">
                  <p className="font-bold">
                    Acción pendiente para el asesor:
                  </p>
                  <p className="leading-relaxed">
                    El prospecto ya proporcionó su NSS en la web. Debes ingresar este dato en el sistema de la inmobiliaria para formalizar el bloqueo de 15 días y después simular aquí la confirmación.
                  </p>
                </div>
              ) : lead.attributionStatus === 'pendiente_nss' ? (
                <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-600">
                  El prospecto solicitó orientación previa sin ingresar su NSS. Cuando acuerden tramitar con Infonavit, podrás recabar el NSS de forma segura y confirmar la atribución.
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Este prospecto no aplica para el registro interno por NSS (forma de compra: {lead.financingType}).
                </div>
              )}

              {/* Botón para simular confirmación o conflicto */}
              <div className="pt-2">
                <button
                  onClick={() => setIsConfirmRegModalOpen(true)}
                  className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Gestionar Registro en Inmobiliaria (Simulación Demo)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: VISITA SOLICITADA */}
        {activeTab === 'cita' && (
          <div className="space-y-4">
            {lead.appointmentRequest ? (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">
                      Preferencia de Visita: {lead.appointmentRequest.modality === 'presencial' ? 'Presencial en Casa Muestra' : 'Virtual'}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      lead.appointmentRequest.status === 'confirmada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Estado: {lead.appointmentRequest.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Día tentativo indicado por el prospecto:</span>
                    <strong className="text-sm">{lead.appointmentRequest.preferredDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Franja horaria solicitada:</span>
                    <strong className="text-sm">{lead.appointmentRequest.timeSlot}</strong>
                  </div>
                  {lead.appointmentRequest.notes && (
                    <div className="col-span-2 bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Comentarios del prospecto:</span>
                      <p className="mt-1">{lead.appointmentRequest.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      Acuerdo de Visita (Confirmación Manual):
                    </p>
                    <button
                      onClick={() => setIsWaModalOpen(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Preparar WhatsApp de consulta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="date"
                      value={confirmedDate || lead.appointmentRequest.preferredDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                    <input
                      type="time"
                      value={confirmedTime || '11:00'}
                      onChange={(e) => setConfirmedTime(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleConfirmAppointment}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Visita como Confirmada</span>
                    </button>
                    <button
                      onClick={handleCancelAppointment}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Rechazar / Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Este prospecto no registró preferencias de visita.
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: NOTAS INTERNAS */}
        {activeTab === 'notas' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Agregar nota interna de seguimiento
              </label>
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Detalles de conversación por WhatsApp o acuerdos con el cliente..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
              ></textarea>
              <button
                type="submit"
                className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Guardar Nota
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {(lead.internalNotes || []).length > 0 ? (
                (lead.internalNotes || []).map((note) => (
                  <div key={note.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span className="font-bold text-slate-700">{note.author}</span>
                      <span>{note.createdAt}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center italic">No hay notas registradas para este prospecto.</p>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 5: AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Historial de eventos y consultas de datos confidenciales (Simulación de bitácora en frontend).
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(lead.auditHistory || []).length > 0 ? (
                (lead.auditHistory || []).map((event) => (
                  <div
                    key={event.id}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5"
                  >
                    <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{event.actor}</span>
                        <span>{new Date(event.timestamp).toLocaleString('es-MX')}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{event.action}</p>
                      {event.reason && (
                        <p className="text-amber-800 text-[11px]">
                          <strong>Motivo:</strong> {event.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center italic">Sin registros de auditoría.</p>
              )}
            </div>
          </div>
        )}

        {/* MODAL DE JUSTIFICACIÓN PARA REVELAR NSS */}
        {isRevealModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Protocolo de Consulta de NSS (Demo)</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">
                Revelar NSS para trámite en inmobiliaria
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Esta consulta quedará registrada en la bitácora de auditoría. El dato debe utilizarse únicamente para el registro en el mecanismo de la inmobiliaria.
              </p>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo justificado de consulta:
                </label>
                <input
                  type="text"
                  value={revealReason}
                  onChange={(e) => setRevealReason(e.target.value)}
                  placeholder="Ej. Registro en sistema de la inmobiliaria para atribución"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
                {revealError && <p className="text-[11px] text-red-600">{revealError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsRevealModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExecuteRevealNss}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
                >
                  Confirmar y Revelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE WHATSAPP */}
        <WhatsAppDraftModal lead={isWaModalOpen ? lead : null} onClose={() => setIsWaModalOpen(false)} />

        {/* MODAL DE CONFIRMACIÓN DE ATRIBUCIÓN EN INMOBILIARIA */}
        <ConfirmRegistrationModal
          lead={isConfirmRegModalOpen ? lead : null}
          onClose={() => setIsConfirmRegModalOpen(false)}
        />
      </div>
    </div>
  );
}
