'use client';

import React from 'react';
import { UserCheck, MapPin, Phone, Mail, Clock, HelpCircle, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from '@/components/common/SocialIcons';

export function AdvisorTrust() {
  const { commercialConfig } = useApp();
  const social = commercialConfig.socialLinks;
  const hasSocial = Boolean(social?.facebook || social?.instagram || social?.tiktok || social?.youtube);
  const cleanWa = commercialConfig.contactChannels.whatsapp.replace(/\D/g, '');

  const initials = commercialConfig.advisorName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AS';

  return (
    <section id="asesor" className="py-20 px-4 sm:px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
      <div className="max-w-[1220px] mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="label-caps text-[var(--color-accent)]">
            Atención humana y personalizada
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-navy)] leading-tight">
            ¿Quién atenderá tu solicitud?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">
            Tu solicitud es revisada directamente por un asesor asignado que coordinará contigo la visita por WhatsApp o llamada telefónica.
          </p>
        </div>

        <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Tarjeta del asesor */}
            <div className="lg:col-span-5 bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-[var(--color-navy)] dark:bg-[var(--color-surface-alt)] text-white dark:text-[var(--color-accent)] flex items-center justify-center font-serif font-bold text-2xl flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{commercialConfig.advisorRole}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-navy)] leading-tight">
                    {commercialConfig.advisorName}
                  </h3>
                  <span className="label-caps inline-block mt-1 text-[var(--color-success)] text-[9px]">
                    Atención personalizada
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--color-navy)]">Zona de atención:</strong> {commercialConfig.coverageZone}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--color-navy)]">Contacto:</strong> {commercialConfig.contactChannels.phone} (WhatsApp y llamadas).
                  </span>
                </div>
                {commercialConfig.contactChannels.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[var(--color-navy)]">Correo:</strong> {commercialConfig.contactChannels.email}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--color-navy)]">Visitas:</strong> Previa cita confirmada por WhatsApp.
                  </span>
                </div>

                {hasSocial && (
                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="label-caps text-[var(--color-text-muted)] text-[9px]">Redes</span>
                    <div className="flex items-center gap-1.5">
                      {social?.facebook && (
                        <a href={social.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"
                          className="w-7 h-7 rounded bg-[var(--color-bg)] hover:bg-[#1877F2] text-[var(--color-text-muted)] hover:text-white flex items-center justify-center transition">
                          <FacebookIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.instagram && (
                        <a href={social.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                          className="w-7 h-7 rounded bg-[var(--color-bg)] hover:bg-pink-600 text-[var(--color-text-muted)] hover:text-white flex items-center justify-center transition">
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.tiktok && (
                        <a href={social.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"
                          className="w-7 h-7 rounded bg-[var(--color-bg)] hover:bg-black text-[var(--color-text-muted)] hover:text-white flex items-center justify-center transition">
                          <TikTokIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {social?.youtube && (
                        <a href={social.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"
                          className="w-7 h-7 rounded bg-[var(--color-bg)] hover:bg-red-600 text-[var(--color-text-muted)] hover:text-white flex items-center justify-center transition">
                          <YouTubeIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, me gustaría platicar con un asesor sobre el Modelo Águila Premier en Valle de los Encinos.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2.5 px-3 rounded text-xs transition flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Contactar por WhatsApp ({commercialConfig.contactChannels.phone})</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Compromisos */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[var(--color-navy)]">
                Criterios de atención y claridad para el comprador
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Priorizamos conversaciones útiles y transparentes. No utilizamos llamadas no solicitadas ni presionamos con falsas ofertas de urgencia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Info, color: 'text-blue-600 dark:text-blue-400', title: 'Visitas con confirmación manual', desc: 'Tu asesor valida la agenda y te contacta por WhatsApp para coordinar el horario sin sobrecupos.' },
                  { icon: Info, color: 'text-blue-600 dark:text-blue-400', title: 'NSS con finalidad específica', desc: 'Se utiliza para registrar la atención ante la inmobiliaria; no autoriza consultas crediticias ni te compromete a comprar.' },
                  { icon: HelpCircle, color: 'text-[var(--color-accent)]', title: 'Orientación preliminar', desc: 'Si aún no decides tu esquema de compra, puedes solicitar información sin entregar el NSS.' },
                  { icon: Info, color: 'text-blue-600 dark:text-blue-400', title: 'Gastos transparentes', desc: 'Te informamos sobre avalúo, derechos y gastos notariales antes de cualquier pago o apartado.' },
                ].map(({ icon: Icon, color, title, desc }, i) => (
                  <div key={i} className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)] text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--color-navy)]">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span>{title}</span>
                    </div>
                    <p className="text-[var(--color-text-muted)]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
