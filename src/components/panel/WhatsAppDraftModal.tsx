'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { Lead } from '@/types';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { useApp } from '@/context/AppContext';

interface WhatsAppDraftModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function WhatsAppDraftModal({ lead, onClose }: WhatsAppDraftModalProps) {
  const { updateLeadStatus } = useApp();
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const propertyOrZone = lead.selectedPropertyTitle || lead.interestedZone || 'las propiedades de tu interés';
  const visitDay = lead.appointmentRequest?.preferredDate || 'los próximos días';
  const visitTime = lead.appointmentRequest?.timeSlot || 'en horario de tu conveniencia';

  // TEXTO PROPUESTO EXACTO (Sin NSS, sin presupuesto, sin enlaces privados, como consulta de preferencia)
  const draftMessage = `Hola ${lead.fullName.split(' ')[0]}, soy ${COMMERCIAL_CONFIG.advisorName} de ${COMMERCIAL_CONFIG.agencyName}. Recibimos tu solicitud para conocer ${propertyOrZone}. ¿Te funciona el ${visitDay} a las ${visitTime}? Quedo atento para confirmar.`;

  const cleanPhone = lead.phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(draftMessage);
  const waUrl = `https://wa.me/52${cleanPhone}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(draftMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank');
  };

  const handleMarkAsContacted = () => {
    updateLeadStatus(lead.id, 'contactado', 'Mensaje de WhatsApp preparado y enviado manualmente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wa-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Preparación de Mensaje de WhatsApp (Manual)
          </span>
        </div>

        <div>
          <h3 id="wa-modal-title" className="text-lg font-bold text-slate-900">
            Borrador para: {lead.fullName}
          </h3>
          <p className="text-xs text-slate-500">
            Teléfono destino: <strong>{lead.phone}</strong>
          </p>
        </div>

        {/* Advertencias y Reglas de Negocio */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Reglas de confirmación:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800">
            <li>Abrir WhatsApp no significa que el mensaje se haya enviado.</li>
            <li>Enviar un mensaje no significa que el cliente haya aceptado.</li>
            <li>La cita solo cambia a <strong>Confirmada</strong> cuando el asesor registra el acuerdo con el prospecto.</li>
            <li>No incluye NSS, presupuesto ni datos crediticios por confidencialidad.</li>
          </ul>
        </div>

        {/* Caja del mensaje editable/copiable */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-800">
            Texto del mensaje preparado:
          </label>
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans">
            {draftMessage}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir WhatsApp Web / App</span>
            </button>
          </div>

          <button
            onClick={handleMarkAsContacted}
            className="w-full bg-[#0d233a] hover:bg-[#163b5c] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            Registrar como &quot;Contactado por WhatsApp&quot;
          </button>
        </div>
      </div>
    </div>
  );
}
