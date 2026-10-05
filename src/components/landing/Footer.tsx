'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Shield, UserCheck, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { buildWhatsAppLink } from '@/lib/phone';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/common/SocialIcons';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
  const { commercialConfig } = useApp();
  const social = commercialConfig.socialLinks;
  const hasSocial = Boolean(social?.facebook || social?.instagram || social?.tiktok || social?.youtube);

  return (
    <footer className="bg-[var(--color-navy-deep)] text-[#D1D5DB] text-xs py-14 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-[1220px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight text-[#F0ECE4]">
                {commercialConfig.agencyName}
              </span>
            </div>
            <p className="text-[#D1D5DB] text-xs leading-relaxed">
              {commercialConfig.landing.footerDescription}
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-2">
            <span className="label-caps text-[#F0ECE4] text-[10px] block mb-1">Navegación</span>
            <ul className="flex flex-col">
              <li>
                <a href="#opciones" className="py-2.5 min-h-[44px] inline-flex items-center text-[#D1D5DB] hover:text-[var(--color-accent)] transition">
                  Residencias
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="py-2.5 min-h-[44px] inline-flex items-center text-[#D1D5DB] hover:text-[var(--color-accent)] transition">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#asesor" className="py-2.5 min-h-[44px] inline-flex items-center text-[#D1D5DB] hover:text-[var(--color-accent)] transition">
                  Atención
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="py-2.5 min-h-[44px] inline-flex items-center text-[#D1D5DB] hover:text-[var(--color-accent)] transition">
                  Ubicación
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Seguridad y Panel */}
          <div className="space-y-2">
            <span className="label-caps text-[#F0ECE4] text-[10px] block mb-1">Seguridad y Acceso</span>
            <ul className="flex flex-col">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="py-2.5 min-h-[44px] text-[#D1D5DB] hover:text-[var(--color-accent)] text-left transition flex items-center gap-2 cursor-pointer w-full"
                >
                  <Shield className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  <span>Aviso de Privacidad</span>
                </button>
              </li>
              <li>
                <Link href="/panel" className="py-2.5 min-h-[44px] text-[#D1D5DB] hover:text-[var(--color-accent)] transition flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  <span>Panel del Asesor (CRM)</span>
                </Link>
              </li>
              <li className="pt-2 text-xs text-[#D1D5DB]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[var(--color-accent)]" />
                  <span>{commercialConfig.coverageZone}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes y Contacto */}
          <div className="space-y-3">
            <span className="label-caps text-[#F0ECE4] text-[10px] block">Redes y Contacto</span>

            {hasSocial && (
              <div className="space-y-2">
                <p className="text-xs text-[#D1D5DB]">Síguenos en nuestras redes:</p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {social?.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-[#1877F2] text-[#D1D5DB] hover:text-white flex items-center justify-center transition">
                      <FacebookIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-pink-600 text-[#D1D5DB] hover:text-white flex items-center justify-center transition">
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.tiktok && (
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" aria-label="TikTok"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-black text-[#D1D5DB] hover:text-white flex items-center justify-center transition">
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.youtube && (
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube"
                      className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-red-600 text-[#D1D5DB] hover:text-white flex items-center justify-center transition">
                      <YouTubeIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <a
                href={buildWhatsAppLink(commercialConfig.contactChannels.whatsapp, commercialConfig.landing.whatsappDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 min-h-[44px] inline-flex items-center gap-2 text-[#25D366] hover:text-[#4ADE80] transition font-semibold text-xs"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp: {commercialConfig.contactChannels.phone}</span>
              </a>
              {commercialConfig.contactChannels.email && (
                <div>
                  <a
                    href={`mailto:${commercialConfig.contactChannels.email}`}
                    className="py-2 min-h-[44px] inline-flex items-center gap-2 text-[#D1D5DB] hover:text-white transition text-xs"
                  >
                    <Mail className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>{commercialConfig.contactChannels.email}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descargos */}
        <div className="pt-6 border-t border-white/10 text-xs text-[#9CA3AF] space-y-2">
          <p>
            {commercialConfig.landing.footerDisclaimer}
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 text-xs text-[#D1D5DB]">
            <div className="flex flex-wrap items-center gap-3">
              <span>© {new Date().getFullYear()} {commercialConfig.agencyName}.</span>
              <span className="hidden sm:inline text-white/20">·</span>
              <Link
                href="/panel"
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-[#D1D5DB] hover:text-[var(--color-accent)] transition border border-white/10 text-xs tracking-wide"
                title="Acceso exclusivo al panel de gestión del asesor"
              >
                <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Acceso Asesor (Panel)</span>
              </Link>
            </div>
            <span>Atención asignada a: {commercialConfig.advisorName} ({commercialConfig.advisorRole}).</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
