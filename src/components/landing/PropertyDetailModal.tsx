'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Bed,
  Bath,
  Maximize2,
  Car,
  Calendar,
  ShieldCheck,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Trees,
  GraduationCap,
} from 'lucide-react';
import { Property } from '@/types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onSelectForPrequalification: (property: Property) => void;
}

export function PropertyDetailModal({
  property,
  onClose,
  onSelectForPrequalification,
}: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset index when property changes
  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [property?.id]);

  if (!property) return null;

  const financingLabels: Record<string, string> = {
    infonavit: 'Infonavit (Tradicional, Total, Conyugal)',
    bancario: 'Crédito Hipotecario Bancario',
    contado: 'Recursos Propios / Contado',
    otro: 'Fovissste u otros esquemas',
    por_definir: 'Consultar esquema',
  };

  const galleryImages = property.images && property.images.length > 0 ? property.images : [property.image];
  const currentImage = galleryImages[activeImageIndex] || property.image;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const isVerifiedReal = !property.isIllustrativeDemo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Botón de cierre flotante */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white flex items-center justify-center transition cursor-pointer shadow-lg"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visor de Galería Principal */}
        <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-slate-900">
          <Image
            src={currentImage}
            alt={`${property.model} - Foto ${activeImageIndex + 1}`}
            fill
            className="object-cover rounded-t-3xl transition-opacity duration-200"
            sizes="(max-width: 768px) 100vw, 700px"
          />

          {/* Flechas de navegación si hay múltiples imágenes */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer shadow"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer shadow"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Badges superiores / inferiores en la foto */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {isVerifiedReal ? (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Fotografías Reales de Casa Muestra</span>
              </span>
            ) : (
              <span className="bg-slate-800/90 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Recurso Demostrativo
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#0d233a]/90 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm shadow">
                {property.name}
              </span>
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-lg shadow">
                {property.priceFormatted}
              </span>
            </div>
            {galleryImages.length > 1 && (
              <span className="text-[11px] font-semibold text-white/90 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                Foto {activeImageIndex + 1} de {galleryImages.length}
              </span>
            )}
          </div>
        </div>

        {/* Carrusel de Miniaturas (Thumbnails) */}
        {galleryImages.length > 1 && (
          <div className="bg-slate-950 px-3 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                  activeImageIndex === idx ? 'border-amber-400 scale-105 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
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
        )}

        {/* Contenido detallado (Sin barreras de registro previo) */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Título y Ubicación */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 uppercase tracking-wider">
                Código: {property.code} {property.development ? `• ${property.development}` : ''}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Actualizado: {property.lastUpdated}
              </span>
            </div>

            <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {property.model}
            </h2>

            {property.address && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>{property.address}</span>
              </p>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">{property.description}</p>
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Bed className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Recámaras</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {property.bedrooms} {property.hasStayArea ? '+ Estancia' : ''}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Bath className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Baños</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{property.bathrooms} Baños</p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Maximize2 className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Construcción / Terreno</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {property.constructionM2} m² / {property.landM2} m²
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <Car className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Estacionamiento</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{property.parkingSpots} auto(s)</p>
            </div>
          </div>

          {/* Características y acabados */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Acabados y distribución interior
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {property.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Amenidades del desarrollo */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm">
                <Trees className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Amenidades del Fraccionamiento Privado</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950 dark:text-emerald-200 pt-1">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cercanías y servicios */}
          {property.nearbyServices && property.nearbyServices.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Ubicación estratégica y servicios cercanos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                {property.nearbyServices.map((service, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formas de pago y gastos notariales */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Gastos adicionales y formas de compra admitidas</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Gastos notariales / escrituración estimados:</strong> {property.estimatedClosingCosts}
            </p>
            <div className="pt-1">
              <p className="text-slate-600 dark:text-slate-300 mb-1">
                <strong>Esquemas que acepta esta propiedad:</strong>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {property.admittedFinancing.map((type) => (
                  <span
                    key={type}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-md font-medium text-[11px]"
                  >
                    {financingLabels[type] || type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onSelectForPrequalification(property);
              }}
              className="w-full sm:w-auto flex-1 bg-[#0d233a] hover:bg-[#163b5c] dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Solicitar visita para este modelo</span>
              <ArrowRight className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3.5 px-5 rounded-xl text-sm transition cursor-pointer"
            >
              Cerrar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
