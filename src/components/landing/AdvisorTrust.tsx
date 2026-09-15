'use client';

import React from 'react';
import { UserCheck, MapPin, Phone, Mail, Clock, HelpCircle, Info } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export function AdvisorTrust() {
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
            {/* Tarjeta del asesor con datos de demostración claramente marcados */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0d233a] text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow">
                  AS
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{COMMERCIAL_CONFIG.advisorRole}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {COMMERCIAL_CONFIG.advisorName}
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
                    <strong>Zona de atención:</strong> {COMMERCIAL_CONFIG.coverageZone}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Canal de contacto directo:</strong> WhatsApp y llamadas en horario comercial.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Correo de atención:</strong> {COMMERCIAL_CONFIG.contactChannels.email}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Horario de visitas:</strong> Conforme a disponibilidad de casas muestra (previa cita confirmada por WhatsApp).
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${COMMERCIAL_CONFIG.contactChannels.whatsapp}?text=${encodeURIComponent('Hola, me gustaría platicar con un asesor sobre el Modelo Águila Premier en Valle de los Encinos.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Contactar por WhatsApp (+52 33 4254 6271)</span>
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
