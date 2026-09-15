'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { X } from 'lucide-react';

export function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { commercialConfig } = useApp();
  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  const defaultMessage = encodeURIComponent(
    `¡Hola! Me interesa conocer más sobre las viviendas en ${commercialConfig.agencyName} (${commercialConfig.coverageZone}). ¿Me podrían brindar información o agendar una visita?`
  );
  const waUrl = `https://wa.me/${cleanWa}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Ventana flotante de saludo rápido */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 max-w-[calc(100vw-2rem)] w-72 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{commercialConfig.advisorName}</p>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En línea ahora
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Cerrar chat de WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ¡Hola! ¿Tienes dudas sobre el <strong>Modelo Águila Premier</strong> o deseas agendar tu visita a la casa muestra? Escríbenos directamente por WhatsApp.
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Iniciar conversación</span>
          </a>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 transition group cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>¿Dudas? Chatea con un asesor</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 transition duration-200 cursor-pointer relative"
          aria-label="Contactar por WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7" />
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
