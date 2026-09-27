'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Bus, GraduationCap, Building2, ExternalLink, Clock, Map } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export function LocationMapSection() {
  const { commercialConfig } = useApp();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Solo inicializar el iframe de Google Maps cuando el usuario se acerque a 350px de la sección
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsMapLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '350px' }
    );

    observer.observe(mapContainerRef.current);

    return () => observer.disconnect();
  }, []);

  const addressQuery = commercialConfig.contactChannels.officeAddressNote || 'Calzada del Sol, Salinas Victoria, Nuevo León, México';
  const queryAddress = encodeURIComponent(addressQuery);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryAddress}`;
  const wazeUrl = `https://waze.com/ul?q=${queryAddress}&navigate=yes`;

  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');
  const waLocationMsg = encodeURIComponent(
    `¡Hola! Me gustaría que me compartan la ubicación exacta de la casa muestra en ${commercialConfig.agencyName} (${commercialConfig.coverageZone}) por WhatsApp.`
  );
  const waLocationUrl = `https://wa.me/${cleanWa}?text=${waLocationMsg}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${queryAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="ubicacion" className="py-20 px-4 sm:px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-[1220px] mx-auto space-y-10">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <span className="label-caps text-[var(--color-accent-text)]">
              Ubicación y Conectividad
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-navy)] leading-tight">
              ¿Cómo llegar a {commercialConfig.agencyName}?
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
              Fraccionamiento ubicado en <strong>{commercialConfig.contactChannels.officeAddressNote || 'Calzada del Sol, Salinas Victoria, N.L.'}</strong> Conoce las principales vías de acceso y abre la ruta directa en tu aplicación de mapas favorita.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[var(--color-navy)] dark:bg-[var(--color-accent)] hover:opacity-90 text-white dark:text-[#0B1929] font-semibold text-xs px-4 py-2.5 rounded transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs px-4 py-2.5 rounded transition shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Waze</span>
            </a>
          </div>
        </div>

        {/* Mapa y Referencias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Mapa */}
          <div
            ref={mapContainerRef}
            className="lg:col-span-7 bg-[var(--color-bg)] rounded-xl overflow-hidden border border-[var(--color-border)] relative flex flex-col min-h-[380px] sm:min-h-[440px]"
          >
            <div className="bg-[var(--color-navy)] dark:bg-[var(--color-surface-alt)] text-white dark:text-[var(--color-text)] px-4 py-2.5 flex items-center justify-between text-xs font-medium border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                <span>Calzada del Sol, Salinas Victoria, N.L.</span>
              </div>
              <span className="label-caps bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide">
                Caseta 24/7
              </span>
            </div>

            <div className="relative w-full flex-1 flex items-center justify-center bg-[var(--color-surface-alt)]">
              {isMapLoaded ? (
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
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mx-auto flex items-center justify-center text-[var(--color-accent-text)]">
                    <Map className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Cargando mapa interactivo al acercarse...
                  </p>
                  <button
                    onClick={() => setIsMapLoaded(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[var(--color-navy)] dark:bg-[var(--color-accent)] text-white dark:text-[#0B1929] text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    <span>Mostrar mapa interactivo</span>
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-[var(--color-text-secondary)] text-center sm:text-left">
                ¿Vienes en camino o necesitas la ubicación exacta?
              </span>
              <a
                href={waLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#128C7E] hover:bg-[#0d6b60] text-white font-semibold px-3.5 py-2 rounded text-xs transition flex-shrink-0 shadow-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Pedir ubicación por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Conectividad */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-[var(--color-accent-muted)] dark:bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/20 rounded-lg p-4 sm:p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--color-navy)] font-semibold text-sm">
                <Clock className="w-4 h-4 text-[var(--color-accent-text)]" />
                <span>Punto de encuentro para visitas</span>
              </div>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Las citas se coordinan directamente en la <strong>caseta de acceso con control 24/7</strong> de {commercialConfig.agencyName} ({commercialConfig.contactChannels.officeAddressNote || 'sobre Calzada del Sol'}). Tu asesor te recibirá personalmente para darte el recorrido por la casa muestra.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="label-caps text-[var(--color-text-muted)] text-[10px] block">
                Conectividad y servicios cercanos
              </h3>

              {[
                { icon: Navigation, title: 'Vialidades principales', desc: 'Conexión fluida hacia Carretera a Colombia, Libramiento Noreste y salidas rápidas hacia Escobedo y San Nicolás.', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Bus, title: 'Transporte público', desc: 'Rutas de transporte colectivo urbano con paradas accesibles sobre Calzada del Sol y avenidas perimetrales.', color: 'text-[var(--color-success)]' },
                { icon: GraduationCap, title: 'Escuelas y comercios locales', desc: 'Planteles educativos de nivel básico, tiendas de autoservicio, farmacias y comercios a pocos minutos.', color: 'text-[var(--color-accent-text)]' },
                { icon: Building2, title: 'Centros de trabajo', desc: 'Ubicación estratégica próxima a los principales parques industriales y centros logísticos del norte metropolitano.', color: 'text-purple-600 dark:text-purple-400' },
              ].map(({ icon: Icon, title, desc, color }, i) => (
                <div key={i} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-semibold text-[var(--color-navy)]">{title}</h4>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
