'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Property } from '@/types';

interface HeroProps {
  onOpenPrequalification: (property?: Property) => void;
}

export function Hero({ onOpenPrequalification }: HeroProps) {
  const { properties, commercialConfig } = useApp();

  // Encontrar el modelo destacado en portada:
  // 1. Por ID en commercialConfig.heroPropertyId
  // 2. Por propiedad marcada con isHero === true
  // 3. Fallback a la primera propiedad del catálogo
  const heroProperty =
    (commercialConfig?.heroPropertyId
      ? properties.find((p) => p.id === commercialConfig.heroPropertyId)
      : null) ||
    properties.find((p) => p.isHero) ||
    properties[0];

  const heroImage =
    heroProperty?.image ||
    heroProperty?.images?.[0] ||
    '/images/properties/aguila-premier/01-facade.jpg';

  const heroModelName = heroProperty?.model || heroProperty?.name || 'Modelo Águila Premier';
  const heroPrice = heroProperty?.priceFormatted || '$1,180,000 MXN';

  return (
    <section className="relative bg-[var(--color-bg)] pt-12 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1220px] mx-auto">
        {/* Grid: texto izquierda, foto derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Columna Izquierda: Mensaje editorial */}
          <div className="space-y-6 text-left order-2 lg:order-1">
            {/* Etiqueta superior */}
            <span className="label-caps text-[var(--color-accent-text)] tracking-[0.18em]">
              COLECCIÓN RESIDENCIAL 2026
            </span>

            {/* Título editorial con cursiva selectiva */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight text-[var(--color-navy)]">
              Una casa que{' '}
              <br className="hidden sm:block" />
              <em className="font-serif italic text-[var(--color-accent-text)]">se siente tuya.</em>
            </h1>

            {/* Descripción */}
            <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed max-w-lg">
              Diseñamos una forma de empezar: casas luminosas, un entorno tranquilo y el acompañamiento que necesitas para dar el siguiente paso.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* CTA Principal — ocre sólido */}
              <button
                onClick={() => onOpenPrequalification(heroProperty)}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-3.5 px-7 rounded text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Conocer la casa muestra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* CTA Secundario — texto con icono sutil */}
              <a
                href="#opciones"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-navy)] font-medium text-sm transition flex items-center justify-center gap-1.5 py-3 px-2 border-b border-[var(--color-border)] sm:border-b-0 sm:border-0"
              >
                <span>Explorar residencias</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna Derecha: Fotografía arquitectónica */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] bg-[var(--color-surface-alt)] shadow-lg border border-[var(--color-border)] group">
              <Image
                src={heroImage}
                alt={`Casa Muestra ${heroModelName} en Valle de los Encinos, Salinas Victoria`}
                fill
                priority
                fetchPriority="high"
                className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />

              {/* Placa elegante sobre la foto */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-[#0F2C40]/90 dark:bg-[#071526]/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/15 shadow-lg flex items-center gap-3">
                <div>
                  <span className="text-[#C09B53] font-bold text-[9px] sm:text-[10px] tracking-wider uppercase block">
                    Casa Muestra en Exhibición
                  </span>
                  <span className="font-serif font-bold text-xs sm:text-sm text-white">
                    {heroModelName}
                  </span>
                </div>
                {heroPrice && (
                  <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-200 bg-white/10 px-2 py-1 rounded-lg">
                    {heroPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
