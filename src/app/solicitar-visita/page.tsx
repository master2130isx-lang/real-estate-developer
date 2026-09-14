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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Barra superior */}
      <header className="bg-[#0d233a] text-white py-3 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Página Principal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
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
