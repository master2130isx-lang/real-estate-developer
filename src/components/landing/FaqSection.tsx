'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldAlert } from 'lucide-react';
import { FAQ_ITEMS } from '@/data/mockData';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="preguntas" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200/70 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
            <span>Respuestas claras antes de contactar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Preguntas Frecuentes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Resolvemos las dudas principales sobre precios, esquemas de crédito, gastos de escrituración y la solicitud segura del NSS.
          </p>
        </div>

        {/* Alerta destacada sobre el NSS */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Sobre la privacidad de tu Número de Seguridad Social (NSS):
            </p>
            <p className="text-amber-800 leading-relaxed">
              El NSS únicamente se requiere si vas a comprar mediante crédito <strong>Infonavit</strong> y deseas conocer tu precalificación. Si tu compra es con crédito bancario o de contado, <strong>no lo necesitas proporcionar</strong>. En ningún caso tu NSS se vende ni se comparte con terceros ajenos al trámite.
            </p>
          </div>
        </div>

        {/* Acordeón de preguntas */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-sm"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 hover:bg-slate-50 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-200' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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
