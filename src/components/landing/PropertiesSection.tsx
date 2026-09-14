'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight, Eye, Info } from 'lucide-react';
import { Property } from '@/types';
import { PROPERTIES_DATA } from '@/data/mockData';
import { PropertyDetailModal } from './PropertyDetailModal';

interface PropertiesSectionProps {
  onSelectPropertyForPrequalification: (property: Property) => void;
}

export function PropertiesSection({ onSelectPropertyForPrequalification }: PropertiesSectionProps) {
  const [selectedModalProperty, setSelectedModalProperty] = useState<Property | null>(null);

  const statusLabels: Record<Property['availabilityStatus'], { text: string; bg: string; textCol: string }> = {
    disponible: { text: 'Disponible (Demo)', bg: 'bg-emerald-100', textCol: 'text-emerald-800' },
    ultimas_unidades: { text: 'Últimas unidades (Demo)', bg: 'bg-amber-100', textCol: 'text-amber-900' },
    preventa: { text: 'Preventa (Demo)', bg: 'bg-blue-100', textCol: 'text-blue-900' },
    agotado: { text: 'Agotado (Demo)', bg: 'bg-slate-100', textCol: 'text-slate-600' },
  };

  const financingShort: Record<string, string> = {
    infonavit: 'Infonavit',
    bancario: 'Banco',
    contado: 'Contado',
    otro: 'Fovissste',
    necesita_orientacion: 'Orientación',
  };

  return (
    <section id="opciones" className="py-16 px-4 bg-white border-b border-slate-200">
      <div className="max-w-[1220px] mx-auto space-y-10">
        {/* Encabezado de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>Inventario y modelos disponibles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Propiedades disponibles en catálogo
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Consulta precios de referencia, características y formas de compra admitidas. Conoce nuestro modelo insignia en <strong>Valle de los Encinos (Salinas Victoria)</strong> con fotografías reales de casa muestra.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 self-start md:self-auto">
            <span className="font-bold text-slate-700 block mb-0.5">Transparencia comercial:</span>
            Fotografías reales para Modelo Águila Premier; modelos adicionales en proceso de validación.
          </div>
        </div>

        {/* Grid de 4 propiedades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROPERTIES_DATA.map((property) => {
            const status = statusLabels[property.availabilityStatus];
            const isVerifiedReal = !property.isIllustrativeDemo;

            return (
              <div
                key={property.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col ${
                  isVerifiedReal ? 'border-amber-400/80 ring-1 ring-amber-300/60' : 'border-slate-200'
                }`}
              >
                {/* Imagen y badges de cabecera */}
                <div className="relative w-full h-56 sm:h-64 bg-slate-100">
                  <Image
                    src={property.image}
                    alt={property.model}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {isVerifiedReal ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm bg-emerald-600 text-white flex items-center gap-1">
                        ✨ Fotografías Reales
                      </span>
                    ) : (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${status.bg} ${status.textCol}`}>
                        {status.text}
                      </span>
                    )}
                    <span className="bg-[#0d233a]/85 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {property.code}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow text-xs font-bold text-slate-800">
                    {property.priceFormatted}
                  </div>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{property.zone}</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug">
                        {property.model}
                      </h3>
                      {property.development && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {property.development}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{property.name}</p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  {/* Ficha métrica compacta */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Recámaras</span>
                      <span className="font-bold text-slate-800">
                        {property.bedrooms} {property.hasStayArea ? '+ Estancia' : 'Recs.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Baños</span>
                      <span className="font-bold text-slate-800">{property.bathrooms} Baños</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Construcción</span>
                      <span className="font-bold text-slate-800">{property.constructionM2} m²</span>
                    </div>
                  </div>

                  {/* Formas de compra aceptadas */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                      Esquemas contemplados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {property.admittedFinancing.map((type) => (
                        <span
                          key={type}
                          className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          ✓ {financingShort[type] || type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Gastos de escrituración referenciales */}
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p>
                      <strong>Gastos notariales estimados:</strong> {property.estimatedClosingCosts}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fecha de actualización del catálogo: {property.lastUpdated}
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    <button
                      onClick={() => setSelectedModalProperty(property)}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver ficha técnica</span>
                    </button>

                    <button
                      onClick={() => onSelectPropertyForPrequalification(property)}
                      className="w-full bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Solicitar visita</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de detalle libre de barrera de datos */}
        <PropertyDetailModal
          property={selectedModalProperty}
          onClose={() => setSelectedModalProperty(null)}
          onSelectForPrequalification={onSelectPropertyForPrequalification}
        />
      </div>
    </section>
  );
}
