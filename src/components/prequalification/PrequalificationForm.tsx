'use client';

import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Property, FinancingType, ContactChannel, Lead } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const getTomorrowDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

interface PrequalificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProperty?: Property | null;
  onOpenPrivacyNotice: () => void;
}

const AVAILABLE_HOURS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];

export function PrequalificationForm({
  isOpen,
  onClose,
  preselectedProperty,
  onOpenPrivacyNotice,
}: PrequalificationFormProps) {
  const { properties: appProperties, commercialConfig, createLeadFromPrequalification, logFunnelEvent } = useApp();
  const availableProperties = appProperties && appProperties.length > 0 ? appProperties : PROPERTIES_DATA;

  // 3 Pasos definidos
  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);

  // Paso 1: Modelo y Crédito
  const [propertyId, setPropertyId] = useState<string>(() => preselectedProperty?.id || availableProperties[0]?.id || 'prop-aguila-premier');
  const [financingType, setFinancingType] = useState<FinancingType>('infonavit');

  // Paso 2: Datos de Contacto y Validación Crediticia (NSS o CURP)
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [preferredChannel, setPreferredChannel] = useState<ContactChannel>('whatsapp');
  const [nssInput, setNssInput] = useState<string>('');
  const [curpInput, setCurpInput] = useState<string>('');
  const [skipIdentifierForOrientation, setSkipIdentifierForOrientation] = useState<boolean>(false);
  const [privacyConsentAccepted, setPrivacyConsentAccepted] = useState<boolean>(true);
  const [marketingConsentAccepted, setMarketingConsentAccepted] = useState<boolean>(false);

  // Paso 3: Agenda de Visita (Fecha directa y Hora exacta)
  const [preferredDate, setPreferredDate] = useState<string>(getTomorrowDateStr());
  const [exactTime, setExactTime] = useState<string>('11:00 AM');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const requiresNss = financingType === 'infonavit';
  const requiresCurp = financingType === 'fovissste';

  // Validaciones paso por paso
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!financingType) errs.financingType = 'Selecciona una forma de compra';
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

    // Validación de NSS si eligió Infonavit y no pidió orientación previa
    if (requiresNss && !skipIdentifierForOrientation) {
      const cleanNss = nssInput.replace(/\D/g, '');
      if (cleanNss.length !== 11) {
        errs.nss = 'El NSS consta de exactamente 11 dígitos numéricos';
      }
    }

    // Validación de CURP si eligió ISSSTE y no pidió orientación previa
    if (requiresCurp && !skipIdentifierForOrientation) {
      const cleanCurp = curpInput.trim().toUpperCase();
      if (cleanCurp.length !== 18) {
        errs.curp = 'La CURP consta de 18 caracteres alfanuméricos';
      }
    }

    if (!privacyConsentAccepted) {
      errs.privacy = 'Es necesario aceptar el Aviso de Privacidad para atender tu solicitud';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!preferredDate) {
      errs.preferredDate = 'Por favor selecciona la fecha de tu visita';
    }
    if (!exactTime) {
      errs.exactTime = 'Por favor selecciona la hora de tu visita';
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
        setStep(3);
      }
    } else if (step === 3) {
      if (validateStep3()) {
        handleSubmitForm();
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitForm = () => {
    const selectedProp = availableProperties.find((p) => p.id === propertyId) || availableProperties[0];

    const isProvidingNss = requiresNss && !skipIdentifierForOrientation && nssInput.replace(/\D/g, '').length === 11;
    const isProvidingCurp = requiresCurp && !skipIdentifierForOrientation && curpInput.trim().length === 18;

    const leadPayload: Partial<Lead> = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      preferredChannel,
      preferredContactTime: 'tarde',
      interestedZone: commercialConfig.coverageZone || 'Salinas Victoria, N.L. (Valle de los Encinos)',
      selectedPropertyId: selectedProp?.id,
      selectedPropertyTitle: selectedProp ? `${selectedProp.model} (${selectedProp.priceFormatted})` : undefined,
      budgetRange: '1.2m_a_1.6m',
      purchaseTimeline: 'corto',
      financingType,
      curpValue: isProvidingCurp ? curpInput.trim().toUpperCase() : undefined,
      needsOrientation: skipIdentifierForOrientation,
      privacyConsentAccepted: true,
      marketingConsentAccepted,
      appointmentRequest: {
        modality: 'presencial',
        preferredDate: preferredDate || getTomorrowDateStr(),
        timeSlot: exactTime,
        notes: appointmentNotes.trim() || undefined,
        status: 'solicitada',
      },
    };

    const newLead = createLeadFromPrequalification(
      leadPayload,
      isProvidingNss ? nssInput.replace(/\D/g, '') : undefined,
      isProvidingCurp ? curpInput.trim().toUpperCase() : undefined
    );

    setCreatedLead(newLead);
    setIsSubmitted(true);
  };

  const resetFormAndClose = () => {
    setIsSubmitted(false);
    setCreatedLead(null);
    setStep(1);
    setNssInput('');
    setCurpInput('');
    setSkipIdentifierForOrientation(false);
    onClose();
  };

  const totalSteps = 3;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-[var(--color-surface)] rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--color-border)] p-5 sm:p-8 text-[var(--color-text)] transition-colors"
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
            <div className="w-14 h-14 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="label-caps text-[var(--color-text-muted)] text-[11px] tracking-wider block font-mono">
                Folio: {createdLead.folio}
              </span>
              <h2 id="form-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-snug">
                ¡Solicitud Registrada con Éxito!
              </h2>
              <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl p-4 text-xs sm:text-sm text-[var(--color-text)] text-left space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-[var(--color-navy)] dark:text-[var(--color-accent)]">
                  <Info className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                  Atención directa de tu asesor {commercialConfig.advisorName}:
                </p>
                <p className="leading-relaxed text-[var(--color-text-secondary)]">
                  Tu solicitud ha sido recibida. Tu asesor te contactará por <strong className="text-[var(--color-text)]">WhatsApp</strong> para recibirte en la caseta de acceso.
                </p>
              </div>
            </div>

            {/* Resumen de cita */}
            <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl p-4 text-left text-xs space-y-2">
              <p className="label-caps text-[var(--color-text-muted)] text-[10px] tracking-wider">
                Detalles de tu Visita
              </p>
              <div className="grid grid-cols-2 gap-2 text-[var(--color-text-secondary)]">
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Interesado:</span>
                  <span className="font-semibold text-[var(--color-text)]">{createdLead.fullName}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Teléfono:</span>
                  <span className="font-semibold text-[var(--color-text)]">{createdLead.phone}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Forma de compra:</span>
                  <span className="font-semibold text-[var(--color-text)] capitalize">
                    {createdLead.financingType.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Cita Agendada:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {createdLead.appointmentRequest?.preferredDate} a las {createdLead.appointmentRequest?.timeSlot}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de WhatsApp directo */}
            {(() => {
              const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');
              const waMessage = encodeURIComponent(
                `¡Hola! Acabo de registrar mi solicitud de cita para conocer las casas muestra en ${commercialConfig.agencyName}.\n\n` +
                `• *Folio:* ${createdLead.folio}\n` +
                `• *Nombre:* ${createdLead.fullName}\n` +
                `• *Fecha y hora de visita:* ${createdLead.appointmentRequest?.preferredDate} a las ${createdLead.appointmentRequest?.timeSlot}\n\n` +
                `¿Me podrían compartir la ubicación exacta por GPS para llegar a la caseta? ¡Muchas gracias!`
              );

              const directWaUrl = `https://wa.me/${cleanWa}?text=${waMessage}`;

              return (
                <div className="space-y-3 pt-2">
                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#128C7E] hover:bg-[#0d6b60] text-white font-bold py-3.5 px-4 rounded-xl text-sm sm:text-base transition flex items-center justify-center gap-2.5 shadow cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Confirmar Cita por WhatsApp con mi Asesor</span>
                  </a>
                </div>
              );
            })()}

            <div className="pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={resetFormAndClose}
                className="w-full bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-semibold py-3 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                Cerrar y volver a la página principal
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO EN 3 PASOS */
          <div className="space-y-6">
            {/* Header con indicador de 3 pasos */}
            <div className="pr-12">
              <div className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300 font-medium mb-2">
                <span className="font-semibold text-xs tracking-wider uppercase">
                  Paso {step} de {totalSteps} — {step === 1 ? 'Modelo y Crédito' : step === 2 ? 'Tus Datos' : 'Fecha y Hora'}
                </span>
                <span className="font-serif font-bold text-[var(--color-accent)] text-base">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* PASO 1: MODELO Y FORMA DE COMPRA */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-1">
                    Paso 1 de 3
                  </span>
                  <h2 id="form-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    ¿Qué modelo te interesa y cómo planeas adquirirlo?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Selecciona tu modelo favorito y el esquema de crédito con el que te gustaría comprar.
                  </p>
                </div>

                {/* Selector de Modelo */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Modelo de Vivienda en {commercialConfig.agencyName}
                  </label>
                  <select
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white font-medium focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
                  >
                    {availableProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.model} — {p.priceFormatted} ({p.bedrooms} Recámaras, {p.bathrooms} Baños)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Forma de Compra */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Forma de adquisición o tipo de crédito <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'infonavit', label: 'Crédito Infonavit', desc: 'Tradicional, Total o Segundo Crédito' },
                      { id: 'fovissste', label: 'ISSSTE', desc: 'Para trabajadores del Estado' },
                      { id: 'bancario', label: 'Crédito Bancario', desc: 'Con cualquier banco o Cofinavit' },
                      { id: 'contado', label: 'Recursos Propios / Contado', desc: 'Liquidación directa sin financiamiento' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFinancingType(f.id as FinancingType);
                          setSkipIdentifierForOrientation(false);
                        }}
                        className={`p-3.5 rounded-xl text-left transition cursor-pointer border ${
                          financingType === f.id
                            ? 'border-2 border-[var(--color-navy)] dark:border-[var(--color-accent)] bg-slate-100 dark:bg-[#16324D] text-slate-900 dark:text-[var(--color-accent)] font-bold shadow-xs'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E2236] text-slate-800 dark:text-slate-200 hover:border-slate-400 font-medium'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold">{f.label}</p>
                        <p className="text-[11px] opacity-75 mt-0.5 font-normal">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.financingType && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.financingType}</p>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: DATOS DE CONTACTO Y PRECALIFICACIÓN (NSS / CURP) */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-1">
                    Paso 2 de 3
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    Tus Datos y Precalificación
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {requiresNss
                      ? 'Ingresa tu NSS para consultar tus puntos Infonavit y blindar tu atención con el asesor.'
                      : requiresCurp
                      ? 'Ingresa tu CURP para consultar tu crédito ISSSTE disponible.'
                      : 'Datos para comunicarnos y recibirte personalmente en la casa muestra.'}
                  </p>
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prequal_name"
                    name="name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Alejandro Morales"
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white font-medium focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none shadow-xs ${
                      errors.fullName ? 'border-red-500 bg-red-50/10' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.fullName && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.fullName}</p>}
                </div>

                {/* Teléfono / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Teléfono Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="prequal_tel"
                    name="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 dígitos (Ej. 5512345678)"
                    className={`w-full px-4 py-3 rounded-xl border text-sm sm:text-base bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white font-medium focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none shadow-xs ${
                      errors.phone ? 'border-red-500 bg-red-50/10' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.phone && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.phone}</p>}
                </div>

                {/* Correo Electrónico Opcional */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Correo Electrónico <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">(Opcional)</span>
                  </label>
                  <input
                    type="email"
                    id="prequal_email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white font-medium focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none"
                  />
                </div>

                {/* BLOQUE DINÁMICO SEGÚN CRÉDITO: INFONAVIT (NSS) */}
                {requiresNss && (
                  <div className="bg-slate-100 dark:bg-[#0E2236] border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>Número de Seguridad Social (NSS)</span>
                    </div>

                    {!skipIdentifierForOrientation ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={11}
                          value={nssInput}
                          onChange={(e) => setNssInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="11 dígitos numéricos"
                          className={`w-full px-4 py-3 rounded-xl border-2 text-base sm:text-lg font-mono tracking-widest font-bold focus:border-[var(--color-accent)] focus:outline-none ${
                            errors.nss
                              ? 'border-red-500 bg-red-50/10'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white'
                          }`}
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Conserva ceros iniciales</span>
                          <span className={nssInput.length === 11 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                            {nssInput.length} / 11 dígitos
                          </span>
                        </div>
                        {errors.nss && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.nss}</p>}

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          🛡️ Tu NSS no inicia ningún trámite sin tu consentimiento ni te compromete a comprar. Garantiza la atención personalizada de tu asesor durante 15 días.
                        </p>

                        <button
                          type="button"
                          onClick={() => setSkipIdentifierForOrientation(true)}
                          className="text-xs text-[var(--color-navy)] dark:text-[var(--color-accent)] underline font-semibold block pt-1 cursor-pointer"
                        >
                          ¿No lo tienes a la mano? Solicitar orientación previa &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">Has elegido orientación previa sin NSS.</p>
                        <p>Tu asesor te apoyará a consultarlo directamente durante la asesoría.</p>
                        <button
                          type="button"
                          onClick={() => setSkipIdentifierForOrientation(false)}
                          className="text-xs text-[var(--color-navy)] dark:text-[var(--color-accent)] underline font-bold pt-1 cursor-pointer"
                        >
                          Prefiero ingresar mi NSS ahora
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* BLOQUE DINÁMICO SEGÚN CRÉDITO: ISSSTE (CURP) */}
                {requiresCurp && (
                  <div className="bg-slate-100 dark:bg-[#0E2236] border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Clave Única de Registro de Población (CURP)</span>
                    </div>

                    {!skipIdentifierForOrientation ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={18}
                          value={curpInput}
                          onChange={(e) => setCurpInput(e.target.value.toUpperCase())}
                          placeholder="18 caracteres alfanuméricos"
                          className={`w-full px-4 py-3 rounded-xl border-2 text-base sm:text-lg font-mono tracking-widest font-bold uppercase focus:border-[var(--color-accent)] focus:outline-none ${
                            errors.curp
                              ? 'border-red-500 bg-red-50/10'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white'
                          }`}
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Requerido para precalificación ISSSTE</span>
                          <span className={curpInput.trim().length === 18 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                            {curpInput.trim().length} / 18 caracteres
                          </span>
                        </div>
                        {errors.curp && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.curp}</p>}

                        <button
                          type="button"
                          onClick={() => setSkipIdentifierForOrientation(true)}
                          className="text-xs text-[var(--color-navy)] dark:text-[var(--color-accent)] underline font-semibold block pt-1 cursor-pointer"
                        >
                          ¿No la tienes a la mano? Solicitar orientación previa &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">Has elegido orientación previa sin CURP.</p>
                        <p>Tu asesor te ayudará a precalificar tu crédito ISSSTE directamente.</p>
                        <button
                          type="button"
                          onClick={() => setSkipIdentifierForOrientation(false)}
                          className="text-xs text-[var(--color-navy)] dark:text-[var(--color-accent)] underline font-bold pt-1 cursor-pointer"
                        >
                          Prefiero ingresar mi CURP ahora
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* NOTA PARA BANCARIO O CONTADO */}
                {!requiresNss && !requiresCurp && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Para crédito bancario o pago de contado no requieres NSS ni CURP para programar tu visita.</span>
                  </div>
                )}

                {/* Consentimiento */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={privacyConsentAccepted}
                      onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-accent)]"
                    />
                    <span>
                      Autorizo el tratamiento de mis datos para atender esta solicitud conforme al{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacyNotice}
                        className="underline text-[var(--color-navy)] dark:text-[var(--color-accent)] font-bold inline hover:opacity-80 cursor-pointer"
                      >
                        Aviso de Privacidad
                      </button>
                      . <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>
                  {errors.privacy && <p className="text-xs font-semibold text-red-600 dark:text-red-400 pl-6">{errors.privacy}</p>}
                </div>
              </div>
            )}

            {/* PASO 3: FECHA Y HORA EXACTA DE VISITA */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-1">
                    Paso 3 de 3
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    ¿Qué día y hora deseas visitar la Casa Muestra?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Contamos con personal suficiente para atenderte en el horario exacto que elijas.
                  </p>
                </div>

                {/* Selector de Fecha */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Selecciona la Fecha de tu Visita</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm sm:text-base font-semibold bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none shadow-xs ${
                      errors.preferredDate ? 'border-red-500 bg-red-50/10' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.preferredDate}</p>
                  )}
                </div>

                {/* Selector de Hora Exacta */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Hora Exacta de la Cita</span> <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => setExactTime(hour)}
                        className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold text-center transition cursor-pointer border ${
                          exactTime === hour
                            ? 'border-2 border-[var(--color-navy)] dark:border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-navy)] shadow-xs'
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E2236] text-slate-800 dark:text-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                  {errors.exactTime && (
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errors.exactTime}</p>
                  )}
                </div>

                {/* Comentarios Opcionales */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Comentarios o peticiones especiales <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">(Opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                    placeholder="Ej. Asistiré con mi familia; deseamos conocer también las amenidades del fraccionamiento."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm bg-white dark:bg-[#0B1E30] text-slate-900 dark:text-white font-medium focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:outline-none shadow-xs"
                  ></textarea>
                </div>

                <div className="bg-slate-100 dark:bg-[#0E2236] rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700">
                  <strong className="text-slate-900 dark:text-white font-bold">Punto de encuentro:</strong> Caseta principal de {commercialConfig.agencyName} ({commercialConfig.contactChannels.officeAddressNote || 'Calzada del Sol'}). Tu asesor te recibirá personalmente.
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
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
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-bold py-3.5 px-8 rounded-xl text-sm sm:text-base transition flex items-center gap-2 cursor-pointer shadow"
              >
                <span>{step === 3 ? 'Confirmar Cita y Enviar' : 'Continuar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
