'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, X, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface NavbarProps {
  onOpenPrequalification: () => void;
  onOpenPrivacy: () => void;
}

export function Navbar({ onOpenPrequalification, onOpenPrivacy }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top bar con información del fraccionamiento */}
      <div className="bg-[#0d233a] text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-[1220px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              <strong>Valle de los Encinos:</strong> Calzada del Sol, Salinas Victoria, N.L. • Casa muestra disponible previa cita
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/panel"
              className="text-amber-300 hover:text-amber-200 transition flex items-center gap-1 font-semibold"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Panel de Asesoría</span>
            </Link>
          </div>
        </div>
      </div>

      <nav className="max-w-[1220px] mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logotipo e Identidad */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#0d233a] text-white flex items-center justify-center shadow-sm group-hover:bg-[#163b5c] transition">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              {COMMERCIAL_CONFIG.agencyName}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Vivienda Residencial y Atención Personalizada
            </span>
          </div>
        </Link>

        {/* Enlaces de escritorio */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#opciones" className="hover:text-[#0d233a] transition">
            Propiedades
          </a>
          <a href="#como-funciona" className="hover:text-[#0d233a] transition">
            Cómo Funciona
          </a>
          <a href="#asesor" className="hover:text-[#0d233a] transition">
            Atención
          </a>
          <a href="#preguntas" className="hover:text-[#0d233a] transition">
            Preguntas Frecuentes
          </a>
          
          <a
            href={`https://wa.me/${COMMERCIAL_CONFIG.contactChannels.whatsapp}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre el Modelo Águila Premier en Valle de los Encinos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={onOpenPrequalification}
            className="bg-[#0d233a] text-white hover:bg-[#163b5c] px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Solicitar visita</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Botón hamburguesa móvil */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenPrequalification}
            className="bg-[#0d233a] text-white px-3 py-2 rounded-lg text-xs font-bold"
          >
            Visita
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Menú Móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <a
            href="#opciones"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#0d233a]"
          >
            Propiedades
          </a>
          <a
            href="#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#0d233a]"
          >
            Cómo Funciona
          </a>
          <a
            href="#asesor"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#0d233a]"
          >
            Atención del Asesor
          </a>
          <a
            href="#preguntas"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#0d233a]"
          >
            Preguntas Frecuentes
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPrivacy();
            }}
            className="block py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 text-left w-full"
          >
            Aviso de Privacidad (Borrador)
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${COMMERCIAL_CONFIG.contactChannels.whatsapp}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre el Modelo Águila Premier en Valle de los Encinos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-center text-sm shadow flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chatear por WhatsApp (+52 33 4254 6271)</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrequalification();
              }}
              className="w-full bg-[#0d233a] text-white py-3 rounded-xl font-bold text-center text-sm shadow"
            >
              Solicitar una visita &rarr;
            </button>
            <Link
              href="/panel"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-slate-100 text-slate-800 py-2.5 rounded-xl font-semibold text-center text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Acceder al Panel del Asesor (Demo)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
