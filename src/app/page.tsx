'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PropertiesSection } from '@/components/landing/PropertiesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { Footer } from '@/components/landing/Footer';
import { Property } from '@/types';
import { ArrowRight } from 'lucide-react';

// Componentes secundarios e interactivos diferidos para eliminar JavaScript bloqueante inicial
const AdvisorTrust = dynamic(
  () => import('@/components/landing/AdvisorTrust').then((m) => m.AdvisorTrust),
  { ssr: false }
);

const LocationMapSection = dynamic(
  () => import('@/components/landing/LocationMapSection').then((m) => m.LocationMapSection),
  { ssr: false }
);


const PrequalificationForm = dynamic(
  () => import('@/components/prequalification/PrequalificationForm').then((m) => m.PrequalificationForm),
  { ssr: false }
);

const PrivacyModal = dynamic(
  () => import('@/components/landing/PrivacyModal').then((m) => m.PrivacyModal),
  { ssr: false }
);

const WhatsAppFloatingButton = dynamic(
  () => import('@/components/landing/WhatsAppFloatingButton').then((m) => m.WhatsAppFloatingButton),
  { ssr: false }
);

export default function Home() {
  const [isPrequalificationOpen, setIsPrequalificationOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('visita') || window.location.search.includes('formulario');
    }
    return false;
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleOpenPrequalification = (property?: Property | null) => {
    setSelectedProperty(property || null);
    setIsPrequalificationOpen(true);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('visita')) {
      setIsPrequalificationOpen(true);
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col pb-16 md:pb-0 transition-colors">
      {/* Barra de navegación superior */}
      <Navbar
        onOpenPrequalification={() => handleOpenPrequalification()}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Hero y propuesta de valor inicial */}
      <Hero onOpenPrequalification={(prop) => handleOpenPrequalification(prop)} />

      {/* Opciones disponibles con transparencia total de precios y gastos */}
      <PropertiesSection
        onSelectPropertyForPrequalification={(property) => handleOpenPrequalification(property)}
      />

      {/* Proceso transparente en 3 pasos */}
      <HowItWorks onOpenPrequalification={() => handleOpenPrequalification()} />

      {/* Ubicación estratégica, mapa y cómo llegar */}
      <LocationMapSection />

      {/* Identidad del asesor y compromisos de ética */}
      <AdvisorTrust />



      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--color-navy)] dark:bg-[var(--color-navy-deep)]">
        <div className="max-w-[1220px] mx-auto text-center space-y-6">
          <span className="label-caps text-[#E0BD76] tracking-[0.18em]">
            Atención personalizada y directa
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F0ECE4] max-w-2xl mx-auto leading-tight">
            ¿Listo para conocer qué opciones se adaptan a{' '}
            <em className="font-serif italic text-[#E0BD76]">tus planes?</em>
          </h2>
          <p className="text-[#D1D5DB] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Cuéntanos qué buscas para coordinar tu atención y solicitar una visita a las casas muestra con acompañamiento de tu asesor.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleOpenPrequalification()}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy-deep)] font-semibold py-3.5 px-8 rounded text-base transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Solicitar una visita</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pie de página */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Botón inferior fijo en móvil */}
      <StickyMobileCTA onOpenPrequalification={() => handleOpenPrequalification()} />

      {/* Modal del formulario de precalificación y registro */}
      <PrequalificationForm
        isOpen={isPrequalificationOpen}
        onClose={() => setIsPrequalificationOpen(false)}
        preselectedProperty={selectedProperty}
        onOpenPrivacyNotice={() => setIsPrivacyOpen(true)}
      />

      {/* Modal del aviso de privacidad */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      {/* Botón flotante directo a WhatsApp */}
      <WhatsAppFloatingButton />
    </main>
  );
}
