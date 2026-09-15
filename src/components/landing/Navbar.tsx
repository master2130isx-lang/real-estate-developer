'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 transition-colors">
      {/* Top bar — navy, centrado, label-caps */}
      <div className="bg-[var(--color-navy)] text-center py-2.5 px-4">
        <span className="label-caps text-[#C09B53] dark:text-[var(--color-accent)] tracking-[0.18em] text-[10px] sm:text-[11px]">
          VISITAS PRIVADAS · {commercialConfig.coverageZone.toUpperCase()}
        </span>
      </div>

      {/* Nav principal — fondo marfil / superficie dark */}
      <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          {/* Logotipo e Identidad */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-navy)] dark:bg-[var(--color-surface-alt)] text-white dark:text-[var(--color-accent)] flex items-center justify-center transition">
              <Building2 className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[var(--color-navy)] block leading-tight">
                Valle de los Encinos
              </span>
              <span className="label-caps text-[var(--color-text-muted)] text-[9px]">
                RESIDENCIAL · N.L.
              </span>
            </div>
          </Link>

          {/* Enlaces de escritorio */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[var(--color-text-secondary)]">
            <a href="#opciones" className="hover:text-[var(--color-navy)] transition">
              Residencias
            </a>
            <a href="#ubicacion" className="hover:text-[var(--color-navy)] transition">
              El entorno
            </a>
            <a href="#como-funciona" className="hover:text-[var(--color-navy)] transition">
              Financiamiento
            </a>
            <a href="#preguntas" className="hover:text-[var(--color-navy)] transition">
              Preguntas
            </a>

            <ThemeToggle />

            <button
              onClick={onOpenPrequalification}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] font-semibold py-2.5 px-5 rounded text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <span>Agenda tu visita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botón hamburguesa móvil */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenPrequalification}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] px-3 py-2 rounded text-xs font-semibold cursor-pointer"
            >
              Visita
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menú Móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-3">
          <a
            href="#opciones"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
          >
            Residencias
          </a>
          <a
            href="#ubicacion"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
          >
            El entorno
          </a>
          <a
            href="#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
          >
            Financiamiento
          </a>
          <a
            href="#asesor"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
          >
            Atención
          </a>
          <a
            href="#preguntas"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-navy)]"
          >
            Preguntas
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPrivacy();
            }}
            className="block py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-left w-full"
          >
            Aviso de Privacidad
          </button>

          {/* Redes Sociales en Móvil */}
          {hasSocial && (
            <div className="pt-2 border-t border-[var(--color-border)]">
              <span className="label-caps text-[var(--color-text-muted)] block mb-2 text-[10px]">Redes sociales</span>
              <div className="flex items-center gap-2">
                {social?.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[var(--color-surface-alt)] hover:bg-[#1877F2] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transition">
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[var(--color-surface-alt)] hover:bg-pink-600 text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transition">
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.tiktok && (
                  <a href={social.tiktok} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[var(--color-surface-alt)] hover:bg-black text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transition">
                    <TikTokIcon className="w-4 h-4" />
                  </a>
                )}
                {social?.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[var(--color-surface-alt)] hover:bg-red-600 text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center transition">
                    <YouTubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--color-border)] flex flex-col gap-2">
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('¡Hola! Me gustaría recibir información sobre las viviendas disponibles.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded font-semibold text-center text-sm flex items-center justify-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp ({commercialConfig.contactChannels.phone})</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrequalification();
              }}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-navy)] dark:text-[#0B1929] py-3 rounded font-semibold text-center text-sm cursor-pointer"
            >
              Solicitar una visita &rarr;
            </button>
            <Link
              href="/panel"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] py-2.5 rounded font-medium text-center text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Panel del Asesor</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
