'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  ArrowRight,
  Eye,
  CheckCircle2,
  Bed,
  Bath,
  Maximize2,
  Car,
  ChevronLeft,
  ChevronRight,
  Trees,
} from 'lucide-react';
import { Property } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { PropertyDetailModal } from './PropertyDetailModal';

interface PropertiesSectionProps {
  onSelectPropertyForPrequalification: (property: Property) => void;
}

export function PropertiesSection({ onSelectPropertyForPrequalification }: PropertiesSectionProps) {
  const { properties: appProperties } = useApp();
  const properties = appProperties && appProperties.length > 0 ? appProperties : PROPERTIES_DATA;

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'prop-aguila-premier');
  const [selectedModalProperty, setSelectedModalProperty] = useState<Property | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const property = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  if (!property) return null;

  const gallery = property.images && property.images.length > 0 ? property.images : [property.image];

  const handlePrev = () => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  };

  const handleNext = () => {
    setActivePhotoIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="opciones" className="py-20 px-4 sm:px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-[1220px] mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <span className="label-caps text-[var(--color-accent)]">
              {properties.length > 1 ? 'Modelos Residenciales en Venta' : 'Modelo Insignia en Venta'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-navy)] leading-tight">
              {property.model} · {property.development}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
              Vivienda de dos plantas en fraccionamiento privado con acceso controlado en Salinas Victoria, N.L. Conoce las fotografías reales de la casa muestra y agenda tu visita personalizada.
            </p>
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-3.5 rounded-lg border border-[var(--color-border)] self-start md:self-auto">
            <span className="font-semibold text-[var(--color-navy)] block mb-0.5">Ubicación confirmada:</span>
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>

        {/* Selector de Modelos si hay más de 1 */}
        {properties.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-2 shrink-0">
              Seleccionar modelo:
            </span>
            {properties.map((p) => {
              const isSelected = p.id === property.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPropertyId(p.id);
                    setActivePhotoIndex(0);
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[var(--color-navy)] text-white border-[var(--color-accent)] shadow-xs'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                      border: '1px solid var(--color-accent)',
                    }}
                  ></span>
                  <span>{p.model}</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {p.priceFormatted || `$${p.price.toLocaleString('es-MX')} MXN`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Gran Tarjeta Destacada */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Columna Izquierda: Galería */}
          <div className="lg:col-span-7 bg-[var(--color-navy-deep)] flex flex-col relative h-full">
            <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
              <Image
                src={gallery[activePhotoIndex]}
                alt={`${property.model} - Foto ${activePhotoIndex + 1}`}
                fill
                className="object-cover transition-all duration-300"
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
              />

              {/* Botones de navegación */}
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Siguiente foto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Badge */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="label-caps bg-[var(--color-accent)] text-[var(--color-navy-deep)] px-3 py-1.5 rounded text-[10px] font-bold">
                  Fotografías Reales
                </span>
              </div>

              {/* Contador */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded">
                {activePhotoIndex + 1} / {gallery.length}
              </div>
            </div>

            {/* Tira de Miniaturas */}
            <div className="bg-[var(--color-navy-deep)] p-3 flex items-center gap-2 overflow-x-auto border-t border-white/10 flex-shrink-0">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-14 h-11 sm:w-16 sm:h-12 flex-shrink-0 rounded overflow-hidden border-2 transition cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-[var(--color-accent)] scale-105'
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

          {/* Columna Derecha: Información */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[var(--color-surface)]">
            <div className="space-y-5">
              {/* Encabezado y Precio */}
              <div>
                <span className="label-caps text-[var(--color-accent)] text-[10px]">
                  {property.development} · Salinas Victoria, N.L.
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-navy)] mt-1.5">
                  {property.model}
                </h3>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[var(--color-navy)]">
                    {property.priceFormatted}
                  </span>
                  <span className="label-caps text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded text-[10px]">
                    Disponible
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {property.description}
              </p>

              {/* Ficha Métrica */}
              <div className="grid grid-cols-4 gap-2 py-4 border-y border-[var(--color-border)] text-center text-xs">
                <div className="space-y-1">
                  <Bed className="w-4 h-4 text-[var(--color-text-muted)] mx-auto" />
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Recámaras</span>
                  <span className="font-semibold text-[var(--color-navy)]">2 + Estancia</span>
                </div>
                <div className="space-y-1">
                  <Bath className="w-4 h-4 text-[var(--color-text-muted)] mx-auto" />
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Baños</span>
                  <span className="font-semibold text-[var(--color-navy)]">1.5</span>
                </div>
                <div className="space-y-1">
                  <Maximize2 className="w-4 h-4 text-[var(--color-text-muted)] mx-auto" />
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Construcción</span>
                  <span className="font-semibold text-[var(--color-navy)]">{property.constructionM2} m²</span>
                </div>
                <div className="space-y-1">
                  <Car className="w-4 h-4 text-[var(--color-text-muted)] mx-auto" />
                  <span className="text-[var(--color-text-muted)] block text-[10px]">Cochera</span>
                  <span className="font-semibold text-[var(--color-navy)]">{property.parkingSpots} Autos</span>
                </div>
              </div>

              {/* Acabados */}
              <div className="space-y-2">
                <span className="label-caps text-[var(--color-text-muted)] text-[10px] block">
                  Distribución y Acabados
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Vitropiso instalado</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Estancia en planta alta</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Patio y pasillo lateral</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Preparación minisplit</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Terreno: 98 m²</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" />
                    <span>Estacionamiento 2 autos</span>
                  </li>
                </ul>
              </div>

              {/* Amenidades */}
              <div className="bg-[var(--color-success-bg)] border border-[var(--color-border)] rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-success)]">
                  <Trees className="w-4 h-4" />
                  <span>Amenidades del Fraccionamiento Privado</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--color-text-secondary)] font-medium">
                  <span className="bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)]">🐾 Pet Park</span>
                  <span className="bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)]">⚽ Canchas sintéticas</span>
                  <span className="bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)]">🏡 Palapa familiar</span>
                  <span className="bg-[var(--color-surface)] px-2.5 py-1 rounded border border-[var(--color-border)]">🔐 Acceso controlado 24/7</span>
                </div>
              </div>

              {/* Esquemas de financiamiento */}
              <div className="space-y-1.5">
                <span className="label-caps text-[var(--color-text-muted)] text-[10px] block">
                  Formas de compra admitidas
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-[var(--color-bg)] text-[var(--color-text)] font-medium px-2.5 py-1 rounded border border-[var(--color-border)]">
                    ✓ Infonavit
                  </span>
                  <span className="bg-[var(--color-bg)] text-[var(--color-text)] font-medium px-2.5 py-1 rounded border border-[var(--color-border)]">
                    ✓ Crédito Bancario
                  </span>
                  <span className="bg-[var(--color-bg)] text-[var(--color-text)] font-medium px-2.5 py-1 rounded border border-[var(--color-border)]">
                    ✓ Contado
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => onSelectPropertyForPrequalification(property)}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-3.5 px-4 rounded text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Solicitar visita guiada</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedModalProperty(property)}
                className="w-full bg-transparent hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-medium py-2.5 px-4 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Ver ficha técnica completa ({gallery.length} fotos)</span>
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
