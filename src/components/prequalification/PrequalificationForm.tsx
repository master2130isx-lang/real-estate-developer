'use client';

import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Property, FinancingType, PurchaseTimeline, BudgetRange, ContactChannel, PreferredContactTime, Lead } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { COMMERCIAL_CONFIG, shouldRequestNss } from '@/config/commercialConfig';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const getUpcomingWeekendStr = () => {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  return d.toISOString().split('T')[0];
};

interface PrequalificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProperty?: Property | null;
  onOpenPrivacyNotice: () => void;
}

export function PrequalificationForm({
  isOpen,
  onClose,
  preselectedProperty,
  onOpenPrivacyNotice,
}: PrequalificationFormProps) {
  const { createLeadFromPrequalification, logFunnelEvent } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);

  // Paso 1: Qué busca
  const [zone, setZone] = useState<string>(() => preselectedProperty?.zone || 'Salinas Victoria, N.L. (Valle de los Encinos)');
  const [propertyId, setPropertyId] = useState<string>(() => preselectedProperty?.id || 'prop-aguila-premier');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('1.2m_a_1.6m');
  const [purchaseTimeline, setPurchaseTimeline] = useState<PurchaseTimeline>('corto');
  const [financingType, setFinancingType] = useState<FinancingType>('infonavit');
  const [needsOrientation, setNeedsOrientation] = useState<boolean>(false);

  // Paso 2: Contacto
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [preferredChannel, setPreferredChannel] = useState<ContactChannel>('whatsapp');
  const [privacyConsentAccepted, setPrivacyConsentAccepted] = useState<boolean>(true);
  const [marketingConsentAccepted, setMarketingConsentAccepted] = useState<boolean>(false);

  // Paso 3: Registro interno con NSS
  const [nssInput, setNssInput] = useState<string>('');
  const [skipNssForOrientation, setSkipNssForOrientation] = useState<boolean>(false);

  // Paso 4: Preferencia de visita
  const [appointmentModality, setAppointmentModality] = useState<'presencial' | 'virtual'>('presencial');
  const [preferredDate, setPreferredDate] = useState<string>(getTomorrowDateStr());
  const [timeSlot, setTimeSlot] = useState<'10:00 - 13:00' | '14:00 - 17:00' | '17:00 - 19:00' | 'sabado_manana'>('10:00 - 13:00');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const requiresNssStep = shouldRequestNss(financingType);

  // Validaciones paso por paso
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!zone) errs.zone = 'Selecciona una zona de preferencia';
    if (!financingType) errs.financingType = 'Selecciona una forma de compra o solicita orientación';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      errs.phone = 'Ingresa tu número celular a 10 dígitos (ej. 5512345678)';
    }

    if (!privacyConsentAccepted) {
      errs.privacy = 'Es necesario aceptar el Aviso de Privacidad para atender tu solicitud';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    // Si la ruta requiere NSS y no eligió la alternativa de orientación previa
    if (requiresNssStep && !skipNssForOrientation) {
      const cleanNss = nssInput.replace(/\D/g, '');
      if (cleanNss.length !== 11) {
        errs.nss = 'El NSS consta de exactamente 11 dígitos numéricos';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!preferredDate) {
      errs.preferredDate = 'Por favor indica la fecha tentativa en la que te gustaría realizar la visita';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        logFunnelEvent('paso_completado', { paso: 1, forma_compra: financingType });
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        logFunnelEvent('paso_completado', { paso: 2 });
        // Si la regla comercial requiere paso de NSS, ir al paso 3; si no, pasar directo al paso de visita (4)
        if (requiresNssStep) {
          logFunnelEvent('paso_nss_presentado');
          setStep(3);
        } else {
          setStep(4);
        }
      }
    } else if (step === 3) {
      if (validateStep3()) {
        if (skipNssForOrientation) {
          logFunnelEvent('paso_nss_omitido');
        } else {
          logFunnelEvent('paso_nss_completado');
        }
        setStep(4);
      }
    } else if (step === 4) {
      if (validateStep4()) {
        handleSubmitForm();
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 4 && !requiresNssStep) {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitForm = () => {
    const selectedProp = PROPERTIES_DATA.find((p) => p.id === propertyId);

    // Derivar automáticamente el horario de contacto conforme a la franja de visita elegida
    let derivedContactTime: PreferredContactTime = 'tarde';
    if (timeSlot === '10:00 - 13:00' || timeSlot === 'sabado_manana') {
      derivedContactTime = 'manana';
    } else if (timeSlot === '14:00 - 17:00') {
      derivedContactTime = 'tarde';
    } else {
      derivedContactTime = 'noche';
    }

    const leadPayload: Partial<Lead> = {
      fullName: fullName.trim(),
      phone: phone.replace(/\D/g, ''),
      email: email.trim() || undefined,
      preferredChannel,
      preferredContactTime: derivedContactTime,
      interestedZone: zone,
      selectedPropertyId: propertyId || undefined,
      selectedPropertyTitle: selectedProp ? `${selectedProp.model} (${selectedProp.name})` : undefined,
      budgetRange,
      purchaseTimeline,
      financingType,
      needsOrientation: needsOrientation || skipNssForOrientation,
      privacyConsentAccepted: true,
      marketingConsentAccepted,
      appointmentRequest: {
        modality: appointmentModality,
        preferredDate: preferredDate || getTomorrowDateStr(),
        timeSlot,
        notes: appointmentNotes.trim() || undefined,
        status: 'solicitada',
      },
    };

    const isProvidingNss = requiresNssStep && !skipNssForOrientation && nssInput.replace(/\D/g, '').length === 11;
    const newLead = createLeadFromPrequalification(
      leadPayload,
      isProvidingNss ? nssInput.replace(/\D/g, '') : undefined
    );

    setCreatedLead(newLead);
    setIsSubmitted(true);
  };

  const resetFormAndClose = () => {
    setIsSubmitted(false);
    setCreatedLead(null);
    setStep(1);
    setNssInput('');
    setSkipNssForOrientation(false);
    onClose();
  };

  const totalSteps = requiresNssStep ? 4 : 3;
  const currentStepForProgress = !requiresNssStep && step === 4 ? 3 : step;
  const progressPercent = Math.round((currentStepForProgress / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-[var(--color-surface)] rounded-xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--color-border)] p-5 sm:p-8 text-[var(--color-text)] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        {/* Botón de cerrar */}
        <button
          onClick={resetFormAndClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center justify-center transition cursor-pointer z-20"
          aria-label="Cerrar formulario"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PANTALLA DE CONFIRMACIÓN */}
        {isSubmitted && createdLead ? (
          <div className="py-3 text-center space-y-5">
            <div className="w-14 h-14 bg-[var(--color-accent)]/15 text-[var(--color-accent)] rounded-full flex items-center justify-center mx-auto border border-[var(--color-accent)]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="label-caps text-[var(--color-text-muted)] text-[11px] tracking-wider block">
                Folio asignado: {createdLead.folio}
              </span>
              <h2 id="form-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-snug">
                Recibimos tu solicitud
              </h2>
              {/* Mensaje de confirmación exacto conforme a la especificación de negocio */}
              <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 text-xs sm:text-sm text-[var(--color-text)] text-left space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-[var(--color-navy)] dark:text-[var(--color-accent)]">
                  <Info className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                  Atención directa de tu asesor:
                </p>
                <p className="leading-relaxed text-[var(--color-text-secondary)]">
                  Tu asesor revisará la información y te contactará por <strong className="text-[var(--color-text)]">WhatsApp</strong> para confirmar la visita.
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] pt-1">
                  <em>Nota: La cita queda confirmada una vez que acuerden el horario y punto de acceso.</em>
                </p>
              </div>
            </div>

            {/* Resumen de solicitud registrada */}
            <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 text-left text-xs space-y-2">
              <p className="label-caps text-[var(--color-text-muted)] text-[10px] tracking-wider">
                Resumen de solicitud
              </p>
              <div className="grid grid-cols-2 gap-2 text-[var(--color-text-secondary)]">
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Interesado:</span>
                  <span className="font-semibold text-[var(--color-text)]">{createdLead.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Canal de confirmación:</span>
                  <span className="font-semibold text-[var(--color-text)] capitalize">
                    {createdLead.preferredChannel} • {createdLead.appointmentRequest?.timeSlot || createdLead.preferredContactTime}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Forma de compra:</span>
                  <span className="font-semibold text-[var(--color-text)] capitalize">
                    {createdLead.financingType.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Estado de registro NSS:</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {createdLead.attributionStatus === 'pendiente_inmobiliaria'
                      ? 'NSS recibido en web (Pendiente de registro en inmobiliaria)'
                      : createdLead.attributionStatus === 'pendiente_nss'
                      ? 'Pendiente de orientación previa'
                      : 'No aplica para este esquema'}
                  </span>
                </div>
                {createdLead.appointmentRequest && (
                  <div className="col-span-2 pt-1.5 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)] block text-[10px]">Visita solicitada:</span>
                    <span className="font-semibold text-[var(--color-text)]">
                      Fecha propuesta: {createdLead.appointmentRequest.preferredDate} ({createdLead.appointmentRequest.timeSlot})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Principal de WhatsApp Inmediato */}
            {(() => {
              const financingLabel = createdLead.financingType === 'infonavit'
                ? 'Crédito Infonavit'
                : createdLead.financingType === 'bancario'
                ? 'Crédito Hipotecario Bancario'
                : createdLead.financingType === 'contado'
                ? 'Recursos Propios / Contado'
                : 'Orientación personalizada';

              const visitDetails = createdLead.appointmentRequest
                ? `\u2022 *Visita propuesta:* ${createdLead.appointmentRequest.preferredDate} (${createdLead.appointmentRequest.timeSlot})\n`
                : '';

              const waMessage = encodeURIComponent(
                `¡Hola! Acabo de registrar mi solicitud para conocer el *Modelo Águila Premier* en *Valle de los Encinos*.\n\n` +
                `\u2022 *Folio de solicitud:* ${createdLead.folio}\n` +
                `\u2022 *Nombre:* ${createdLead.fullName}\n` +
                `\u2022 *Celular:* ${createdLead.phone}\n` +
                `\u2022 *Forma de compra:* ${financingLabel}\n` +
                visitDetails +
                `\n¿Podrían confirmarme la disponibilidad para recibirme en la casa muestra? ¡Muchas gracias!`
              );

              const directWaUrl = `https://wa.me/${COMMERCIAL_CONFIG.contactChannels.whatsapp}?text=${waMessage}`;

              return (
                <div className="space-y-3 pt-2">
                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 px-4 rounded text-sm sm:text-base transition flex items-center justify-center gap-2.5 shadow cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Enviar solicitud por WhatsApp a mi asesor</span>
                  </a>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Tu mensaje se abrirá con el folio y tus datos para acordar la visita de inmediato.
                  </p>
                </div>
              );
            })()}

            {/* Enlace al panel y botón de cerrar */}
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <a
                href="/panel"
                className="w-full bg-[var(--color-navy)] hover:bg-[var(--color-navy-light)] text-white font-medium py-2.5 px-4 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Ver seguimiento de atribución en el Panel del Asesor (Demo)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              </a>
              <button
                onClick={resetFormAndClose}
                className="w-full bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium py-2 px-4 rounded text-xs transition cursor-pointer"
              >
                Cerrar y volver a la página principal
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO POR PASOS */
          <div className="space-y-6">
            {/* Header con progreso - pr-12 para evitar cualquier solapamiento con la X */}
            <div className="pr-12">
              <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)] mb-2">
                <span className="label-caps text-[10px]">
                  Paso {currentStepForProgress} de {totalSteps}
                </span>
                <span className="font-serif font-bold text-[var(--color-accent)] text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-surface-alt)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* PASO 1: QUÉ BUSCA (Zona, Propiedad, Presupuesto, Forma de compra, Plazo) */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <span className="label-caps text-[var(--color-accent)] text-[10px] block mb-1">
                    Preferencia inicial
                  </span>
                  <h2 id="form-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-tight">
                    ¿Qué buscas y cómo planeas comprar?
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Comparte tus preferencias para coordinar opciones acordes a tus planes.
                  </p>
                </div>

                {/* Zona o Propiedad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Ubicación y Fraccionamiento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    >
                      <option value="Salinas Victoria, N.L. (Valle de los Encinos)">Salinas Victoria, N.L. (Valle de los Encinos)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Modelo seleccionado
                    </label>
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    >
                      {PROPERTIES_DATA.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.model} - {p.priceFormatted}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Forma de compra */}
                <div className="space-y-1.5">
                  <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                    Forma de compra prevista <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'infonavit', label: 'Crédito Infonavit' },
                      { id: 'bancario', label: 'Crédito Hipotecario Bancario' },
                      { id: 'contado', label: 'Recursos Propios / Contado' },
                      { id: 'necesita_orientacion', label: 'Necesito orientación' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFinancingType(f.id as FinancingType);
                          if (f.id === 'necesita_orientacion') {
                            setNeedsOrientation(true);
                          } else {
                            setNeedsOrientation(false);
                          }
                        }}
                        className={`p-2.5 rounded text-xs border text-left transition cursor-pointer ${
                          financingType === f.id
                            ? 'bg-[var(--color-surface-alt)] border-[var(--color-navy)] dark:border-[var(--color-accent)] text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {errors.financingType && (
                    <p className="text-[11px] text-red-600">{errors.financingType}</p>
                  )}
                </div>

                {/* Presupuesto */}
                <div className="space-y-1">
                  <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                    Rango de presupuesto aproximado
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'hasta_1.2m', label: 'Hasta $1.2M MXN' },
                      { id: '1.2m_a_1.6m', label: '$1.2M a $1.6M MXN' },
                      { id: '1.6m_a_2.2m', label: '$1.6M a $2.2M MXN' },
                      { id: 'mas_de_2.2m', label: 'Más de $2.2M MXN' },
                      { id: 'aun_no_lo_se', label: 'Aún no lo sé' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBudgetRange(b.id as BudgetRange)}
                        className={`p-2 rounded text-xs border text-center transition cursor-pointer ${
                          budgetRange === b.id
                            ? 'bg-[var(--color-surface-alt)] border-[var(--color-navy)] dark:border-[var(--color-accent)] text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plazo aproximado */}
                <div className="space-y-1">
                  <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                    Plazo aproximado de compra
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'inmediato', label: '< 30 días' },
                      { id: 'corto', label: '1 a 3 meses' },
                      { id: 'medio', label: '3 a 6 meses' },
                      { id: 'explorando', label: 'Explorando' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPurchaseTimeline(t.id as PurchaseTimeline)}
                        className={`py-2 px-2 rounded text-xs border text-center transition cursor-pointer ${
                          purchaseTimeline === t.id
                            ? 'bg-[var(--color-surface-alt)] border-[var(--color-navy)] dark:border-[var(--color-accent)] text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: DATOS DE CONTACTO */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="label-caps text-[var(--color-accent)] text-[10px] block mb-1">
                    Contacto directo
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-tight">
                    Datos para coordinar tu atención
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Utilizaremos estos datos para atender tu solicitud y confirmar tu cita directamente por WhatsApp.
                  </p>
                </div>

                {/* Nombre */}
                <div className="space-y-1">
                  <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                    Nombre y Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Alejandro Morales"
                    className={`w-full px-3.5 py-2.5 rounded border text-sm bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50/10' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600 dark:text-red-400">{errors.fullName}</p>}
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                    Teléfono Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 dígitos (Ej. 5512345678)"
                    className={`w-full px-3.5 py-2.5 rounded border text-sm bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50/10' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>

                {/* Canal de confirmación y Correo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Canal de confirmación
                    </label>
                    <select
                      value={preferredChannel}
                      onChange={(e) => setPreferredChannel(e.target.value as ContactChannel)}
                      className="w-full px-3 py-2.5 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    >
                      <option value="whatsapp">Mensaje por WhatsApp (Recomendado)</option>
                      <option value="llamada">Llamada telefónica</option>
                      <option value="correo">Correo electrónico</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Correo Electrónico <span className="text-[var(--color-text-muted)] font-normal normal-case">(Opcional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Consentimientos */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={privacyConsentAccepted}
                      onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-navy)] focus:ring-[var(--color-accent)]"
                    />
                    <span>
                      Autorizo el tratamiento de mis datos para atender esta solicitud conforme al{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacyNotice}
                        className="underline text-[var(--color-accent)] font-semibold inline hover:text-[var(--color-accent-hover)] cursor-pointer"
                      >
                        Aviso de Privacidad
                      </button>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.privacy && <p className="text-[11px] text-red-600 dark:text-red-400 pl-6">{errors.privacy}</p>}

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--color-text-muted)]">
                    <input
                      type="checkbox"
                      checked={marketingConsentAccepted}
                      onChange={(e) => setMarketingConsentAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-navy)] focus:ring-[var(--color-accent)]"
                    />
                    <span>
                      (Opcional) Acepto recibir novedades sobre nuevos modelos o promociones futuras.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* PASO 3: REGISTRO INTERNO CON NSS */}
            {step === 3 && requiresNssStep && (
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-[var(--color-surface-alt)] text-[var(--color-accent)] mb-1.5 border border-[var(--color-border)]">
                    <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>Registro interno de atención (Infonavit)</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-tight">
                    Registro de atención con tu asesor
                  </h2>
                </div>

                {/* TEXTO EXACTO PROPUESTO PARA LA FINALIDAD DEL NSS */}
                <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 text-xs text-[var(--color-text-secondary)] space-y-2">
                  <p className="leading-relaxed font-medium text-[var(--color-text)]">
                    Utilizaremos tu NSS para solicitar tu registro en el sistema interno de{' '}
                    <strong>{COMMERCIAL_CONFIG.agencyName}</strong> y asignar a{' '}
                    <strong>{COMMERCIAL_CONFIG.advisorName}</strong> la atribución comercial de tu atención durante 15 días, conforme a sus reglas.
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    Este registro se utiliza para la asignación interna de comisión; <strong>no inicia un trámite ni una consulta de crédito y no te obliga a comprar</strong>.
                  </p>
                </div>

                {!skipNssForOrientation ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                        Número de Seguridad Social (NSS - 11 dígitos)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        value={nssInput}
                        onChange={(e) => setNssInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej. 02894711823 (11 dígitos)"
                        className={`w-full px-4 py-3 rounded border text-base tracking-widest font-mono font-semibold focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none ${
                          errors.nss ? 'border-red-500 bg-red-50/10' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                        }`}
                      />
                      <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span>Conserva ceros iniciales como texto</span>
                        <span className={nssInput.length === 11 ? 'text-[var(--color-accent)] font-bold' : ''}>
                          {nssInput.length} / 11 dígitos
                        </span>
                      </div>
                      {errors.nss && <p className="text-[11px] text-red-600 dark:text-red-400">{errors.nss}</p>}
                    </div>

                    {/* Alternativa visible obligatoria: Orientación previa */}
                    <div className="pt-2 text-center border-t border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={() => {
                          setSkipNssForOrientation(true);
                          setErrors({});
                        }}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] underline font-medium cursor-pointer"
                      >
                        Prefiero recibir orientación antes de registrarme &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 text-center space-y-2">
                    <p className="text-xs font-bold text-[var(--color-text)]">
                      Has elegido recibir orientación antes de registrarte
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Tu solicitud se registrará como pendiente de orientación. El asesor te contactará para resolver tus dudas sin registrar aún tu NSS en la inmobiliaria.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSkipNssForOrientation(false)}
                      className="text-xs text-[var(--color-accent)] font-semibold underline cursor-pointer"
                    >
                      Deseo ingresar mi NSS para el registro de atención
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PASO 4: PREFERENCIA DE VISITA */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="label-caps text-[var(--color-accent)] text-[10px] block mb-1">
                    Agenda preliminar
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-tight">
                    Paso {requiresNssStep ? '4' : '3'}: Preferencia de Visita
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    El asesor revisará la disponibilidad y te contactará por WhatsApp para confirmar la visita.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Modalidad */}
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Modalidad de visita
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAppointmentModality('presencial')}
                        className={`p-3 rounded text-xs font-medium border text-center transition cursor-pointer ${
                          appointmentModality === 'presencial'
                            ? 'bg-[var(--color-surface-alt)] border-[var(--color-navy)] dark:border-[var(--color-accent)] text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        🏡 Recorrido en Casa Muestra
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppointmentModality('virtual')}
                        className={`p-3 rounded text-xs font-medium border text-center transition cursor-pointer ${
                          appointmentModality === 'virtual'
                            ? 'bg-[var(--color-surface-alt)] border-[var(--color-navy)] dark:border-[var(--color-accent)] text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        💻 Asesoría Virtual por Video
                      </button>
                    </div>
                  </div>

                  {/* Día preferido */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                        Día tentativo preferido <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-[var(--color-text-muted)]">Acceso rápido:</span>
                    </div>

                    {/* Chips de 1 solo click */}
                    <div className="flex gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => setPreferredDate(getTomorrowDateStr())}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition cursor-pointer ${
                          preferredDate === getTomorrowDateStr()
                            ? 'bg-[var(--color-accent)] text-[var(--color-navy)] font-semibold border-[var(--color-accent)]'
                            : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        ⚡ Mañana
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPreferredDate(getUpcomingWeekendStr());
                          setTimeSlot('sabado_manana');
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition cursor-pointer ${
                          preferredDate === getUpcomingWeekendStr()
                            ? 'bg-[var(--color-accent)] text-[var(--color-navy)] font-semibold border-[var(--color-accent)]'
                            : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
                        }`}
                      >
                        📅 Próximo Fin de Semana
                      </button>
                    </div>

                    <input
                      type="date"
                      value={preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded border text-sm bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none ${
                        errors.preferredDate ? 'border-red-500 bg-red-50/10' : 'border-[var(--color-border)]'
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="text-[11px] text-red-600 dark:text-red-400">{errors.preferredDate}</p>
                    )}
                  </div>

                  {/* Franja horaria */}
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Franja horaria estimada
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value as '10:00 - 13:00' | '14:00 - 17:00' | '17:00 - 19:00' | 'sabado_manana')}
                      className="w-full px-3.5 py-2.5 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    >
                      <option value="10:00 - 13:00">Por la mañana (10:00 AM - 1:00 PM)</option>
                      <option value="14:00 - 17:00">Por la tarde (2:00 PM - 5:00 PM)</option>
                      <option value="17:00 - 19:00">Al atardecer (5:00 PM - 7:00 PM)</option>
                      <option value="sabado_manana">Fin de semana por la mañana</option>
                    </select>
                  </div>

                  {/* Comentarios */}
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--color-text-secondary)] text-[10px] block">
                      Comentarios adicionales <span className="text-[var(--color-text-muted)] font-normal normal-case">(Opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      placeholder="Ej. Asistiré acompañado; busco orientación sobre transporte público."
                      className="w-full px-3.5 py-2 rounded border border-[var(--color-border)] text-xs bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Aclaración */}
                  <div className="bg-[var(--color-surface-alt)] rounded-lg p-3 text-[11px] text-[var(--color-text-secondary)] leading-relaxed border border-[var(--color-border)]">
                    <strong className="text-[var(--color-text)]">Importante:</strong> Esta solicitud no representa un bloqueo definitivo. Tu asesor revisará la agenda y se comunicará contigo vía WhatsApp para confirmar los detalles.
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-2.5 px-6 rounded text-sm transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{step === 4 ? 'Enviar Solicitud' : 'Continuar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
