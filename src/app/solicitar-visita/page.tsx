'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { PrequalificationForm } from '@/components/prequalification/PrequalificationForm';
import { PrivacyModal } from '@/components/landing/PrivacyModal';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

export default function SolicitarVisitaPage() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-between transition-colors">
      {/* Barra superior */}
      <header className="bg-[var(--color-navy)] text-white py-3.5 px-4 border-b border-white/10 shadow-sm">
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
              {COMMERCIAL_CONFIG.agencyName}
            </span>
          </div>
        </div>
      </header>

      {/* Formulario embebido */}
      <main className="max-w-2xl mx-auto w-full p-4 flex-1 flex items-center justify-center">
        <PrequalificationForm
          isOpen={true}
          onClose={() => {
            if (typeof window !== 'undefined') window.location.href = '/';
          }}
          onOpenPrivacyNotice={() => setIsPrivacyOpen(true)}
        />
      </main>

      {/* Modal de Aviso de Privacidad */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
