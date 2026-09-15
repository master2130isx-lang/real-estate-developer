'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Shield, UserCheck, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/common/SocialIcons';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
  const { commercialConfig } = useApp();
  const social = commercialConfig.socialLinks;
  const hasSocial = Boolean(social?.facebook || social?.instagram || social?.tiktok || social?.youtube);
  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  return (
    <footer className="bg-[var(--color-navy-deep)] text-[#9CA3AF] text-xs py-14 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-[1220px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
              </div>
              <span className="font-serif text-base font-bold tracking-tight text-[#F0ECE4]">
                {commercialConfig.agencyName}
              </span>
            </div>
            <p className="text-[#8A847C] text-xs leading-relaxed">
              Plataforma de asesoría inmobiliaria personalizada, catálogo de vivienda y acompañamiento integral para tu crédito Infonavit o bancario.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-2.5">
            <span className="label-caps text-[#F0ECE4] text-[10px] block">Navegación</span>
            <ul className="space-y-1.5">
              <li><a href="#opciones" className="hover:text-[var(--color-accent)] transition">Residencias</a></li>
              <li><a href="#como-funciona" className="hover:text-[var(--color-accent)] transition">Cómo Funciona</a></li>
              <li><a href="#asesor" className="hover:text-[var(--color-accent)] transition">Atención</a></li>
              <li><a href="#ubicacion" className="hover:text-[var(--color-accent)] transition">Ubicación</a></li>
              <li><a href="#preguntas" className="hover:text-[var(--color-accent)] transition">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Columna 3: Seguridad y Panel */}
          <div className="space-y-2.5">
            <span className="label-caps text-[#F0ECE4] text-[10px] block">Seguridad y Acceso</span>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-[var(--color-accent)] text-left transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Aviso de Privacidad</span>
                </button>
              </li>
              <li>
                <Link href="/panel" className="hover:text-[var(--color-accent)] transition flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Panel del Asesor (CRM)</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-[#6B7280]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{commercialConfig.coverageZone}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes y Contacto */}
          <div className="space-y-3">
            <span className="label-caps text-[#F0ECE4] text-[10px] block">Redes y Contacto</span>

            {hasSocial && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#6B7280]">Síguenos en nuestras redes:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {social?.facebook && (
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                      className="w-8 h-8 rounded bg-white/8 hover:bg-[#1877F2] text-[#9CA3AF] hover:text-white flex items-center justify-center transition">
                      <FacebookIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.instagram && (
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                      className="w-8 h-8 rounded bg-white/8 hover:bg-pink-600 text-[#9CA3AF] hover:text-white flex items-center justify-center transition">
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.tiktok && (
                    <a href={social.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"
                      className="w-8 h-8 rounded bg-white/8 hover:bg-black text-[#9CA3AF] hover:text-white flex items-center justify-center transition">
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.youtube && (
                    <a href={social.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"
                      className="w-8 h-8 rounded bg-white/8 hover:bg-red-600 text-[#9CA3AF] hover:text-white flex items-center justify-center transition">
                      <YouTubeIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1 text-xs">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, me comunico desde su sitio web para solicitar informes.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#25D366] hover:text-[#4ADE80] transition font-semibold"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp: {commercialConfig.contactChannels.phone}</span>
              </a>
              {commercialConfig.contactChannels.email && (
                <a
                  href={`mailto:${commercialConfig.contactChannels.email}`}
                  className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#9CA3AF] transition text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{commercialConfig.contactChannels.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Descargos */}
        <div className="pt-6 border-t border-white/8 text-[11px] text-[#5A5650] space-y-2">
          <p>
            * Los precios y especificaciones mostrados son recursos de referencia ilustrativos para la evaluación técnica del prototipo. Los gastos notariales y de escrituración varían según la legislación y el municipio aplicable.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-[10px] text-[#4B4841]">
            <span>© {new Date().getFullYear()} {commercialConfig.agencyName}. Prototipo Fase 1.1.</span>
            <span>Atención asignada a: {commercialConfig.advisorName} ({commercialConfig.advisorRole}).</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
