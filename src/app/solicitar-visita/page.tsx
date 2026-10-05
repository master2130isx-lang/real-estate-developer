'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { PrequalificationForm } from '@/components/prequalification/PrequalificationForm';
import { PrivacyModal } from '@/components/landing/PrivacyModal';
import { useApp } from '@/context/AppContext';

export default function SolicitarVisitaPage() {
  const router = useRouter();
  const { commercialConfig } = useApp();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-between transition-colors">
      {/* Barra superior */}
      <header className="bg-[#0F2C40] dark:bg-[#071A2C] text-white py-3.5 px-4 border-b border-white/10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-[#D1D5DB] hover:text-[var(--color-accent)] transition flex items-center gap-2 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Volver a la Página Principal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="font-serif text-xs font-bold text-[#F0ECE4] tracking-tight">
              {commercialConfig.agencyName}
            </span>
          </div>
        </div>
      </header>

      {/* Formulario embebido */}
      <main className="max-w-2xl mx-auto w-full p-4 flex-1 flex items-center justify-center">
        <PrequalificationForm
          sourceChannel="solicitar_visita"
          isOpen={true}
          onClose={() => {
            router.push('/');
          }}
          onOpenPrivacyNotice={() => setIsPrivacyOpen(true)}
        />
      </main>

      {/* Modal de Aviso de Privacidad */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
