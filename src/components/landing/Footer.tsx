'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Shield, UserCheck, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
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
    <footer className="bg-[#071526] text-slate-400 text-xs py-12 px-4 border-t border-slate-800">
      <div className="max-w-[1220px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Marca y Nota */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-base font-bold tracking-tight">
                {commercialConfig.agencyName}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plataforma de asesoría inmobiliaria personalizada, catálogo de vivienda y acompañamiento integral para tu crédito Infonavit o bancario.
            </p>
            <div className="flex items-center gap-1.5 text-amber-400/90 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Atención con previa cita en caseta principal.</span>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Navegación</h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#opciones" className="hover:text-slate-200 transition">
                  Propiedades
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-slate-200 transition">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#asesor" className="hover:text-slate-200 transition">
                  Atención del Asesor
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-slate-200 transition">
                  Ubicación y Cómo Llegar
                </a>
              </li>
              <li>
                <a href="#preguntas" className="hover:text-slate-200 transition">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Seguridad y Panel */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Seguridad y Acceso</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-amber-400 text-left transition flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aviso de Privacidad (LFPDPPP)</span>
                </button>
              </li>
              <li>
                <Link
                  href="/panel"
                  className="hover:text-amber-400 transition flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panel del Asesor (CRM)</span>
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{commercialConfig.coverageZone}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes Sociales y Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Redes y Contacto</h4>
            
            {/* Redes Sociales Dinámicas */}
            {hasSocial && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400">Síguenos en nuestras redes:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {social?.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#1877F2] text-slate-200 hover:text-white flex items-center justify-center transition shadow-sm"
                    >
                      <FacebookIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-slate-200 hover:text-white flex items-center justify-center transition shadow-sm"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.tiktok && (
                    <a
                      href={social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="TikTok"
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-black text-slate-200 hover:text-[#25F4EE] flex items-center justify-center transition shadow-sm border border-transparent hover:border-slate-600"
                    >
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                  )}
                  {social?.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="YouTube"
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#FF0000] text-slate-200 hover:text-white flex items-center justify-center transition shadow-sm"
                    >
                      <YouTubeIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Canales de Contacto */}
            <div className="space-y-1.5 pt-1 text-xs">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, me comunico desde su sitio web para solicitar informes.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition font-semibold"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: {commercialConfig.contactChannels.phone}</span>
              </a>
              {commercialConfig.contactChannels.email && (
                <a
                  href={`mailto:${commercialConfig.contactChannels.email}`}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{commercialConfig.contactChannels.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Descargos y notas */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <p>
            * Los precios y especificaciones mostrados son recursos de referencia ilustrativos para la evaluación técnica del prototipo. Los gastos notariales y de escrituración varían según la legislación y el municipio aplicable.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-[10px] text-slate-600">
            <span>© {new Date().getFullYear()} {commercialConfig.agencyName}. Prototipo Fase 1.1.</span>
            <span>Atención asignada a: {commercialConfig.advisorName} ({commercialConfig.advisorRole}).</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
