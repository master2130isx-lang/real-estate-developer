'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Property } from '@/types';
import { PLACEHOLDER_PROPERTY_IMAGE } from '@/lib/propertyDefaults';
import { resolveHeroProperty } from '@/lib/heroProperty';

interface HeroProps {
  onOpenPrequalification: (property?: Property) => void;
}

export function Hero({ onOpenPrequalification }: HeroProps) {
  const { properties, commercialConfig } = useApp();

  // Encontrar el modelo destacado en portada:
  // 1. Por ID en commercialConfig.heroPropertyId
  // 2. Por propiedad marcada con isHero === true
  // 3. Fallback a la primera propiedad del catálogo
  const heroProperty = resolveHeroProperty(properties, commercialConfig);

  const heroImage = heroProperty?.image || heroProperty?.images?.[0] || PLACEHOLDER_PROPERTY_IMAGE;
  const heroModelName = heroProperty?.model || heroProperty?.name || '';
  const heroPrice = heroProperty?.priceFormatted || '';
  const landing = commercialConfig.landing;

  return (
    <section className="relative bg-[var(--color-bg)] pt-12 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1220px] mx-auto">
        {/* Grid: texto izquierda, foto derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Columna Izquierda: Mensaje editorial */}
          <div className="space-y-6 text-left order-2 lg:order-1">
            {/* Etiqueta superior */}
            <span className="label-caps text-[var(--color-accent-text)] tracking-[0.18em]">
              {landing.heroEyebrow}
            </span>

            {/* Título editorial con cursiva selectiva */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight text-[var(--color-navy)]">
              {landing.heroTitle}{' '}
              <br className="hidden sm:block" />
              <em className="font-serif italic text-[var(--color-accent-text)]">{landing.heroTitleHighlight}</em>
            </h1>

            {/* Descripción */}
            <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed max-w-lg">
              {landing.heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* CTA Principal — ocre sólido */}
              <button
                onClick={() => onOpenPrequalification(heroProperty)}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-3.5 px-7 rounded text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{landing.heroCtaLabel}</span>
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
                alt={`${landing.heroBadge} ${heroModelName} en ${heroProperty?.development || commercialConfig.agencyName}`}
                fill
                priority
                fetchPriority="high"
                className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />

              {/* Placa elegante sobre la foto */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-[#0F2C40]/90 dark:bg-[#071526]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/15 shadow-lg flex items-center gap-3">
                <div>
                  <span className="text-[#D4AD62] font-bold text-xs sm:text-[13px] tracking-wider uppercase block leading-snug">
                    {landing.heroBadge}
                  </span>
                  <span className="font-serif font-bold text-sm sm:text-base text-white">
                    {heroModelName}
                  </span>
                </div>
                {heroPrice && (
                  <span className="text-xs sm:text-[13px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-1 rounded-lg">
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
