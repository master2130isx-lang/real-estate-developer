'use client';

import React from 'react';
import { UserCheck, MapPin, Phone, Mail, Clock, HelpCircle, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/common/SocialIcons';

export function AdvisorTrust() {
  const { commercialConfig } = useApp();
  const social = commercialConfig.socialLinks;
  const hasSocial = Boolean(social?.facebook || social?.instagram || social?.tiktok || social?.youtube);
  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  const initials = commercialConfig.advisorName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AS';

  return (
    <section id="asesor" className="py-16 px-4 bg-white border-b border-slate-200">
      <div className="max-w-[1220px] mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-[#1c456f] uppercase bg-slate-100 px-3 py-1 rounded-full">
            Atención humana y personalizada
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ¿Quién atenderá tu solicitud?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Tu solicitud es revisada directamente por un asesor asignado que coordinará contigo la visita por WhatsApp o llamada telefónica.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Tarjeta del asesor con datos administrables */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0d233a] text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{commercialConfig.advisorRole}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {commercialConfig.advisorName}
                  </h3>
                  <span className="inline-block mt-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    Atención personalizada y directa
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Zona de atención:</strong> {commercialConfig.coverageZone}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Canal de contacto directo:</strong> {commercialConfig.contactChannels.phone} (WhatsApp y llamadas en horario comercial).
                  </span>
                </div>
                {commercialConfig.contactChannels.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Correo de atención:</strong> {commercialConfig.contactChannels.email}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Horario de visitas:</strong> Conforme a disponibilidad de casas muestra (previa cita confirmada por WhatsApp).
                  </span>
                </div>

                {/* Redes sociales del asesor */}
                {hasSocial && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Sígueme en redes:</span>
                    <div className="flex items-center gap-1.5">
                      {social?.facebook && (
                        <a
                          href={social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Facebook"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#1877F2] text-slate-600 hover:text-white flex items-center justify-center transition"
                        >
                          <FacebookIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.instagram && (
                        <a
                          href={social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instagram"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-slate-600 hover:text-white flex items-center justify-center transition"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.tiktok && (
                        <a
                          href={social.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="TikTok"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-black text-slate-600 hover:text-[#25F4EE] flex items-center justify-center transition"
                        >
                          <TikTokIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.youtube && (
                        <a
                          href={social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="YouTube"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#FF0000] text-slate-600 hover:text-white flex items-center justify-center transition"
                        >
                          <YouTubeIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, me gustaría platicar con un asesor sobre el Modelo Águila Premier en Valle de los Encinos.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Contactar por WhatsApp ({commercialConfig.contactChannels.phone})</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Compromisos de atención comercial */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-lg font-bold text-slate-900">
                Criterios de atención y claridad para el comprador
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Priorizamos conversaciones útiles y transparentes. No utilizamos llamadas no solicitadas ni presionamos con falsas ofertas de urgencia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Visitas con confirmación manual</span>
                  </div>
                  <p className="text-slate-500">
                    Tu asesor valida la agenda y te contacta por WhatsApp para coordinar el horario sin sobrecupos.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>NSS con finalidad específica</span>
                  </div>
                  <p className="text-slate-500">
                    Se utiliza para registrar la atención ante la inmobiliaria; no autoriza consultas crediticias ni te compromete a comprar.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Orientación preliminar</span>
                  </div>
                  <p className="text-slate-500">
                    Si aún no decides tu esquema de compra, puedes solicitar información sin entregar el NSS.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Gastos transparentes</span>
                  </div>
                  <p className="text-slate-500">
                    Te informamos sobre avalúo, derechos y gastos notariales antes de cualquier pago o apartado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
