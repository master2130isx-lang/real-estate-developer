'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Lead } from '@/types';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated?: (lead: Lead) => void;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  onAppointmentCreated,
}: NewAppointmentModalProps) {
  const { scheduleNewAppointment } = useApp();

  // Estados del formulario
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('11:00 AM');
  const [financingType, setFinancingType] = useState<Lead['financingType']>('infonavit');
  const [rawNss, setRawNss] = useState('');
  const [notes, setNotes] = useState('');

  // Estado de éxito posterior al agendamiento
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 10);
    setPhone(numeric);
  };

  const handleNssChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 11);
    setRawNss(numeric);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Por favor ingresa el nombre completo del interesado.');
      return;
    }
    if (phone.length < 10) {
      setError('Ingresa un teléfono celular válido de 10 dígitos.');
      return;
    }
    if (!preferredDate) {
      setError('Selecciona la fecha para la visita.');
      return;
    }
    if (rawNss && rawNss.length !== 11) {
      setError('El NSS debe contener exactamente 11 dígitos numéricos o déjalo vacío.');
      return;
    }

    setError(null);
    const newLead = scheduleNewAppointment({
      fullName: fullName.trim(),
      phone,
      email: email.trim() || undefined,
      financingType,
      preferredDate,
      timeSlot,
      notes: notes.trim(),
      rawNss: rawNss.trim() || undefined,
    });

    setCreatedLead(newLead);
    if (onAppointmentCreated) {
      onAppointmentCreated(newLead);
    }
  };

  const handleResetAndClose = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setRawNss('');
    setNotes('');
    setCreatedLead(null);
    setError(null);
    onClose();
  };

  // Mensaje pre-armado para enviar confirmación por WhatsApp
  const generateWhatsAppUrl = (lead: Lead) => {
    const firstName = lead.fullName.split(' ')[0];
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const dateFormatted = lead.appointmentRequest?.confirmedDate || preferredDate;
    const timeFormatted = lead.appointmentRequest?.confirmedTime || timeSlot;

    const message = `¡Hola ${firstName}! Te escribe ${COMMERCIAL_CONFIG.advisorName}, tu asesor comercial de ${COMMERCIAL_CONFIG.agencyName}.\n\nTu visita para conocer el *Modelo Águila Premier* en *Valle de los Encinos (Salinas Victoria, N.L.)* ha quedado agendada:\n\n• Día: ${dateFormatted}\n• Horario: ${timeFormatted}\n• Punto de reunión: Caseta principal con acceso controlado en Calzada del Sol\n\n¿Me confirmas que recibiste estos datos para enviarte la ubicación exacta por GPS?`;

    return `https://wa.me/52${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {createdLead ? (
          /* Pantalla de Éxito y Acción Rápida */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                ¡Cita Agendada con Éxito!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Folio asignado: <strong className="font-mono text-slate-800">{createdLead.folio}</strong>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-900">{createdLead.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Celular WhatsApp:</span>
                <span className="font-semibold text-slate-900">{createdLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="font-bold text-emerald-700">
                  {createdLead.appointmentRequest?.confirmedDate} a las {createdLead.appointmentRequest?.confirmedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Propiedad:</span>
                <span className="font-semibold text-slate-800">Modelo Águila Premier</span>
              </div>
              {createdLead.attributionStatus === 'pendiente_inmobiliaria' && (
                <div className="pt-2 border-t border-slate-200 text-blue-800 font-semibold text-[11px]">
                  ⚡ NSS capturado: Recuerda ingresarlo en el sistema de la constructora para iniciar tus 15 días de exclusividad.
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-md mx-auto">
              <a
                href={generateWhatsAppUrl(createdLead)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleResetAndClose}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Enviar Confirmación por WhatsApp</span>
              </a>

              <button
                onClick={handleResetAndClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Cerrar y Ver Agenda
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Agendamiento Rápido */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-[#0d233a] border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Agendar Nueva Cita de Visita
                </h3>
                <p className="text-[11px] text-slate-500">
                  Registra visitas de prospectos de llamada, WhatsApp o espontáneos
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Datos del Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo del Cliente *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Roberto Sánchez Gómez"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono Celular (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="10 dígitos (ej. 8112345678)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fecha y Horario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Día de la Visita *</span>
                </label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Horario Pactado *</span>
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-medium"
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

            {/* Forma de Pago y NSS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Forma de Compra / Crédito</span>
                </label>
                <select
                  value={financingType}
                  onChange={(e) => setFinancingType(e.target.value as Lead['financingType'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                >
                  <option value="infonavit">Crédito Infonavit (Tradicional / Total)</option>
                  <option value="bancario">Crédito Hipotecario Bancario</option>
                  <option value="contado">Recursos Propios / Contado</option>
                  <option value="necesita_orientacion">Por definir / Asesoría previa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NSS (Opcional - 11 dígitos)
                </label>
                <input
                  type="text"
                  value={rawNss}
                  onChange={(e) => handleNssChange(e.target.value)}
                  placeholder="Si lo tiene en mano"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Permite apartar atribución de 15 días en la constructora
                </span>
              </div>
            </div>

            {/* Notas Comerciales */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Notas o Requerimientos de la Familia</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Interesados en recámara principal y patio amplio. Vienen 3 adultos y 1 menor."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none resize-none"
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Agendar y Guardar Cita</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
