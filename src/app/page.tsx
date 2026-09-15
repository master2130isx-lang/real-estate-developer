'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PropertiesSection } from '@/components/landing/PropertiesSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AdvisorTrust } from '@/components/landing/AdvisorTrust';
import { FaqSection } from '@/components/landing/FaqSection';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { Footer } from '@/components/landing/Footer';
import { PrivacyModal } from '@/components/landing/PrivacyModal';
import { PrequalificationForm } from '@/components/prequalification/PrequalificationForm';
import { Property } from '@/types';
import { ArrowRight, Calendar } from 'lucide-react';
import { WhatsAppFloatingButton } from '@/components/landing/WhatsAppFloatingButton';

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
    <main className="min-h-screen flex flex-col bg-slate-50 selection:bg-amber-100 selection:text-amber-950 pb-16 md:pb-0">
      {/* Barra de navegación superior */}
      <Navbar
        onOpenPrequalification={() => handleOpenPrequalification()}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Hero y propuesta de valor inicial */}
      <Hero onOpenPrequalification={() => handleOpenPrequalification()} />

      {/* Opciones disponibles con transparencia total de precios y gastos */}
      <PropertiesSection
        onSelectPropertyForPrequalification={(property) => handleOpenPrequalification(property)}
      />

      {/* Proceso transparente en 3 pasos */}
      <HowItWorks onOpenPrequalification={() => handleOpenPrequalification()} />

      {/* Identidad del asesor y compromisos de ética */}
      <AdvisorTrust />

      {/* Preguntas frecuentes y explicación sobre el NSS */}
      <FaqSection />

      {/* CTA Final */}
      <section className="py-14 px-4 bg-[#0d233a] text-white border-t border-slate-800">
        <div className="max-w-[1220px] mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-amber-300 border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Atención personalizada y directa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold max-w-2xl mx-auto">
            ¿Listo para conocer qué opciones se adaptan a tus planes?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Cuéntanos qué buscas para coordinar tu atención y solicitar una visita a las casas muestra con acompañamiento de tu asesor.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleOpenPrequalification()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-8 rounded-xl text-base transition shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Solicitar una visita</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
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
