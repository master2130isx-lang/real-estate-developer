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
  const [preferredContactTime, setPreferredContactTime] = useState<PreferredContactTime>('tarde');
  const [privacyConsentAccepted, setPrivacyConsentAccepted] = useState<boolean>(true);
  const [marketingConsentAccepted, setMarketingConsentAccepted] = useState<boolean>(false);

  // Paso 3: Registro interno con NSS
  const [nssInput, setNssInput] = useState<string>('');
  const [skipNssForOrientation, setSkipNssForOrientation] = useState<boolean>(false);

  // Paso 4: Preferencia de visita
  const [appointmentModality, setAppointmentModality] = useState<'presencial' | 'virtual'>('presencial');
  const [preferredDate, setPreferredDate] = useState<string>('');
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

    const leadPayload: Partial<Lead> = {
      fullName: fullName.trim(),
      phone: phone.replace(/\D/g, ''),
      email: email.trim() || undefined,
      preferredChannel,
      preferredContactTime,
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
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        {/* Botón de cerrar */}
        <button
          onClick={resetFormAndClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
          aria-label="Cerrar formulario"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PANTALLA DE CONFIRMACIÓN */}
        {isSubmitted && createdLead ? (
          <div className="py-3 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Folio asignado: {createdLead.folio}
              </span>
              <h2 id="form-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                Recibimos tu solicitud
              </h2>
              {/* Mensaje de confirmación exacto conforme a la especificación de negocio */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm text-blue-950 text-left space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  Atención directa de tu asesor:
                </p>
                <p className="leading-relaxed">
                  Tu asesor revisará la información y te contactará por <strong>WhatsApp</strong> para confirmar la visita.
                </p>
                <p className="text-[11px] text-blue-800 pt-1">
                  <em>Nota: La cita queda confirmada una vez que acuerden el horario y punto de acceso.</em>
                </p>
              </div>
            </div>

            {/* Resumen de solicitud registrada */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Resumen de solicitud:
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Interesado:</span>
                  <span className="font-semibold text-slate-900">{createdLead.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Canal de confirmación:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {createdLead.preferredChannel} ({createdLead.preferredContactTime})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Forma de compra:</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {createdLead.financingType.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estado de registro NSS:</span>
                  <span className="font-semibold text-slate-900">
                    {createdLead.attributionStatus === 'pendiente_inmobiliaria'
                      ? 'NSS recibido en web (Pendiente de registro en inmobiliaria)'
                      : createdLead.attributionStatus === 'pendiente_nss'
                      ? 'Pendiente de orientación previa'
                      : 'No aplica para este esquema'}
                  </span>
                </div>
                {createdLead.appointmentRequest && (
                  <div className="col-span-2 pt-1.5 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Visita solicitada:</span>
                    <span className="font-semibold text-slate-900">
                      Fecha propuesta: {createdLead.appointmentRequest.preferredDate} ({createdLead.appointmentRequest.timeSlot})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enlace al panel en modo demostración */}
            <div className="space-y-2 pt-2">
              <a
                href="/panel"
                className="w-full bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <span>Ver seguimiento de atribución en el Panel del Asesor (Demo)</span>
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </a>
              <button
                onClick={resetFormAndClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Cerrar y volver a la página principal
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO POR PASOS */
          <div className="space-y-6">
            {/* Header con progreso */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                <span>
                  Paso {currentStepForProgress} de {totalSteps}
                </span>
                <span className="text-amber-600 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0d233a] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* PASO 1: QUÉ BUSCA (Zona, Propiedad, Presupuesto, Forma de compra, Plazo) */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 id="form-modal-title" className="text-xl font-extrabold text-slate-900">
                    Paso 1: ¿Qué buscas y cómo planeas comprar?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Comparte tus preferencias para coordinar opciones acordes a tus planes.
                  </p>
                </div>

                {/* Zona o Propiedad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Zona de interés <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                    >
                      <option value="Salinas Victoria, N.L. (Valle de los Encinos)">Salinas Victoria, N.L. (Valle de los Encinos)</option>
                      <option value="Poniente - Corredor Valle Real (Demostración)">Poniente - Corredor Valle Real</option>
                      <option value="Norte - Zona Corporativa (Demostración)">Norte - Zona Corporativa</option>
                      <option value="Sur - Eje Industrial (Demostración)">Sur - Eje Industrial</option>
                      <option value="Sin preferencia fija / Explorando opciones">Sin preferencia fija aún</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Propiedad específica (Opcional)
                    </label>
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                    >
                      <option value="">Aún no elijo modelo (Atención general)</option>
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
                  <label className="block text-xs font-bold text-slate-800">
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
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition cursor-pointer ${
                          financingType === f.id
                            ? 'bg-[#0d233a] text-white border-[#0d233a]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                  <label className="block text-xs font-bold text-slate-800">
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
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                          budgetRange === b.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plazo aproximado */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
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
                        className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                          purchaseTimeline === t.id
                            ? 'bg-slate-800 text-white font-bold border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Paso 2: Datos para coordinar tu atención
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Utilizaremos estos datos para atender tu solicitud y confirmar la visita directamente por WhatsApp cuando elijas este medio.
                  </p>
                </div>

                {/* Nombre */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Nombre y Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Alejandro Morales"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[#0d233a] focus:outline-none ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600">{errors.fullName}</p>}
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Teléfono Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 dígitos (Ej. 5512345678)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-[#0d233a] focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600">{errors.phone}</p>}
                </div>

                {/* Horario preferido de contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">Canal de confirmación</label>
                    <select
                      value={preferredChannel}
                      onChange={(e) => setPreferredChannel(e.target.value as ContactChannel)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="whatsapp">Mensaje por WhatsApp (Recomendado)</option>
                      <option value="llamada">Llamada telefónica</option>
                      <option value="correo">Correo electrónico</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">Horario preferido</label>
                    <select
                      value={preferredContactTime}
                      onChange={(e) => setPreferredContactTime(e.target.value as PreferredContactTime)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="manana">Por la mañana (9:00 - 13:00)</option>
                      <option value="tarde">Por la tarde (13:00 - 18:00)</option>
                      <option value="noche">Por la noche (18:00 - 20:00)</option>
                    </select>
                  </div>
                </div>

                {/* Correo Opcional */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                {/* Consentimientos */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={privacyConsentAccepted}
                      onChange={(e) => setPrivacyConsentAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0d233a] focus:ring-[#0d233a]"
                    />
                    <span>
                      Autorizo el tratamiento de mis datos para atender esta solicitud conforme al{' '}
                      <button
                        type="button"
                        onClick={onOpenPrivacyNotice}
                        className="underline text-[#0d233a] font-bold inline hover:text-amber-600"
                      >
                        Aviso de Privacidad
                      </button>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.privacy && <p className="text-[11px] text-red-600 pl-6">{errors.privacy}</p>}

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={marketingConsentAccepted}
                      onChange={(e) => setMarketingConsentAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0d233a] focus:ring-[#0d233a]"
                    />
                    <span>
                      (Opcional) Acepto recibir novedades sobre nuevos modelos o promociones futuras.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* PASO 3: REGISTRO INTERNO CON NSS (Regla Centralizada) */}
            {step === 3 && requiresNssStep && (
              <div className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                    <span>Registro interno de atención (Infonavit)</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Registro de atención con tu asesor
                  </h2>
                </div>

                {/* TEXTO EXACTO PROPUESTO PARA LA FINALIDAD DEL NSS */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed font-medium text-slate-800">
                    Utilizaremos tu NSS para solicitar tu registro en el sistema interno de{' '}
                    <strong>{COMMERCIAL_CONFIG.agencyName}</strong> y asignar a{' '}
                    <strong>{COMMERCIAL_CONFIG.advisorName}</strong> la atribución comercial de tu atención durante 15 días, conforme a sus reglas.
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Este registro se utiliza para la asignación interna de comisión; <strong>no inicia un trámite ni una consulta de crédito y no te obliga a comprar</strong>.
                  </p>
                </div>

                {!skipNssForOrientation ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Número de Seguridad Social (NSS - 11 dígitos)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        value={nssInput}
                        onChange={(e) => setNssInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ej. 02894711823 (11 dígitos)"
                        className={`w-full px-4 py-3 rounded-xl border text-base tracking-widest font-mono font-semibold focus:ring-2 focus:ring-[#0d233a] focus:outline-none ${
                          errors.nss ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      />
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Conserva ceros iniciales como texto</span>
                        <span className={nssInput.length === 11 ? 'text-emerald-600 font-bold' : ''}>
                          {nssInput.length} / 11 dígitos
                        </span>
                      </div>
                      {errors.nss && <p className="text-[11px] text-red-600">{errors.nss}</p>}
                    </div>

                    {/* Alternativa visible obligatoria: Orientación previa */}
                    <div className="pt-2 text-center border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setSkipNssForOrientation(true);
                          setErrors({});
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                      >
                        Prefiero recibir orientación antes de registrarme &rarr;
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
                    <p className="text-xs font-bold text-amber-950">
                      Has elegido recibir orientación antes de registrarte
                    </p>
                    <p className="text-xs text-amber-800">
                      Tu solicitud se registrará como pendiente de orientación. El asesor te contactará para resolver tus dudas sin registrar aún tu NSS en la inmobiliaria.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSkipNssForOrientation(false)}
                      className="text-xs text-[#0d233a] font-bold underline cursor-pointer"
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
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Paso {requiresNssStep ? '4' : '3'}: Preferencia de Visita
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    El asesor revisará la agenda y te contactará por WhatsApp para confirmar la visita.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Modalidad */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">Modalidad de visita</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAppointmentModality('presencial')}
                        className={`p-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                          appointmentModality === 'presencial'
                            ? 'bg-[#0d233a] text-white border-[#0d233a]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        🏡 Recorrido en Casa Muestra
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppointmentModality('virtual')}
                        className={`p-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                          appointmentModality === 'virtual'
                            ? 'bg-[#0d233a] text-white border-[#0d233a]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        💻 Asesoría Virtual por Video
                      </button>
                    </div>
                  </div>

                  {/* Día preferido */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Día tentativo preferido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none ${
                        errors.preferredDate ? 'border-red-500 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {errors.preferredDate && (
                      <p className="text-[11px] text-red-600">{errors.preferredDate}</p>
                    )}
                  </div>

                  {/* Franja horaria */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">Franja horaria estimada</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value as '10:00 - 13:00' | '14:00 - 17:00' | '17:00 - 19:00' | 'sabado_manana')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="10:00 - 13:00">Por la mañana (10:00 AM - 1:00 PM)</option>
                      <option value="14:00 - 17:00">Por la tarde (2:00 PM - 5:00 PM)</option>
                      <option value="17:00 - 19:00">Al atardecer (5:00 PM - 7:00 PM)</option>
                      <option value="sabado_manana">Fin de semana por la mañana</option>
                    </select>
                  </div>

                  {/* Comentarios */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Comentarios adicionales (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      placeholder="Ej. Asistiré acompañado; busco orientación sobre transporte público."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Aclaración obligatoria */}
                  <div className="bg-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
                    <strong>Importante:</strong> Esta solicitud no representa una cita confirmada ni un bloqueo definitivo. Tu asesor revisará la agenda y se comunicará contigo vía WhatsApp para confirmar los detalles.
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
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
                className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow flex items-center gap-2 cursor-pointer"
              >
                <span>{step === 4 ? 'Enviar Solicitud' : 'Continuar'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
