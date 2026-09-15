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
      {/* Ventana flotante */}
      {isOpen && (
        <div className="bg-[var(--color-surface)] rounded-lg shadow-xl border border-[var(--color-border)] p-4 max-w-[calc(100vw-2rem)] w-72 mb-1">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-navy)] leading-tight">{commercialConfig.advisorName}</p>
                <span className="flex items-center gap-1 text-[10px] text-[#25D366] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                  En línea ahora
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded hover:bg-[var(--color-bg)] transition cursor-pointer"
              aria-label="Cerrar chat de WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
            ¿Tienes dudas sobre el <strong>Modelo Águila Premier</strong> o deseas agendar tu visita a la casa muestra? Escríbenos directamente por WhatsApp.
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2.5 px-3 rounded text-xs transition flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Iniciar conversación</span>
          </a>
        </div>
      )}

      {/* Botón Flotante */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] hover:text-[#25D366] text-xs font-medium px-3.5 py-2 rounded-full shadow-lg border border-[var(--color-border)] transition group cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
            <span>¿Dudas? Chatea con un asesor</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white flex items-center justify-center shadow-xl transition duration-200 cursor-pointer relative"
          aria-label="Contactar por WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7" />
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#4ADE80] border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
