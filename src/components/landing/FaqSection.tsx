'use client';

import React, { useState } from 'react';
import { ChevronDown, ShieldAlert } from 'lucide-react';
import { FAQ_ITEMS } from '@/data/mockData';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas" className="py-20 px-4 sm:px-6 bg-[var(--color-bg)] border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="label-caps text-[var(--color-accent)]">
            Respuestas claras antes de contactar
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-navy)] leading-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
            Resolvemos las dudas principales sobre precios, esquemas de crédito, gastos de escrituración y la solicitud segura del NSS.
          </p>
        </div>

        {/* Alerta NSS */}
        <div className="bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/20 rounded-lg p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-[var(--color-navy)]">
          <ShieldAlert className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--color-navy)]">
              Sobre la privacidad de tu Número de Seguridad Social (NSS):
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              El NSS únicamente se requiere si vas a comprar mediante crédito <strong>Infonavit</strong> y deseas conocer tu precalificación. Si tu compra es con crédito bancario o de contado, <strong>no lo necesitas proporcionar</strong>. En ningún caso tu NSS se vende ni se comparte con terceros ajenos al trámite.
            </p>
          </div>
        </div>

        {/* Acordeón */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden transition"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-[var(--color-bg)] transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[var(--color-navy)] text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[var(--color-bg)] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
