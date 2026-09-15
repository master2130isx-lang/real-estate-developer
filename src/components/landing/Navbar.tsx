'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, X, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/common/SocialIcons';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface NavbarProps {
  onOpenPrequalification: () => void;
  onOpenPrivacy: () => void;
}

export function Navbar({ onOpenPrequalification, onOpenPrivacy }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { commercialConfig } = useApp();
  const social = commercialConfig.socialLinks;
  const hasSocial = Boolean(social?.facebook || social?.instagram || social?.tiktok || social?.youtube);
  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top bar con información del fraccionamiento y redes */}
      <div className="bg-[#0d233a] text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-[1220px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              <strong>{commercialConfig.agencyName}:</strong> {commercialConfig.contactChannels.officeAddressNote}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            {/* Iconos de Redes Sociales en Topbar */}
            {hasSocial && (
              <div className="hidden sm:flex items-center gap-2 border-r border-slate-700 pr-3">
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="text-slate-300 hover:text-white transition"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="text-slate-300 hover:text-white transition"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.tiktok && (
                  <a
                    href={social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok"
                    className="text-slate-300 hover:text-white transition"
                  >
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {social?.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="YouTube"
                    className="text-slate-300 hover:text-white transition"
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

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
              {commercialConfig.agencyName}
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
          <a href="#ubicacion" className="hover:text-[#0d233a] transition">
            Ubicación
          </a>
          <a href="#asesor" className="hover:text-[#0d233a] transition">
            Atención
          </a>
          <a href="#preguntas" className="hover:text-[#0d233a] transition">
            Preguntas Frecuentes
          </a>
          
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre las viviendas disponibles.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold transition"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <ThemeToggle />

          <button
            onClick={onOpenPrequalification}
            className="bg-[#0d233a] dark:bg-amber-500 text-white dark:text-slate-950 hover:bg-[#163b5c] dark:hover:bg-amber-400 px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Solicitar visita</span>
            <ArrowRight className="w-4 h-4 text-amber-400 dark:text-slate-950" />
          </button>
        </div>

        {/* Botón hamburguesa móvil y ThemeToggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onOpenPrequalification}
            className="bg-[#0d233a] dark:bg-amber-500 text-white dark:text-slate-950 px-3 py-2 rounded-lg text-xs font-bold"
          >
            Visita
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 focus:outline-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Menú Móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
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
            href="#ubicacion"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#0d233a]"
          >
            Ubicación y Cómo Llegar
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
            Aviso de Privacidad (LFPDPPP)
          </button>

          {/* Redes Sociales en Móvil */}
          {hasSocial && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">Síguenos en redes sociales:</span>
              <div className="flex items-center gap-2">
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#1877F2] text-slate-700 hover:text-white flex items-center justify-center transition"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-pink-600 text-slate-700 hover:text-white flex items-center justify-center transition"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.tiktok && (
                  <a
                    href={social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-black text-slate-700 hover:text-white flex items-center justify-center transition"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white flex items-center justify-center transition"
                  >
                    <YouTubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre el Modelo Águila Premier.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold text-center text-sm shadow flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chatear por WhatsApp ({commercialConfig.contactChannels.phone})</span>
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
