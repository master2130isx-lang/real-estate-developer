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
    <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-[var(--color-bg)] border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-[1220px] mx-auto space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="label-caps text-[var(--color-accent)]">
            Proceso transparente y directo
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-navy)] leading-tight">
            ¿Cómo funciona el proceso de atención?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
            Diseñamos un método claro para que conozcas las opciones y condiciones antes de coordinar una visita física con tu asesor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="bg-[var(--color-surface)] rounded-lg p-6 sm:p-7 border border-[var(--color-border)] relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl font-bold text-[var(--color-border)]">{step.number}</span>
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-navy)] dark:bg-[var(--color-surface-alt)] text-[var(--color-accent)] flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] font-medium">
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onOpenPrequalification}
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-3.5 px-7 rounded text-sm transition cursor-pointer"
          >
            <span>Solicitar una visita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
