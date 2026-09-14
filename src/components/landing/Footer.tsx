'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
  return (
    <footer className="bg-[#071526] text-slate-400 text-xs py-12 px-4 border-t border-slate-800">
      <div className="max-w-[1220px] mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca y Nota de Demostración */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-base font-bold tracking-tight">
                {COMMERCIAL_CONFIG.agencyName}
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Prototipo de captación y precalificación inmobiliaria. Catálogo ilustrativo con precios de referencia y atención personalizada.
            </p>
            <div className="flex items-center gap-1.5 text-amber-400/90 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Modo Demostración (Fase 1.1). No ingresar datos personales reales.</span>
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
                <a href="#preguntas" className="hover:text-slate-200 transition">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Seguridad y Panel Demo */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Seguridad y Acceso</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-amber-400 text-left transition flex items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aviso de Privacidad (Borrador LFPDPPP)</span>
                </button>
              </li>
              <li>
                <Link
                  href="/panel"
                  className="hover:text-amber-400 transition flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panel del Asesor (Demo)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Descargos y notas */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <p>
            * Los precios y especificaciones mostrados son recursos de referencia ilustrativos para la evaluación técnica del prototipo. Los gastos notariales y de escrituración varían según la legislación y el municipio aplicable.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 text-[10px] text-slate-600">
            <span>© {new Date().getFullYear()} {COMMERCIAL_CONFIG.agencyName}. Prototipo Fase 1.1.</span>
            <span>Atribución de comisión de 15 días sujeta al mecanismo interno de la inmobiliaria.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
