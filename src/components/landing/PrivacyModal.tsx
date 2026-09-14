'use client';

import React from 'react';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
          aria-label="Cerrar aviso"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#0d233a] mb-2">
          <Shield className="w-6 h-6 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Documento Legal en Desarrollo
          </span>
        </div>

        <h2 id="privacy-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
          Borrador del Aviso de Privacidad Integral
        </h2>

        {/* Advertencia de alcance y responsabilidad */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Requisito legal obligatorio antes de producción:</strong> El uso interno del NSS también exige identificar claramente quién es responsable de los datos y quién tiene acceso a ellos. Antes de activar la recopilación en producción, el titular comercial debe auditar y completar los campos entre corchetes <code>[PENDIENTE: ...]</code>.
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-900 mb-1">1. Identidad y Responsable del Tratamiento</h3>
            <p>
              El responsable del resguardo de sus datos personales es{' '}
              <strong>[PENDIENTE: Razón Social o Nombre Legal del Titular]</strong> (denominado en esta demostración como{' '}
              <em>{COMMERCIAL_CONFIG.agencyName}</em>), con domicilio en{' '}
              <strong>[PENDIENTE: Domicilio legal en México]</strong> y correo de atención{' '}
              <strong>{COMMERCIAL_CONFIG.contactChannels.email}</strong>.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-1">2. Finalidad Específica del Número de Seguridad Social (NSS)</h3>
            <p>
              El NSS se recaba de manera justificada y condicional <strong>únicamente</strong> para solicitar su registro en el mecanismo interno de la inmobiliaria y asignar al asesor la atribución comercial de su atención durante un periodo de 15 días, conforme a las reglas internas vigentes.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 mt-2 space-y-1">
              <p className="font-bold text-slate-800">Límites expresos de esta recopilación:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>NO constituye el inicio de una solicitud formal de crédito ante Infonavit.</li>
                <li>NO autoriza una consulta de historial crediticio ante sociedades de información crediticia (buró).</li>
                <li>NO obliga al visitante a concretar la compraventa del inmueble.</li>
                <li>No se solicita a compradores que adquieran mediante crédito bancario o pago de contado.</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-1">3. Finalidades del Tratamiento de Datos de Contacto</h3>
            <p>
              <strong>Finalidades Primarias:</strong>
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Contactarle directamente por WhatsApp o teléfono para coordinar y confirmar visitas a las propiedades.</li>
              <li>Atender sus dudas sobre precios, características y alternativas de compra.</li>
              <li>Llevar el control interno de asignación comercial del asesor.</li>
            </ul>
            <p className="mt-2">
              <strong>Finalidades Secundarias (opcionales):</strong>
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Envío de promociones o nuevos desarrollos residenciales (requiere consentimiento expreso sin casillas premarcadas).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-1">4. Ejercicio de Derechos ARCO</h3>
            <p>
              Usted tiene derecho en todo momento a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales, así como a revocar el consentimiento otorgado. Dichas solicitudes se atenderán a través del correo{' '}
              <strong>{COMMERCIAL_CONFIG.contactChannels.email}</strong>.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 mb-1">5. Política de Conservación y Destrucción</h3>
            <p>
              La política de atribución comercial de 15 días es independiente de la política de conservación de datos personales. Conforme a las directrices de seguridad, el NSS de prospectos no convertidos será eliminado de forma segura una vez agotado el periodo de conservación legal y comercial aprobado por el responsable.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Entendido y cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
