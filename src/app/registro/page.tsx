'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Phone,
  User,
  Clock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { PrivacyModal } from '@/components/landing/PrivacyModal';
import { FinancingType, Lead } from '@/types';

export default function ExpressRegistrationPage() {
  const { commercialConfig, createLeadFromPrequalification, properties, logFunnelEvent } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [financingType, setFinancingType] = useState<FinancingType>('infonavit');
  const [creditIdentifier, setCreditIdentifier] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const featuredProperty = properties[0];
  const requiresNss = financingType === 'infonavit';
  const requiresCurp = financingType === 'fovissste';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Por favor escribe tu nombre completo.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Por favor ingresa un número de WhatsApp a 10 dígitos.');
      return;
    }

    if (!privacyAccepted) {
      setErrorMsg('Debes aceptar el Aviso de Privacidad para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanId = creditIdentifier.trim();
      const rawNss = requiresNss && cleanId.length === 11 ? cleanId : undefined;
      const rawCurp = requiresCurp && cleanId.length === 18 ? cleanId.toUpperCase() : undefined;

      const leadPayload: Partial<Lead> = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        preferredChannel: 'whatsapp',
        preferredContactTime: 'tarde',
        interestedZone: commercialConfig.coverageZone || 'Salinas Victoria, N.L. (Valle de los Encinos)',
        selectedPropertyId: featuredProperty?.id,
        selectedPropertyTitle: featuredProperty ? `${featuredProperty.model} (${featuredProperty.priceFormatted})` : undefined,
        budgetRange: '1.2m_a_1.6m',
        purchaseTimeline: 'corto',
        financingType,
        curpValue: rawCurp,
        privacyConsentAccepted: true,
        marketingConsentAccepted: true,
        appointmentRequest: {
          modality: 'presencial',
          preferredDate,
          timeSlot: preferredTime,
          notes: 'Registro rápido desde campaña de redes sociales (Facebook / TikTok)',
          status: 'solicitada',
        },
      };

      const newLead = createLeadFromPrequalification(leadPayload, rawNss, rawCurp);

      // Notificar al servidor y Telegram
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        });
      } catch (err) {
        console.warn('Registro guardado localmente:', err);
      }

      logFunnelEvent('paso_completado', { paso: 'express', forma_compra: financingType });
      setCreatedLead(newLead);
    } catch (err: any) {
      setErrorMsg('Ocurrió un error al enviar tu registro. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A131F] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Barra Superior Minimalista */}
      <header className="bg-[#0F2C40] text-white py-3 px-4 border-b border-[#1C3B54] sticky top-0 z-30 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Building2 className="w-4 h-4 text-[#C09B53]" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-tight text-white block leading-tight">
                {commercialConfig.agencyName}
              </span>
              <span className="text-[10px] text-slate-300 font-medium">
                {commercialConfig.coverageZone}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle className="!w-8 !h-8 !rounded-xl !bg-[#13344C] !border-[#204562] !text-slate-200" />
            <Link
              href="/"
              className="text-xs text-slate-300 hover:text-white transition font-medium hidden sm:inline"
            >
              Ver página principal &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal Flash */}
      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {createdLead ? (
          /* Pantalla de Registro Exitoso */
          <div className="bg-white dark:bg-[#0F2033] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-bold">
                Folio: {createdLead.folio}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                ¡Registro Recibido con Éxito!
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Hola <strong>{createdLead.fullName}</strong>, tu asesor <strong>{commercialConfig.advisorName}</strong> te recibirá en la caseta principal de {commercialConfig.agencyName}.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Fecha solicitada:</span>
                <strong className="text-slate-900 dark:text-white">{preferredDate} ({preferredTime})</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400">Esquema:</span>
                <strong className="text-slate-900 dark:text-white capitalize">{createdLead.financingType.replace('_', ' ')}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">WhatsApp de contacto:</span>
                <strong className="text-slate-900 dark:text-white">{createdLead.phone}</strong>
              </div>
            </div>

            {/* Botón WhatsApp de Acción Inmediata */}
            {(() => {
              const waText = encodeURIComponent(
                `¡Hola ${commercialConfig.advisorName}! Me acabo de registrar desde redes sociales para conocer la Casa Muestra en ${commercialConfig.agencyName}.\n\n` +
                `• Folio: ${createdLead.folio}\n` +
                `• Nombre: ${createdLead.fullName}\n` +
                `• Cita tentativa: ${preferredDate} a las ${preferredTime}\n\n` +
                `¿Me compartes la ubicación por GPS para llegar a la caseta? ¡Gracias!`
              );
              return (
                <div className="space-y-3 pt-2">
                  <a
                    href={`https://wa.me/${cleanWa}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-2xl text-base transition flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                  >
                    <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                    <span>Confirmar Cita por WhatsApp Ahora</span>
                  </a>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tu asesor te enviará la ubicación exacta por Google Maps y Waze.
                  </p>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline font-semibold"
              >
                Volver a la página principal
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de 1 Solo Paso */
          <div className="bg-white dark:bg-[#0F2033] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
            {/* Header del Formulario */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#C09B53]/15 text-[#9A7426] dark:text-[#E0B865] border border-[#C09B53]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visita la Casa Muestra • 1 Solo Paso</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                Agenda tu Recorrido Exclusivo
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Completa tus datos en 30 segundos. Tu navegador rellenará en automático la información guardada.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Formulario HTML con etiquetas de autocompletado estándar del navegador */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Campo Nombre Completo */}
              <div className="space-y-1">
                <label
                  htmlFor="full_name"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#C09B53]" />
                  <span>Nombre y Apellido</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="name"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Alejandro Morales"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm sm:text-base font-medium bg-slate-50 dark:bg-[#0A1726] text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0F2033] focus:border-[#C09B53] focus:ring-2 focus:ring-[#C09B53]/20 focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Campo WhatsApp / Teléfono */}
              <div className="space-y-1">
                <label
                  htmlFor="phone_number"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C09B53]" />
                  <span>Teléfono Celular / WhatsApp</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 dígitos (Ej. 5512345678)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm sm:text-base font-medium bg-slate-50 dark:bg-[#0A1726] text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#0F2033] focus:border-[#C09B53] focus:ring-2 focus:ring-[#C09B53]/20 focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Selector de Tipo de Crédito */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tipo de Crédito o Forma de Compra
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'infonavit', label: 'Infonavit' },
                    { id: 'fovissste', label: 'ISSSTE' },
                    { id: 'bancario', label: 'Bancario' },
                    { id: 'contado', label: 'Contado' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFinancingType(f.id as FinancingType)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        financingType === f.id
                          ? 'border-2 border-[#0F2C40] dark:border-[#C09B53] bg-[#0F2C40] dark:bg-[#163554] text-white shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0A1726] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo Opcional: NSS o CURP según crédito */}
              {(requiresNss || requiresCurp) && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      {requiresNss ? 'NSS (11 dígitos)' : 'CURP (18 car.)'}
                    </span>
                    <span className="text-[10px] font-normal text-amber-800/80 dark:text-amber-300/80">
                      Opcional para precalificarte
                    </span>
                  </div>
                  <input
                    type="text"
                    id="credit_id"
                    name={requiresNss ? 'nss' : 'curp'}
                    inputMode={requiresNss ? 'numeric' : 'text'}
                    maxLength={requiresNss ? 11 : 18}
                    value={creditIdentifier}
                    onChange={(e) => {
                      const val = requiresNss ? e.target.value.replace(/\D/g, '') : e.target.value.toUpperCase();
                      setCreditIdentifier(val);
                    }}
                    placeholder={requiresNss ? 'Ingresa tu NSS si lo tienes a la mano' : 'Ingresa tu CURP si la tienes a la mano'}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 text-xs sm:text-sm font-mono font-bold bg-white dark:bg-[#0E2033] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-tight">
                    💡 Si no lo tienes a la mano, déjalo vacío y tu asesor te ayudará a consultarlo sin costo.
                  </p>
                </div>
              )}

              {/* Fecha y Hora de Visita */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="visit_date"
                    className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#C09B53]" />
                    <span>Día Tentativo</span>
                  </label>
                  <input
                    type="date"
                    id="visit_date"
                    name="visit_date"
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-[#0A1726] text-slate-900 dark:text-white focus:outline-none focus:border-[#C09B53]"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="visit_time"
                    className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#C09B53]" />
                    <span>Hora Preferida</span>
                  </label>
                  <select
                    id="visit_time"
                    name="visit_time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-[#0A1726] text-slate-900 dark:text-white focus:outline-none focus:border-[#C09B53]"
                  >
                    {['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Aviso de Privacidad */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F2C40] focus:ring-[#C09B53]"
                  />
                  <span>
                    Acepto el{' '}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="underline text-slate-900 dark:text-white font-bold inline hover:text-[#C09B53]"
                    >
                      Aviso de Privacidad
                    </button>{' '}
                    para coordinar mi visita sin compromiso de compra.
                  </span>
                </label>
              </div>

              {/* Botón CTA Gigante de Envío */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C09B53] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0F2C40] font-bold py-4 px-6 rounded-2xl text-base transition flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-[0.99]"
                >
                  <span>{isSubmitting ? 'Registrando...' : '¡Quiero Conocer la Casa Muestra!'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sin costo ni compromiso</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C09B53]" />
                  <span>Caseta con acceso controlado</span>
                </span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="text-center py-4 px-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>© {new Date().getFullYear()} {commercialConfig.agencyName}. Atención con previa cita.</p>
      </footer>

      {/* Modal de Privacidad */}
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
    </div>
  );
}
