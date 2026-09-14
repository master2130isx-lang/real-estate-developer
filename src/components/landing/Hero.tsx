'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Eye, Info } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

interface HeroProps {
  onOpenPrequalification: () => void;
}

export function Hero({ onOpenPrequalification }: HeroProps) {
  return (
    <section className="relative bg-[#0d233a] text-white pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 border-b border-slate-800">
      <div className="max-w-[1220px] mx-auto">
        {/* Banner discreto de modo demostración */}
        <div className="mb-6 inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-xs text-amber-300">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Prototipo interactivo (Fase 1.1) • Contenido e inmuebles ilustrativos para demostración</span>
        </div>

        {/* Estructura Desktop & Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Columna Izquierda: Mensaje Comercial Claro y Directo */}
          <div className="lg:col-span-6 space-y-5 text-left order-1">
            {/* 1. Título */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Encuentra tu próxima casa en{' '}
              <span className="text-amber-400">Salinas Victoria, N.L.</span>
            </h1>

            {/* 2. Descripción breve y Precio */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Vive en Valle de los Encinos: casas con 2 recámaras, estancia familiar, patio con vitropiso y amenidades con acceso controlado. Consulta precios y solicita tu visita personalizada.
            </p>

            {COMMERCIAL_CONFIG.featuredPrice.hasSupportingOffer && (
              <div className="inline-block bg-slate-800/80 border border-slate-700/90 px-4 py-2 rounded-xl">
                <span className="text-xs text-slate-400 block font-medium">Precio confirmado:</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  Desde {COMMERCIAL_CONFIG.featuredPrice.amountFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  *{COMMERCIAL_CONFIG.featuredPrice.referenceNote}
                </span>
              </div>
            )}

            {/* 3. CTA Principal y Secundario */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={onOpenPrequalification}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Solicitar una visita</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>

              <a
                href="#opciones"
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold py-3.5 px-5 rounded-xl text-sm transition text-center flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-slate-300" />
                <span>Ver propiedades</span>
              </a>
            </div>

            {/* Texto de apoyo libre de consulta */}
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Puedes consultar las propiedades sin registrarte. El asesor confirmará contigo la disponibilidad de la visita.
            </p>
          </div>

          {/* Columna Derecha: Fotografía Protagonista de la Propiedad */}
          <div className="lg:col-span-6 order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] bg-slate-800">
              <Image
                src="/images/properties/aguila-premier/facade.jpg"
                alt="Casa Muestra Modelo Águila Premier en Valle de los Encinos, Salinas Victoria"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
              {/* Pie de foto con datos reales */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 flex flex-wrap justify-between items-end gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Modelo Águila Premier • Valle de los Encinos
                  </span>
                  <p className="text-white text-sm sm:text-base font-bold">
                    2 Recámaras + Estancia • 1.5 Baños • 2 Autos (98 m² Terreno)
                  </p>
                </div>
                <span className="text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-md font-semibold">
                  ✨ Fotografía Real de Casa Muestra
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
