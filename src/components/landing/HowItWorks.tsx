'use client';

import React from 'react';
import { Search, SlidersHorizontal, CalendarCheck2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onOpenPrequalification: () => void;
}

export function HowItWorks({ onOpenPrequalification }: HowItWorksProps) {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Cuéntanos qué estás buscando',
      description:
        'Indica en nuestro formulario tu presupuesto aproximado, zona de interés, plazo de compra y tu forma de pago prevista (Infonavit, banco o recursos propios).',
      detail: 'Puedes solicitar orientación si aún no defines tu esquema.',
    },
    {
      number: '02',
      icon: SlidersHorizontal,
      title: 'Revisamos qué opciones encajan contigo',
      description:
        'Revisamos el inventario disponible según tus criterios. Si vas por Infonavit, se contempla el NSS para el registro interno de atención de 15 días con tu asesor.',
      detail: 'No autoriza consultas crediticias ni te obliga a comprar.',
    },
    {
      number: '03',
      icon: CalendarCheck2,
      title: 'Te contactamos por WhatsApp para tu visita',
      description:
        'Tu asesor revisa la disponibilidad física de la casa muestra y te contacta directamente por WhatsApp para acordar el día y horario definitivo.',
      detail: 'No confirmamos citas automáticamente; acordamos la fecha contigo.',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-[1220px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#1c456f] uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Proceso transparente y directo
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ¿Cómo funciona el proceso de atención?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Diseñamos un método claro para que conozcas las opciones y condiciones antes de coordinar una visita física con tu asesor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-200">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-[#0d233a] text-amber-400 flex items-center justify-center shadow-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onOpenPrequalification}
            className="inline-flex items-center gap-2 bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow cursor-pointer"
          >
            <span>Solicitar una visita</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  );
}
