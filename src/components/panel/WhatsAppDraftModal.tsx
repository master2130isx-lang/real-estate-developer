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
import { buildWhatsAppLink } from '@/lib/phone';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface WhatsAppDraftModalProps {
  lead: Lead | null;
  onClose: () => void;
}

type TemplateId =
  | 'confirmar'
  | 'ubicacion'
  | 'recordatorio'
  | 'pedir_nss'
  | 'aprobado'
  | 'ficha'
  | 'credito'
  | 'personalizado';

export function WhatsAppDraftModal({ lead, onClose }: WhatsAppDraftModalProps) {
  const { updateLeadStatus, commercialConfig, properties } = useApp();
  const cfg = commercialConfig || COMMERCIAL_CONFIG;

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('confirmar');
  const [customText, setCustomText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset al cambiar de prospecto
  React.useEffect(() => {
    setIsEditing(false);
    setCopied(false);
    setCustomText('');
  }, [lead?.id]);

  if (!lead) return null;

  // Propiedad vinculada al lead o destacada
  const matchedProperty =
    properties.find((p) => p.id === lead.selectedPropertyId) ||
    (lead.selectedPropertyTitle
      ? properties.find(
          (p) =>
            p.name.toLowerCase() === lead.selectedPropertyTitle?.toLowerCase() ||
            p.model.toLowerCase() === lead.selectedPropertyTitle?.toLowerCase()
        )
      : undefined) ||
    properties.find((p) => p.id === cfg.heroPropertyId) ||
    properties[0];

  const firstName = (lead.fullName || 'Cliente').split(' ')[0];
  const visitDay = lead.appointmentRequest?.confirmedDate || lead.appointmentRequest?.preferredDate || 'los próximos días';
  const visitTime = lead.appointmentRequest?.confirmedTime || lead.appointmentRequest?.timeSlot || 'en horario por convenir';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const propertyTitle = lead.selectedPropertyTitle || matchedProperty?.name || 'la vivienda';
  const propertyPrice = matchedProperty?.price
    ? `$${matchedProperty.price.toLocaleString('es-MX')} MXN`
    : cfg.featuredPrice?.amountFormatted || 'precio por confirmar';
  const developmentName = matchedProperty?.development || cfg.agencyName || 'el desarrollo';
  const zoneName = matchedProperty?.zone || lead.interestedZone || cfg.coverageZone;
  const meetingPointLabel = cfg.landing.meetingPoint || 'Acceso principal';
  const addressNote = matchedProperty?.address || cfg.contactChannels.officeAddressNote || meetingPointLabel;
  const meetingPoint = matchedProperty?.address
    ? `${meetingPointLabel} en ${matchedProperty.address}`
    : cfg.contactChannels.officeAddressNote
    ? `${meetingPointLabel} (${cfg.contactChannels.officeAddressNote})`
    : meetingPointLabel;

  const gpsQuery = encodeURIComponent(matchedProperty?.address || cfg.landing.mapQuery || cfg.contactChannels.officeAddressNote || `${developmentName}, ${zoneName}`);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${gpsQuery}`;
  const wazeLink = `https://waze.com/ul?q=${gpsQuery}&navigate=yes`;

  const features = matchedProperty?.keyFeatures || matchedProperty?.tags || [];
  const propertyFeaturesList = features.length > 0
    ? features.slice(0, 5).map((f: string) => `• ${f}`).join('\n')
    : `• ${matchedProperty?.bedrooms || 2} recámaras\n• ${matchedProperty?.bathrooms || 1.5} baños\n• Acabados de alta calidad\n• Fraccionamiento privado con acceso controlado`;

  // Plantillas Comerciales Dinámicas de Alta Conversión (Especializadas para el Asesor)
  const templates: Record<TemplateId, { title: string; icon: React.ReactNode; text: string }> = {
    confirmar: {
      title: 'Confirmar Cita',
      icon: <Calendar className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te escribe ${cfg.advisorName}, tu asesor comercial de ${cfg.agencyName}.\n\nTu visita para conocer el *${propertyTitle}* en *${developmentName} (${zoneName})* ha quedado programada:\n\n• Día: ${visitDay}\n• Horario: ${visitTime}\n• Punto de reunión: ${meetingPoint}\n\n¿Me confirmas que recibiste estos datos para enviarte la ubicación exacta por GPS?`,
    },
    ubicacion: {
      title: 'Ubicación GPS',
      icon: <MapPin className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te comparto las rutas GPS directas para llegar a *${developmentName} (${zoneName})*:\n\n• Google Maps: ${mapsLink}\n• Waze: ${wazeLink}\n\nAl llegar a ${meetingPointLabel.toLowerCase()} (${addressNote}), avisa que tienes cita con ${cfg.advisorName} para que te permitan el acceso a las casas muestra. ¡Buen viaje!`,
    },
    recordatorio: {
      title: 'Recordatorio Pre-Visita',
      icon: <Clock className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te recuerdo que hoy tenemos agendada tu visita a la casa muestra del *${propertyTitle}* en ${developmentName} a las ${visitTime}.\n\nTe espero en ${meetingPoint}. Si requieres apoyo con indicaciones o necesitas ajustar minutos de llegada, avísame por aquí. ¡Nos vemos en un rato!`,
    },
    pedir_nss: {
      title: lead.financingType === 'fovissste'
        ? 'Pedir CURP (FOVISSSTE)'
        : lead.financingType === 'bancario'
        ? 'Pedir Datos Bancarios'
        : 'Pedir NSS para Precalificar',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      text: lead.financingType === 'fovissste'
        ? `¡Hola ${firstName}! Para decirte con exactitud cuánto te otorga tu crédito FOVISSSTE y revisar tu simulador para el *${propertyTitle}* (${propertyPrice} en ${zoneName}), solo requiero consultar tu estatus oficial con tu *CURP (18 caracteres)*.\n\nEs una consulta 100% informativa y sin costo que no te compromete a nada. ¿La tienes a la mano para revisarlo ahora mismo?`
        : lead.financingType === 'bancario'
        ? `¡Hola ${firstName}! Para apoyarte a cotizar tu crédito bancario o Cofinavit para el *${propertyTitle}* (${propertyPrice} en ${zoneName}), trabajamos con los principales bancos (BBVA, Banorte, Santander, HSBC) para conseguirte la tasa y mensualidad más baja sin costo de asesoría. ¿Tienes estimado cuánto deseas dar de enganche?`
        : `¡Hola ${firstName}! Para decirte con exactitud cuánto te presta Infonavit y ver tu mensualidad estimada para el *${propertyTitle}* (${propertyPrice} en ${zoneName}), solo requiero consultar tu precalificación oficial con tu *NSS (11 dígitos)* y tu *fecha de nacimiento*.\n\nEs una consulta 100% informativa y gratuita que no descuenta puntos ni te compromete a nada. ¿Los tienes a la mano para revisarlo ahora mismo?`,
    },
    aprobado: {
      title: 'Crédito Pre-Aprobado',
      icon: <Check className="w-3.5 h-3.5" />,
      text: `¡Excelente noticia ${firstName}! Ya revisé tu perfil en el sistema y *sí cuentas con el crédito suficiente* para estrenar en *${developmentName}* (${propertyPrice}).\n\nEl siguiente paso es que conozcas las casas muestra en ${addressNote}. ¿Te gustaría visitarnos este fin de semana para apartar tu ubicación?`,
    },
    ficha: {
      title: `Ficha y Fotos (${propertyPrice})`,
      icon: <FileText className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Te comparto los detalles del *${propertyTitle}* (${propertyPrice}) en ${developmentName}:\n\n${propertyFeaturesList}\n\nPuedes ver fotos reales y detalles aquí: ${siteUrl}\n\n¿Te gustaría que agendemos tu recorrido presencial este fin de semana?`,
    },
    credito: {
      title: 'Asesoría de Financiamiento',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      text: `¡Hola ${firstName}! Con gusto te puedo apoyar a tramitar tu financiamiento (${lead.financingType === 'fovissste' ? 'FOVISSSTE' : lead.financingType === 'bancario' ? 'Bancario / Cofinavit' : 'Infonavit o Bancario'}) para el *${propertyTitle}* (${propertyPrice}). Te acompañamos en todo el trámite sin costo de asesoría. ¿Tienes alguna duda específica?`,
    },
    personalizado: {
      title: 'Mensaje Libre',
      icon: <Edit3 className="w-3.5 h-3.5" />,
      text: `Hola ${firstName}, te escribe ${cfg.advisorName} de ${cfg.agencyName}. `,
    },
  };

  const activeMessage = isEditing ? customText : templates[selectedTemplate].text;

  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    setIsEditing(false);
    setCustomText('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsEditing(true);
    setCustomText(e.target.value);
  };

  const waUrl = buildWhatsAppLink(lead.phone, activeMessage);

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
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-3">
          <WhatsAppIcon className="w-5 h-5" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Respuestas Rápidas para {lead.fullName}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Teléfono de destino: <strong className="text-slate-800 dark:text-amber-400 font-mono">{lead.phone}</strong>
            </p>
          </div>
        </div>

        {/* Selector de Plantillas Comerciales */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
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
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-200 dark:ring-emerald-900/40 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
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
            <label className="font-bold text-slate-800 dark:text-slate-200">
              Texto del mensaje (puedes editarlo libremente):
            </label>
            <span className="text-[11px] text-slate-400">Listo para WhatsApp</span>
          </div>

          <textarea
            rows={7}
            value={activeMessage}
            onChange={handleTextChange}
            className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-sans text-slate-800 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50 dark:bg-slate-800/80 resize-y"
          />
        </div>

        {/* Botones de Acción Inmediata */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-3 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
            className="w-full bg-[#0d233a] hover:bg-[#163b5c] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            Guardar y Registrar en Expediente como &quot;Contactado&quot;
          </button>
        </div>
      </div>
    </div>
  );
}
