'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Bed,
  Bath,
  Maximize2,
  Car,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Property } from '@/types';
import { useApp } from '@/context/AppContext';
import { PropertyEditorModal } from './PropertyEditorModal';
import { PropertyDetailModal } from '../landing/PropertyDetailModal';

export function PropertyManagerView() {
  const { properties, deleteProperty, reloadProperties } = useApp();
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState<Property | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedPropertyForEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setSelectedPropertyForEdit(prop);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    await deleteProperty(id);
    setIsDeleting(false);
    setDeleteConfirmId(null);
  };

  const statusBadge: Record<
    Property['availabilityStatus'],
    { label: string; bg: string; text: string; border: string }
  > = {
    disponible: {
      label: 'Disponible',
      bg: 'bg-emerald-950/60 dark:bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-800/60',
    },
    ultimas_unidades: {
      label: 'Últimas Unidades',
      bg: 'bg-amber-950/60 dark:bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-800/60',
    },
    preventa: {
      label: 'Preventa',
      bg: 'bg-sky-950/60 dark:bg-sky-950/60',
      text: 'text-sky-300',
      border: 'border-sky-800/60',
    },
    agotado: {
      label: 'Agotado / Pausado',
      bg: 'bg-slate-900/80 dark:bg-slate-900/80',
      text: 'text-slate-400',
      border: 'border-slate-700',
    },
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior con Resumen y Botón de Creación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#102033] border border-[#1E354D]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-[#C09B53]" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Catálogo de Modelos Residenciales
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0F2C40] border border-[#C09B53]/40 text-[#C09B53] font-mono font-bold">
              {properties.length} {properties.length === 1 ? 'modelo' : 'modelos'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Administra los modelos que los prospectos ven en la página web, galerías y solicitudes de citas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-[#C09B53] hover:bg-[#D4AF37] text-[#0F2C40] font-bold px-4 py-2.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Modelo</span>
        </button>
      </div>

      {/* Cuadrícula de Modelos */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const galleryCount = prop.images?.length || (prop.image ? 1 : 0);
            const coverImage = prop.images?.[0] || prop.image || '/images/properties/aguila-premier/01-facade.jpg';
            const statusConfig = statusBadge[prop.availabilityStatus] || statusBadge.disponible;

            return (
              <div
                key={prop.id}
                className="rounded-3xl bg-[#102033] border border-[#1E354D] overflow-hidden flex flex-col shadow-lg hover:border-[#C09B53]/40 transition group"
              >
                {/* Imagen de Portada con Badges */}
                <div className="relative aspect-16/10 w-full bg-[#0B1522] overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={prop.model}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Estatus */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border backdrop-blur-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Contador de Fotos */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#C09B53]" />
                    <span>{galleryCount} fotos</span>
                  </div>

                  {/* Precio Flotante */}
                  <div className="absolute bottom-3 left-3 bg-[#0F2C40]/90 backdrop-blur-md border border-[#C09B53]/40 text-[#C09B53] px-3 py-1 rounded-xl text-xs font-bold font-mono">
                    {prop.priceFormatted || `$${prop.price.toLocaleString('es-MX')} MXN`}
                  </div>
                </div>

                {/* Cuerpo de Información */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold tracking-wider text-[#C09B53] uppercase">
                        {prop.development || 'Valle de los Encinos'}
                      </span>
                      {prop.code && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {prop.code}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight">
                      {prop.model}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {prop.description || 'Vivienda de dos plantas en fraccionamiento privado.'}
                    </p>
                  </div>

                  {/* Especificaciones Arquitectónicas */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#1E354D]/70 text-center">
                    <div className="flex flex-col items-center">
                      <Bed className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">{prop.bedrooms}</span>
                      <span className="text-[9px] text-slate-500">Recámaras</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Bath className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">{prop.bathrooms}</span>
                      <span className="text-[9px] text-slate-500">Baños</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Maximize2 className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">{prop.constructionM2}</span>
                      <span className="text-[9px] text-slate-500">m² const</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <Car className="w-4 h-4 text-slate-400 mb-0.5" />
                      <span className="text-xs font-bold text-white">{prop.parkingSpots}</span>
                      <span className="text-[9px] text-slate-500">Autos</span>
                    </div>
                  </div>

                  {/* Ubicación y Amenidades */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-[#C09B53] shrink-0" />
                      <span className="truncate">{prop.address || prop.zone}</span>
                    </div>

                    {prop.amenities && prop.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prop.amenities.slice(0, 3).map((am, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-[#0F2C40] text-slate-300 border border-[#1E354D]"
                          >
                            {am}
                          </span>
                        ))}
                        {prop.amenities.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-lg text-slate-400">
                            +{prop.amenities.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones de Tarjeta */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewProperty(prop)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0F2C40] hover:bg-[#153E5A] text-slate-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C09B53]" />
                      <span>Ver Ficha</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(prop)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1E354D] hover:bg-[#2A4B6E] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(prop.id)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-900/50 transition cursor-pointer"
                      title="Eliminar modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#102033] border border-[#1E354D]">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No hay modelos de casas registrados</h3>
          <p className="text-xs text-slate-400 mb-4">
            Comienza agregando el primer modelo residencial para exhibirlo en la landing page.
          </p>
          <button
            onClick={handleOpenCreate}
            className="bg-[#C09B53] hover:bg-[#D4AF37] text-[#0F2C40] font-bold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primer Modelo</span>
          </button>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0B1522] border border-[#1E354D] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">¿Eliminar este modelo de casa?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Esta acción retirará la propiedad de la página web, del formulario de citas y de la base de datos.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición / Creación */}
      {isEditorOpen && (
        <PropertyEditorModal
          property={selectedPropertyForEdit}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={() => {
            reloadProperties();
          }}
        />
      )}

      {/* Modal de Vista Previa (Ficha Técnica Real) */}
      {previewProperty && (
        <PropertyDetailModal
          property={previewProperty}
          onClose={() => setPreviewProperty(null)}
          onSelectForPrequalification={() => {
            setPreviewProperty(null);
          }}
        />
      )}
    </div>
  );
}
