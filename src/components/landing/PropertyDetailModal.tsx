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
        className="relative bg-[var(--color-surface)] rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--color-border)] text-[var(--color-text)] transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Botón de cierre flotante */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[var(--color-navy)]/85 hover:bg-[var(--color-navy)] text-white flex items-center justify-center transition cursor-pointer shadow-lg"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visor de Galería Principal */}
        <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-[var(--color-navy-deep)]">
          <Image
            src={currentImage}
            alt={`${property.model} - Foto ${activeImageIndex + 1}`}
            fill
            className="object-cover rounded-t-xl transition-opacity duration-200"
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
              <span className="bg-[var(--color-navy)]/90 text-[var(--color-accent)] text-xs font-semibold px-3 py-1 rounded shadow-md flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Fotografías Reales de Casa Muestra</span>
              </span>
            ) : (
              <span className="bg-[var(--color-navy)]/90 text-white/80 text-xs font-medium px-2.5 py-1 rounded">
                Recurso Demostrativo
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="bg-[var(--color-navy)]/90 text-white text-xs font-medium px-3 py-1 rounded backdrop-blur-sm shadow">
                {property.name}
              </span>
              <span className="bg-[var(--color-accent)] text-[var(--color-navy)] text-xs font-bold px-3 py-1 rounded shadow">
                {property.priceFormatted}
              </span>
            </div>
            {galleryImages.length > 1 && (
              <span className="text-[11px] font-medium text-white/90 bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm">
                Foto {activeImageIndex + 1} de {galleryImages.length}
              </span>
            )}
          </div>
        </div>

        {/* Carrusel de Miniaturas (Thumbnails) */}
        {galleryImages.length > 1 && (
          <div className="bg-[var(--color-navy-deep)] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin border-b border-white/5">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition cursor-pointer ${
                  activeImageIndex === idx ? 'border-[var(--color-accent)] scale-105 shadow' : 'border-transparent opacity-60 hover:opacity-100'
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

        {/* Contenido detallado */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Título y Ubicación */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="label-caps text-[var(--color-accent)] text-[10px] bg-[var(--color-surface-alt)] px-2.5 py-0.5 rounded border border-[var(--color-border)]">
                Código: {property.code} {property.development ? `• ${property.development}` : ''}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                Actualizado: {property.lastUpdated}
              </span>
            </div>

            <h2 id="modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] leading-tight">
              {property.model}
            </h2>

            {property.address && (
              <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" />
                <span>{property.address}</span>
              </p>
            )}

            <p className="text-sm text-[var(--color-text-secondary)] mt-2.5 leading-relaxed">{property.description}</p>
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[var(--color-border)] text-center">
            <div className="p-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded">
              <Bed className="w-4 h-4 text-[var(--color-accent)] mx-auto mb-1" />
              <p className="label-caps text-[var(--color-text-muted)] text-[9px]">Recámaras</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {property.bedrooms} {property.hasStayArea ? '+ Estancia' : ''}
              </p>
            </div>
            <div className="p-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded">
              <Bath className="w-4 h-4 text-[var(--color-accent)] mx-auto mb-1" />
              <p className="label-caps text-[var(--color-text-muted)] text-[9px]">Baños</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">{property.bathrooms} Baños</p>
            </div>
            <div className="p-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded">
              <Maximize2 className="w-4 h-4 text-[var(--color-accent)] mx-auto mb-1" />
              <p className="label-caps text-[var(--color-text-muted)] text-[9px]">Construcción</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {property.constructionM2} m² / {property.landM2} m²
              </p>
            </div>
            <div className="p-2.5 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded">
              <Car className="w-4 h-4 text-[var(--color-accent)] mx-auto mb-1" />
              <p className="label-caps text-[var(--color-text-muted)] text-[9px]">Cochera</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">{property.parkingSpots} auto(s)</p>
            </div>
          </div>

          {/* Características y acabados */}
          <div>
            <span className="label-caps text-[var(--color-text-muted)] text-[10px] block mb-2.5">
              Acabados y distribución interior
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[var(--color-text-secondary)]">
              {property.keyFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Amenidades del desarrollo */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-navy)] dark:text-[var(--color-accent)] text-xs sm:text-sm font-serif">
                <Trees className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Amenidades del Fraccionamiento Privado</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cercanías y servicios */}
          {property.nearbyServices && property.nearbyServices.length > 0 && (
            <div className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-navy)] dark:text-[var(--color-accent)] text-xs sm:text-sm font-serif">
                <GraduationCap className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Ubicación estratégica y servicios cercanos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
                {property.nearbyServices.map((service, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"></span>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formas de pago y gastos notariales */}
          <div className="bg-[var(--color-surface-alt)] rounded-lg p-4 border border-[var(--color-border)] text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[var(--color-navy)] dark:text-[var(--color-text)] font-serif">
              <FileText className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Gastos adicionales y formas de compra admitidas</span>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-text)]">Gastos notariales / escrituración estimados:</strong> {property.estimatedClosingCosts}
            </p>
            <div className="pt-1">
              <p className="text-[var(--color-text-secondary)] mb-1.5">
                <strong className="text-[var(--color-text)]">Esquemas que acepta esta propiedad:</strong>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {property.admittedFinancing.map((type) => (
                  <span
                    key={type}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] px-2.5 py-0.5 rounded text-[11px] font-medium"
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
              className="w-full sm:w-auto flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-3 px-6 rounded text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Solicitar visita para este modelo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] font-medium py-3 px-5 rounded text-sm transition cursor-pointer"
            >
              Cerrar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
