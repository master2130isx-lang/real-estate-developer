'use client';

import React from 'react';
import { MapPin, Navigation, Bus, GraduationCap, Building2, ExternalLink, Clock, Compass } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export function LocationMapSection() {
  // URLs directas de navegación
  const queryAddress = encodeURIComponent('Calzada del Sol, Salinas Victoria, Nuevo León, México');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryAddress}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent('Calzada del Sol Salinas Victoria NL')}&navigate=yes`;
  
  const waLocationMsg = encodeURIComponent(
    '¡Hola! Me gustaría que me compartan la ubicación exacta de la casa muestra en Valle de los Encinos (Salinas Victoria) por WhatsApp.'
  );
  const waLocationUrl = `https://wa.me/${COMMERCIAL_CONFIG.contactChannels.whatsapp}?text=${waLocationMsg}`;

  // Iframe de Google Maps centrado en Salinas Victoria / Calzada del Sol
  const mapEmbedUrl = `https://maps.google.com/maps?q=Calzada%20del%20Sol,%20Salinas%20Victoria,%20Nuevo%20Leon&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="ubicacion" className="py-16 px-4 bg-white border-b border-slate-200">
      <div className="max-w-[1220px] mx-auto space-y-10">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Ubicación y Conectividad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ¿Cómo llegar a Valle de los Encinos?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Fraccionamiento ubicado en <strong>Calzada del Sol, Salinas Victoria, N.L.</strong> Conoce las principales vías de acceso y abre la ruta directa en tu aplicación de mapas favorita.
            </p>
          </div>

          {/* Botones rápidos de apertura en app de navegación */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Abrir en Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Abrir en Waze</span>
            </a>
          </div>
        </div>

        {/* Tarjeta Principal del Mapa y Referencias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Columna Izquierda: Mapa Embebido */}
          <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden border border-slate-300 shadow-md relative flex flex-col min-h-[380px] sm:min-h-[440px]">
            {/* Cabecera del visor del mapa */}
            <div className="bg-[#0d233a] text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Calzada del Sol, Salinas Victoria, N.L.</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded">
                Caseta Principal 24/7
              </span>
            </div>

            {/* Iframe interactivo */}
            <div className="relative w-full flex-1">
              <iframe
                title="Mapa de ubicación Valle de los Encinos"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '340px' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Barra inferior de asistencia por WhatsApp */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-600 text-center sm:text-left">
                ¿Vienes en camino o necesitas la ubicación exacta en tiempo real?
              </span>
              <a
                href={waLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex-shrink-0 shadow-sm"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Pedir ubicación por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Conectividad y Puntos Clave */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Tarjeta de punto de encuentro con el asesor */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Punto de encuentro para visitas:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Las citas se coordinan directamente en la <strong>caseta de acceso con control 24/7</strong> del fraccionamiento Valle de los Encinos sobre Calzada del Sol. Tu asesor te recibirá personalmente para darte el recorrido por la casa muestra.
              </p>
            </div>

            {/* Lista de Conectividades */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Conectividad y servicios cercanos:
              </h3>

              {/* 1. Vialidades */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-slate-900">Vialidades principales</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Conexión fluida hacia Carretera a Colombia, Libramiento Noreste y salidas rápidas hacia Escobedo y San Nicolás.
                  </p>
                </div>
              </div>

              {/* 2. Transporte público */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bus className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-slate-900">Transporte público</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Rutas de transporte colectivo urbano con paradas accesibles sobre Calzada del Sol y avenidas perimetrales.
                  </p>
                </div>
              </div>

              {/* 3. Escuelas y Comercios */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-slate-900">Escuelas y comercios locales</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Planteles educativos de nivel básico, tiendas de autoservicio, farmacias y comercios a pocos minutos.
                  </p>
                </div>
              </div>

              {/* 4. Empleo */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-bold text-slate-900">Centros de trabajo y parques industriales</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Ubicación estratégica próxima a los principales parques industriales y centros logísticos del norte metropolitano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
