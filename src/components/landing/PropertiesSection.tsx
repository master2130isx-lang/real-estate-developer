'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Eye,
  CheckCircle2,
  Bed,
  Bath,
  Maximize2,
  Car,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trees,
} from 'lucide-react';
import { Property } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { PropertyDetailModal } from './PropertyDetailModal';

interface PropertiesSectionProps {
  onSelectPropertyForPrequalification: (property: Property) => void;
}

export function PropertiesSection({ onSelectPropertyForPrequalification }: PropertiesSectionProps) {
  const [selectedModalProperty, setSelectedModalProperty] = useState<Property | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const property = PROPERTIES_DATA[0];

  if (!property) return null;

  const gallery = property.images && property.images.length > 0 ? property.images : [property.image];

  const handlePrev = () => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const handleNext = () => {
    setActivePhotoIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="opciones" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-[1220px] mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Modelo Insignia en Venta</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {property.model} • {property.development}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Vivienda de dos plantas en fraccionamiento privado con acceso controlado en Salinas Victoria, N.L. Conoce las fotografías reales de la casa muestra y agenda tu visita personalizada.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
            <span className="font-bold text-slate-800 block mb-0.5">Ubicación confirmada:</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>

        {/* Gran Tarjeta Destacada */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Columna Izquierda: Galería Interactiva con Miniaturas */}
          <div className="lg:col-span-7 bg-slate-950 flex flex-col relative h-full">
            {/* Foto Activa - Ocupa todo el espacio vertical disponible eliminando cualquier hueco negro */}
            <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
              <Image
                src={gallery[activePhotoIndex]}
                alt={`${property.model} - Foto ${activePhotoIndex + 1}`}
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />

              {/* Botones de navegación de foto */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition cursor-pointer shadow-md"
                aria-label="Siguiente foto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Badges superiores */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Fotografías Reales</span>
                </span>
                <span className="bg-[#0d233a]/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  Código: {property.code}
                </span>
              </div>

              {/* Contador de fotos */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-lg">
                Foto {activePhotoIndex + 1} de {gallery.length}
              </div>
            </div>

            {/* Tira de Miniaturas */}
            <div className="bg-slate-900/95 p-3 flex items-center gap-2 overflow-x-auto scrollbar-thin border-t border-slate-800 flex-shrink-0">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-14 h-11 sm:w-16 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Ver foto ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Información Completa y Acciones */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Encabezado y Precio */}
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 uppercase tracking-wider">
                  {property.development} • Salinas Victoria, N.L.
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
                  {property.model}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0d233a]">
                    {property.priceFormatted}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Disponibilidad Inmediata
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {property.description}
              </p>

              {/* Ficha Métrica Destacada */}
              <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <Bed className="w-4 h-4 text-slate-500 mx-auto mb-0.5" />
                  <span className="text-slate-400 block text-[10px]">Recámaras</span>
                  <span className="font-bold text-slate-800">2 + Estancia</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <Bath className="w-4 h-4 text-slate-500 mx-auto mb-0.5" />
                  <span className="text-slate-400 block text-[10px]">Baños</span>
                  <span className="font-bold text-slate-800">1.5 Baños</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <Maximize2 className="w-4 h-4 text-slate-500 mx-auto mb-0.5" />
                  <span className="text-slate-400 block text-[10px]">Construcción</span>
                  <span className="font-bold text-slate-800">{property.constructionM2} m²</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <Car className="w-4 h-4 text-slate-500 mx-auto mb-0.5" />
                  <span className="text-slate-400 block text-[10px]">Cochera</span>
                  <span className="font-bold text-slate-800">{property.parkingSpots} Autos</span>
                </div>
              </div>

              {/* Acabados y equipamiento */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Distribución y Acabados:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Vitropiso instalado</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Estancia en planta alta</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Patio y pasillo lateral</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Preparación minisplit</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Terreno: 98 m²</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Estacionamiento 2 autos</span>
                  </li>
                </ul>
              </div>

              {/* Amenidades */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Amenidades del Fraccionamiento Privado:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-emerald-950 font-medium">
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">🐾 Pet Park</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">⚽ Canchas sintéticas</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">🏡 Palapa familiar</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">🔐 Acceso controlado 24/7</span>
                </div>
              </div>

              {/* Esquemas de financiamiento */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Formas de compra admitidas:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-lg">
                    ✓ Infonavit (Tradicional o Conyugal)
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-lg">
                    ✓ Crédito Hipotecario Bancario
                  </span>
                  <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-lg">
                    ✓ Recursos Propios / Contado
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectPropertyForPrequalification(property)}
                className="w-full bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Solicitar visita guiada a casa muestra</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setSelectedModalProperty(property)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Ver ficha técnica completa y fotos en alta resolución ({gallery.length} fotos)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Detalle Completo */}
        <PropertyDetailModal
          property={selectedModalProperty}
          onClose={() => setSelectedModalProperty(null)}
          onSelectForPrequalification={onSelectPropertyForPrequalification}
        />
      </div>
    </section>
  );
}
