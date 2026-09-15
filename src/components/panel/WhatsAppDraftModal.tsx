'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  Edit3,
} from 'lucide-react';
import { Lead } from '@/types';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface WhatsAppDraftModalProps {
  lead: Lead | null;
  onClose: () => void;
}

type TemplateId = 'confirmar' | 'ubicacion' | 'recordatorio' | 'ficha' | 'credito' | 'personalizado';

export function WhatsAppDraftModal({ lead, onClose }: WhatsAppDraftModalProps) {
  const { updateLeadStatus, commercialConfig } = useApp();
  const cfg = commercialConfig || COMMERCIAL_CONFIG;

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('confirmar');
  const [customText, setCustomText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const firstName = (lead.fullName || 'Cliente').split(' ')[0];
  const cleanPhone = (lead.phone || '').replace(/\D/g, '');
  const visitDay = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'los próximos días';
  const visitTime = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'en horario por convenir';

  // Plantillas Comerciales de Alta Conversión
  const templates: Record<TemplateId, { title: string; icon: React.ReactNode; text: string }> = {
    confirmar: {
      title: 'Confirmar Cita',
      icon: <Calendar className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te escribe ${cfg.advisorName}, tu asesor comercial de ${cfg.agencyName}.\n\nTu visita para conocer el *Modelo Águila Premier* en *Valle de los Encinos (Salinas Victoria, N.L.)* ha quedado programada:\n\n• Día: ${visitDay}\n• Horario: ${visitTime}\n• Punto de reunión: Caseta principal con acceso controlado 24/7 en Calzada del Sol\n\n¿Me confirmas que recibiste estos datos para enviarte la ubicación exacta por GPS?`,
    },
    ubicacion: {
      title: 'Enviar Ubicación GPS',
      icon: <MapPin className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te comparto las rutas GPS directas para llegar a la caseta principal de *Valle de los Encinos (Salinas Victoria, N.L.)*:\n\n• Google Maps: https://www.google.com/maps/search/?api=1&query=25.9620,-100.2940\n• Waze: https://waze.com/ul?ll=25.9620,-100.2940&navigate=yes\n\nAl llegar a la caseta de acceso, solo avisa a los guardias que tienes cita con ${cfg.advisorName} para que te den acceso a las casas muestra. ¡Buen viaje!`,
    },
    recordatorio: {
      title: 'Recordatorio Pre-Visita',
      icon: <Clock className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te recuerdo que hoy tenemos agendada tu visita a la casa muestra del *Modelo Águila Premier* en Valle de los Encinos a las ${visitTime}.\n\nTe espero en la caseta principal. Si requieres apoyo con indicaciones o necesitas ajustar minutos de llegada, escríbeme por aquí. ¡Nos vemos en un rato!`,
    },
    ficha: {
      title: 'Ficha y Fotos ($1.18M)',
      icon: <FileText className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te comparto los detalles del *Modelo Águila Premier* ($1,180,000 MXN) en Valle de los Encinos:\n\n• 2 plantas con vitropiso instalado\n• 2 recámaras y estancia familiar en planta alta\n• 1.5 baños (medio baño en PB y baño completo en PA)\n• Patio con pasillo lateral independiente y cochera 2 autos\n• Fraccionamiento con caseta 24/7, palapa familiar, canchas y pet park\n\nPuedes ver fotos reales y el mapa aquí: https://www.encuentratucasa.online/\n\n¿Te gustaría que agendemos tu recorrido presencial este fin de semana?`,
    },
    credito: {
      title: 'Asesoría Infonavit',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Con gusto te puedo apoyar a consultar tu monto de crédito Infonavit o bancario para el *Modelo Águila Premier* ($1,180,000 MXN).\n\nEs una asesoría 100% gratuita y no afecta en nada tu puntuación. ¿Cuentas con tu NSS o te gustaría que te guíe paso a paso para revisarlo?`,
    },
    personalizado: {
      title: 'Mensaje Libre',
      icon: <Edit3 className="w-3.5 h-3.5" />,
      text: `Hola ${firstName}, te escribe ${cfg.advisorName} de Valle de los Encinos. `,
    },
  };

  const activeMessage = isEditing ? customText : templates[selectedTemplate].text;

  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    setIsEditing(false);
    setCustomText(templates[id].text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsEditing(true);
    setCustomText(e.target.value);
  };

  const encodedMessage = encodeURIComponent(activeMessage);
  const waUrl = `https://wa.me/52${cleanPhone}?text=${encodedMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank');
    updateLeadStatus(lead.id, 'contactado', `WhatsApp enviado: plantilla ${selectedTemplate}`);
  };

  const handleMarkAsContacted = () => {
    updateLeadStatus(lead.id, 'contactado', `Mensaje de WhatsApp preparado (${selectedTemplate}).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-100 pb-3">
          <WhatsAppIcon className="w-5 h-5" />
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Respuestas Rápidas para {lead.fullName}
            </h3>
            <p className="text-[11px] text-slate-500">
              Teléfono de destino: <strong className="text-slate-800 font-mono">{lead.phone}</strong>
            </p>
          </div>
        </div>

        {/* Selector de Plantillas Comerciales */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Elige una plantilla comercial para enviar:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(templates) as TemplateId[]).map((id) => {
              const tmpl = templates[id];
              const isSelected = selectedTemplate === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectTemplate(id)}
                  className={`p-2 rounded-xl text-left text-xs font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-600' : 'text-slate-400'}>
                    {tmpl.icon}
                  </span>
                  <span className="truncate">{tmpl.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor de Texto del Mensaje */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-800">
              Texto del mensaje (puedes editarlo libremente):
            </label>
            <span className="text-[11px] text-slate-400">Listo para WhatsApp</span>
          </div>

          <textarea
            rows={7}
            value={activeMessage}
            onChange={handleTextChange}
            className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-sans text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 resize-y"
          />
        </div>

        {/* Botones de Acción Inmediata */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Abrir en WhatsApp Directo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleMarkAsContacted}
            className="w-full bg-[#0d233a] hover:bg-[#163b5c] text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            Guardar y Registrar en Expediente como &quot;Contactado&quot;
          </button>
        </div>
      </div>
    </div>
  );
}
