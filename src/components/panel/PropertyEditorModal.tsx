'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  UploadCloud,
  Trash2,
  Star,
  Plus,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Maximize2,
  Sparkles,
  Camera,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Property, FinancingType } from '@/types';
import { compressImageInBrowser } from '@/lib/imageCompressor';

interface PropertyEditorModalProps {
  property: Property | null; // null si es creación nueva
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedProperty: Property) => void;
}

const COMMON_AMENITIES = [
  'Acceso controlado con caseta 24/7',
  'Pet Park para mascotas',
  'Canchas deportivas con pasto sintético',
  'Palapa familiar para eventos',
  'Áreas verdes y juegos infantiles',
  'Barda perimetral electrificada',
  'Pista para caminar y trotar',
  'Servicios subterráneos',
];

const COMMON_FINANCING: { id: FinancingType; label: string }[] = [
  { id: 'infonavit', label: 'Crédito Infonavit (Total, Tradicional, Conyugal)' },
  { id: 'bancario', label: 'Crédito Hipotecario Bancario' },
  { id: 'contado', label: 'Pago de Contado' },
  { id: 'otro', label: 'Cofinavit / Fovissste para Todos' },
  { id: 'necesita_orientacion', label: 'Asesoría y Calificación en Desarrollo' },
];

export function PropertyEditorModal({
  property,
  isOpen,
  onClose,
  onSave,
}: PropertyEditorModalProps) {
  const isEditing = !!property;

  // Estados del Formulario
  const [activeTab, setActiveTab] = useState<'general' | 'medidas' | 'fotos' | 'amenidades'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Campos
  const [model, setModel] = useState(property?.model || '');
  const [name, setName] = useState(property?.name || 'Valle de los Encinos');
  const [development, setDevelopment] = useState(property?.development || 'Valle de los Encinos');
  const [code, setCode] = useState(property?.code || '');
  const [address, setAddress] = useState(property?.address || 'Calzada del Sol, Salinas Victoria, N.L.');
  const [zone, setZone] = useState(property?.zone || 'Salinas Victoria, N.L. (Valle de los Encinos)');
  const [city, setCity] = useState(property?.city || 'Salinas Victoria, N.L.');
  const [price, setPrice] = useState<number>(property?.price || 1180000);
  const [availabilityStatus, setAvailabilityStatus] = useState<Property['availabilityStatus']>(
    property?.availabilityStatus || 'disponible'
  );
  const [estimatedClosingCosts, setEstimatedClosingCosts] = useState(
    property?.estimatedClosingCosts || 'Aprox. 5% a 7% (Escrituración y aranceles notariales en N.L.)'
  );

  // Dimensiones
  const [bedrooms, setBedrooms] = useState<number>(property?.bedrooms || 2);
  const [bathrooms, setBathrooms] = useState<number>(property?.bathrooms || 1.5);
  const [hasStayArea, setHasStayArea] = useState<boolean>(property?.hasStayArea ?? true);
  const [constructionM2, setConstructionM2] = useState<number>(property?.constructionM2 || 74.39);
  const [landM2, setLandM2] = useState<number>(property?.landM2 || 98);
  const [parkingSpots, setParkingSpots] = useState<number>(property?.parkingSpots || 2);

  // Financiamiento
  const [admittedFinancing, setAdmittedFinancing] = useState<FinancingType[]>(
    property?.admittedFinancing || ['infonavit', 'bancario', 'contado']
  );

  // Fotos
  const [images, setImages] = useState<string[]>(
    property?.images && property.images.length > 0
      ? property.images
      : property?.image
      ? [property.image]
      : []
  );
  const [manualPhotoUrl, setManualPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Textos y Amenidades
  const [description, setDescription] = useState(
    property?.description ||
      'Vivienda de dos plantas en fraccionamiento privado con caseta de vigilancia, parque infantil y áreas verdes.'
  );
  const [amenities, setAmenities] = useState<string[]>(
    property?.amenities || [
      'Pet Park para mascotas',
      'Canchas deportivas con pasto sintético',
      'Palapa familiar para eventos',
      'Acceso controlado con caseta 24/7',
    ]
  );
  const [newAmenityInput, setNewAmenityInput] = useState('');

  const [keyFeatures, setKeyFeatures] = useState<string[]>(
    property?.keyFeatures || [
      '2 recámaras con espacio para clóset',
      'Estancia familiar en planta alta',
      'Vitropiso de alta resistencia instalado',
      'Patio posterior y pasillo lateral independiente',
    ]
  );
  const [newFeatureInput, setNewFeatureInput] = useState('');

  if (!isOpen) return null;

  // Manejador de Carga y Compresión de Fotos
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    setErrorMessage('');

    try {
      const uploadPromises = Array.from(files).map(async (rawFile) => {
        // 1. Comprimir en memoria en el navegador a WebP optimizado
        const { file: compressedFile, compressedSize, originalSize } = await compressImageInBrowser(rawFile);
        console.log(
          `Optimizada: ${rawFile.name} de ${(originalSize / 1024).toFixed(0)}KB a ${(compressedSize / 1024).toFixed(0)}KB`
        );

        // 2. Subir archivo comprimido al endpoint de almacenamiento
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('propertyId', model ? model.toLowerCase().replace(/\s+/g, '-') : 'nuevo-modelo');

        const res = await fetch('/api/properties/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.ok && data.url) {
          return data.url;
        } else {
          throw new Error(data.error || 'Error al subir la imagen');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMessage(`Error durante la carga: ${err.message}`);
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddManualPhoto = () => {
    if (!manualPhotoUrl.trim()) return;
    setImages((prev) => [...prev, manualPhotoUrl.trim()]);
    setManualPhotoUrl('');
  };

  const handleSetCover = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleFinancing = (type: FinancingType) => {
    setAdmittedFinancing((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAddAmenity = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
      setNewAmenityInput('');
    }
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities((prev) => prev.filter((a) => a !== item));
  };

  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (trimmed && !keyFeatures.includes(trimmed)) {
      setKeyFeatures((prev) => [...prev, trimmed]);
      setNewFeatureInput('');
    }
  };

  const handleRemoveFeature = (item: string) => {
    setKeyFeatures((prev) => prev.filter((f) => f !== item));
  };

  // Guardar Propiedad
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setErrorMessage('Por favor especifica el nombre del modelo.');
      setActiveTab('general');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Por favor agrega al menos una foto de fachada.');
      setActiveTab('fotos');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload: Partial<Property> = {
        model: model.trim(),
        name: name.trim() || 'Valle de los Encinos',
        development: development.trim() || 'Valle de los Encinos',
        code: code.trim() || `VDE-${model.substring(0, 3).toUpperCase()}-01`,
        address: address.trim(),
        zone: zone.trim(),
        city: city.trim(),
        price: Number(price),
        priceFormatted: `$${Number(price).toLocaleString('es-MX')} MXN`,
        availabilityStatus,
        estimatedClosingCosts,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        hasStayArea,
        constructionM2: Number(constructionM2),
        landM2: Number(landM2),
        parkingSpots: Number(parkingSpots),
        admittedFinancing,
        image: images[0],
        images,
        description: description.trim(),
        amenities,
        keyFeatures,
        tags: [development.trim(), 'Casas en Venta', 'Nuevo León'],
      };

      const endpoint = isEditing ? `/api/properties/${property.id}` : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'No se pudo guardar la propiedad');
      }

      setSuccessMessage('¡Modelo guardado con éxito!');
      setTimeout(() => {
        onSave(data.property);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0B1522] border border-[#1E354D] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-[#1E354D] flex items-center justify-between bg-[#102033]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C09B53]/20 border border-[#C09B53]/40 flex items-center justify-center text-[#C09B53]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditing ? `Editar ${property.model}` : 'Registrar Nuevo Modelo de Casa'}
              </h2>
              <p className="text-xs text-slate-400">
                Se publicará en la página principal y formularios de visitas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="flex border-b border-[#1E354D] bg-[#0B1929] px-6 gap-1 sm:gap-4 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-[#C09B53] text-[#C09B53]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Datos & Ubicación</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medidas')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'medidas'
                ? 'border-[#C09B53] text-[#C09B53]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>2. Medidas & Distribución</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'border-[#C09B53] text-[#C09B53]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>3. Galería de Fotos ({images.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('amenidades')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'amenidades'
                ? 'border-[#C09B53] text-[#C09B53]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. Amenidades & Ficha</span>
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Contenido del Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DATOS & UBICACIÓN */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre del Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej. Modelo Halcón Confort"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fraccionamiento / Desarrollo *
                  </label>
                  <input
                    type="text"
                    required
                    value={development}
                    onChange={(e) => setDevelopment(e.target.value)}
                    placeholder="Ej. Valle de los Encinos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Precio de Venta ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      required
                      min={100000}
                      step={10000}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white font-bold text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-[#C09B53] mt-1 block font-mono font-semibold">
                    ${price.toLocaleString('es-MX')} MXN
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estatus de Disponibilidad
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  >
                    <option value="disponible">✓ Disponible (Venta Activa)</option>
                    <option value="ultimas_unidades">⚠️ Últimas Unidades</option>
                    <option value="preventa">🚀 Preventa Exclusiva</option>
                    <option value="agotado">✕ Agotado / Pausado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Código Interno / Clave
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej. VDE-HAL-02"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Dirección o Referencia de Ubicación
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calzada del Sol, Valle de los Encinos, Salinas Victoria, N.L."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Zona / Municipio
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Ej. Salinas Victoria, N.L."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Gastos Notariales / Escrituración Estimados
                  </label>
                  <input
                    type="text"
                    value={estimatedClosingCosts}
                    onChange={(e) => setEstimatedClosingCosts(e.target.value)}
                    placeholder="Ej. Aprox. 5% a 7% en N.L."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>
              </div>

              {/* Esquemas de Financiamiento */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Esquemas de Crédito Admitidos para este Modelo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_FINANCING.map((f) => (
                    <label
                      key={f.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                        admittedFinancing.includes(f.id)
                          ? 'bg-[#0F2C40] border-[#C09B53] text-white'
                          : 'bg-[#102033] border-[#1E354D] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={admittedFinancing.includes(f.id)}
                        onChange={() => handleToggleFinancing(f.id)}
                        className="rounded text-[#C09B53] focus:ring-0"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIDAS & DISTRIBUCIÓN */}
          {activeTab === 'medidas' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Número de Recámaras
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Baños (ej. 1.5, 2, 2.5)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    max={10}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cajones de Estacionamiento
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={parkingSpots}
                    onChange={(e) => setParkingSpots(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Metros de Construcción (m²)
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    min={20}
                    value={constructionM2}
                    onChange={(e) => setConstructionM2(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Metros de Terreno (m²)
                  </label>
                  <input
                    type="number"
                    step={0.01}
                    min={20}
                    value={landM2}
                    onChange={(e) => setLandM2(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Switch de Estancia */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#102033] border border-[#1E354D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStayArea}
                    onChange={(e) => setHasStayArea(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C09B53] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">¿Cuenta con estancia familiar?</span>
                    <span className="text-[11px] text-slate-400 block">
                      Espacio multifuncional en planta alta para televisión, estudio o descanso
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: GALERÍA DE FOTOS */}
          {activeTab === 'fotos' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Zona de Arrastrar y Soltar / Botón de Carga */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1E354D] hover:border-[#C09B53] rounded-3xl p-6 text-center cursor-pointer transition bg-[#102033]/60 hover:bg-[#102033]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-[#0F2C40] border border-[#C09B53]/40 text-[#C09B53] mx-auto flex items-center justify-center mb-3">
                  {uploadingPhotos ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-white mb-1">
                  {uploadingPhotos ? 'Comprimiendo y subiendo fotos...' : 'Toca o arrastra tus fotos aquí'}
                </h3>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Acepta JPG, PNG y WebP. Las imágenes se comprimen automáticamente en el navegador a Full HD para no ralentizar la web ni gastar almacenamiento.
                </p>
              </div>

              {/* Agregar Foto por Enlace Manual */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={manualPhotoUrl}
                  onChange={(e) => setManualPhotoUrl(e.target.value)}
                  placeholder="O pega una URL externa de foto (ej. https://...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualPhoto}
                  disabled={!manualPhotoUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-[#102033] border border-[#1E354D] hover:border-[#C09B53] disabled:opacity-40 text-xs font-semibold text-slate-200 cursor-pointer transition"
                >
                  Agregar URL
                </button>
              </div>

              {/* Galería de Fotos Cargadas */}
              {images.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Fotografías del Modelo ({images.length})
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#C09B53] fill-[#C09B53]" />
                      La primera foto es la portada principal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden border border-[#1E354D] bg-[#102033] aspect-4/3"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Foto ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />

                        {/* Badge de Portada */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-[#C09B53] text-[#0F2C40] px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#0F2C40]" />
                            <span>Portada</span>
                          </div>
                        )}

                        {/* Acciones al Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(idx)}
                              title="Poner como portada"
                              className="p-1.5 rounded-lg bg-[#C09B53] text-[#0F2C40] hover:bg-[#D4AF37] transition cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            title="Eliminar foto"
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#102033] border border-[#1E354D] text-center text-xs text-slate-400">
                  Aún no has agregado fotos a este modelo.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AMENIDADES & FICHA */}
          {activeTab === 'amenidades' && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descripción Comercial del Modelo
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Redacta los atractivos de la vivienda y fraccionamiento..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                />
              </div>

              {/* Amenidades */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Amenidades del Fraccionamiento (Etiquetas visibles en landing)
                </label>

                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COMMON_AMENITIES.map((am) => (
                    <button
                      key={am}
                      type="button"
                      onClick={() => handleAddAmenity(am)}
                      disabled={amenities.includes(am)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                        amenities.includes(am)
                          ? 'bg-[#0F2C40] border-[#C09B53]/50 text-[#C09B53] opacity-60 cursor-default'
                          : 'bg-[#102033] border-[#1E354D] text-slate-300 hover:border-[#C09B53]'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>{am}</span>
                    </button>
                  ))}
                </div>

                {/* Lista de Amenidades Activas */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[#102033] border border-[#1E354D] min-h-[44px]">
                  {amenities.map((am) => (
                    <span
                      key={am}
                      className="bg-[#0F2C40] border border-[#C09B53]/40 text-slate-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                    >
                      <span>{am}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(am)}
                        className="hover:text-rose-400 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para agregar amenidad personalizada */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newAmenityInput}
                    onChange={(e) => setNewAmenityInput(e.target.value)}
                    placeholder="Escribe otra amenidad y pulsa agregar..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAmenity(newAmenityInput)}
                    disabled={!newAmenityInput.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C09B53] text-[#0F2C40] text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Características Clave */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Características Clave (Puntos en ficha técnica)
                </label>
                <div className="space-y-1.5 mb-2">
                  {keyFeatures.map((kf, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#102033] border border-[#1E354D] text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{kf}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(kf)}
                        className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    placeholder="Ej. Preparación para minisplit en recámaras..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-[#C09B53] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!newFeatureInput.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C09B53] text-[#0F2C40] text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pie de Acciones del Modal */}
          <div className="pt-4 border-t border-[#1E354D] flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#C09B53]" />
              <span>Guardado directo en base de datos sin requerir despliegues</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || uploadingPhotos}
                className="px-5 py-2 rounded-xl bg-[#C09B53] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0F2C40] font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? 'Guardar Cambios' : 'Crear Modelo'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
