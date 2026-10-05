'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  User,
  Phone,
  Mail,
  Building2,
  Share2,
  Send,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Database,
  RefreshCw,
  Info,
  Star,
  Smartphone,
  Plus,
  Trash2,
  Lock,
  LayoutTemplate,
  CalendarClock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { DeveloperPurgeModal } from './DeveloperPurgeModal';
import { COMMERCIAL_CONFIG, DEFAULT_VISIT_HOURS, LandingContent, TelegramRecipient } from '@/config/commercialConfig';
import { getErrorMessage } from '@/lib/errors';

interface CommercialSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialSettingsModal({ isOpen, onClose }: CommercialSettingsModalProps) {
  const { commercialConfig, updateCommercialConfig, properties } = useApp();

  const [activeTab, setActiveTab] = useState<
    'advisor' | 'social' | 'development' | 'landing' | 'agenda' | 'telegram' | 'database'
  >('advisor');

  // Landing (textos editables por fraccionamiento / campaña)
  const [landing, setLanding] = useState<LandingContent>(() => ({ ...commercialConfig.landing }));
  const setLandingField = <K extends keyof LandingContent>(key: K, value: LandingContent[K]) =>
    setLanding((prev) => ({ ...prev, [key]: value }));

  // Agenda y reglas de atribución
  const [visitHours, setVisitHours] = useState<string[]>(() => [...commercialConfig.schedule.visitHours]);
  const [newVisitHour, setNewVisitHour] = useState('');
  const [durationDays, setDurationDays] = useState<number>(commercialConfig.attributionRules.durationDays);
  const [saveError, setSaveError] = useState('');

  // Usuario del bot (se consulta a Telegram)
  const [botUsername, setBotUsername] = useState('');
  useEffect(() => {
    fetch('/api/telegram/test')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBotUsername(data?.ok ? data.username : ''))
      .catch(() => {});
  }, []);
  const botHandle = botUsername ? `@${botUsername}` : 'tu bot de alertas';

  // Estados locales para edición
  const [advisorName, setAdvisorName] = useState(commercialConfig.advisorName);
  const [advisorRole, setAdvisorRole] = useState(commercialConfig.advisorRole);
  const [phone, setPhone] = useState(commercialConfig.contactChannels.phone);
  const [whatsapp, setWhatsapp] = useState(commercialConfig.contactChannels.whatsapp);
  const [email, setEmail] = useState(commercialConfig.contactChannels.email);

  // Redes sociales
  const [facebook, setFacebook] = useState(commercialConfig.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(commercialConfig.socialLinks?.instagram || '');
  const [tiktok, setTiktok] = useState(commercialConfig.socialLinks?.tiktok || '');
  const [youtube, setYoutube] = useState(commercialConfig.socialLinks?.youtube || '');

  // Desarrollo / Inmobiliaria
  const [agencyName, setAgencyName] = useState(commercialConfig.agencyName);
  const [coverageZone, setCoverageZone] = useState(commercialConfig.coverageZone);
  const [officeAddressNote, setOfficeAddressNote] = useState(commercialConfig.contactChannels.officeAddressNote);
  const [amountFormatted, setAmountFormatted] = useState(commercialConfig.featuredPrice.amountFormatted);
  const [heroPropertyId, setHeroPropertyId] = useState(commercialConfig.heroPropertyId || properties[0]?.id || '');

  // Telegram
  const [advisorChatId, setAdvisorChatId] = useState(commercialConfig.telegramConfig?.advisorChatId || '');

  // Directorio de Destinatarios de Telegram con Alias
  const [recipients, setRecipients] = useState<TelegramRecipient[]>(() => {
    if (commercialConfig.telegramConfig?.recipients && commercialConfig.telegramConfig.recipients.length > 0) {
      return commercialConfig.telegramConfig.recipients;
    }
    const legacyChatId = commercialConfig.telegramConfig?.advisorChatId || '';
    if (!legacyChatId) return [];
    return [
      {
        id: 'rec-dev',
        alias: 'Asesor principal',
        chatId: legacyChatId,
        isActive: true,
        createdAt: '2026-09-26',
      },
    ];
  });

  const [newAlias, setNewAlias] = useState('');
  const [newChatId, setNewChatId] = useState('');
  const [newSetAsActive, setNewSetAsActive] = useState(false);
  const [testRecipientStatus, setTestRecipientStatus] = useState<{ [id: string]: 'loading' | 'success' | 'error' }>({});
  const [testRecipientError, setTestRecipientError] = useState<{ [id: string]: string }>({});

  const handleSetActiveRecipient = async (id: string) => {
    const updated = recipients.map((r) => ({
      ...r,
      isActive: r.id === id,
    }));
    setRecipients(updated);
    const active = updated.find((r) => r.id === id);
    if (active) {
      setAdvisorChatId(active.chatId);
      await updateCommercialConfig({
        telegramConfig: {
          ...commercialConfig.telegramConfig,
          advisorChatId: active.chatId,
          activeChatId: active.chatId,
          recipients: updated,
        },
      });
    }
  };

  const handleAddRecipient = async () => {
    if (!newAlias.trim() || !newChatId.trim()) return;
    const cleanChat = newChatId.trim();
    const cleanName = newAlias.trim();
    const shouldBeActive = newSetAsActive || recipients.length === 0;

    const newRec: TelegramRecipient = {
      id: `rec-${Date.now().toString(36)}`,
      alias: cleanName,
      chatId: cleanChat,
      isActive: shouldBeActive,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = shouldBeActive
      ? [...recipients.map((r) => ({ ...r, isActive: false })), newRec]
      : [...recipients, newRec];

    setRecipients(updated);
    setNewAlias('');
    setNewChatId('');
    setNewSetAsActive(false);

    if (shouldBeActive) {
      setAdvisorChatId(cleanChat);
    }

    await updateCommercialConfig({
      telegramConfig: {
        ...commercialConfig.telegramConfig,
        advisorChatId: shouldBeActive ? cleanChat : (recipients.find((r) => r.isActive)?.chatId || cleanChat),
        activeChatId: shouldBeActive ? cleanChat : (recipients.find((r) => r.isActive)?.chatId || cleanChat),
        recipients: updated,
      },
    });
  };

  const handleRemoveRecipient = async (id: string) => {
    if (recipients.length <= 1) {
      alert('Debes mantener al menos un destinatario registrado en la lista.');
      return;
    }
    const filtered = recipients.filter((r) => r.id !== id);
    let updated = filtered;
    if (!filtered.some((r) => r.isActive) && filtered.length > 0) {
      updated = filtered.map((r, i) => (i === 0 ? { ...r, isActive: true } : r));
      setAdvisorChatId(updated[0].chatId);
    }
    setRecipients(updated);

    await updateCommercialConfig({
      telegramConfig: {
        ...commercialConfig.telegramConfig,
        advisorChatId: updated.find((r) => r.isActive)?.chatId,
        activeChatId: updated.find((r) => r.isActive)?.chatId,
        recipients: updated,
      },
    });
  };

  const handleTestRecipient = async (rec: TelegramRecipient) => {
    setTestRecipientStatus((prev) => ({ ...prev, [rec.id]: 'loading' }));
    setTestRecipientError((prev) => ({ ...prev, [rec.id]: '' }));

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: rec.chatId,
          alias: rec.alias,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestRecipientStatus((prev) => ({ ...prev, [rec.id]: 'success' }));
        setTimeout(() => {
          setTestRecipientStatus((prev) => {
            const next = { ...prev };
            delete next[rec.id];
            return next;
          });
        }, 3500);
      } else {
        setTestRecipientStatus((prev) => ({ ...prev, [rec.id]: 'error' }));
        setTestRecipientError((prev) => ({ ...prev, [rec.id]: data.error || 'Fallo de envío' }));
      }
    } catch (err) {
      setTestRecipientStatus((prev) => ({ ...prev, [rec.id]: 'error' }));
      setTestRecipientError((prev) => ({ ...prev, [rec.id]: getErrorMessage(err, 'Error de red') }));
    }
  };

  // Diagnóstico de Base de Datos (Supabase)
  const [dbStatusData, setDbStatusData] = useState<DbStatus | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [isDeveloperPurgeOpen, setIsDeveloperPurgeOpen] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const checkDbStatus = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatusData(data);
    } catch (e) {
      setDbStatusData({ ok: false, error: getErrorMessage(e) });
    } finally {
      setDbLoading(false);
    }
  };

  // Consultar el diagnóstico la primera vez que se abre la pestaña Base de Datos
  const shouldLoadDbStatus = activeTab === 'database' && !dbStatusData && !dbLoading;
  useEffect(() => {
    if (shouldLoadDbStatus) checkDbStatus();
  }, [shouldLoadDbStatus]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaveError('');
    if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) {
      setActiveTab('agenda');
      setSaveError('Los días de atribución deben estar entre 1 y 365.');
      return;
    }
    if (visitHours.length === 0) {
      setActiveTab('agenda');
      setSaveError('Agrega al menos un horario de visita.');
      return;
    }

    // Limpiar número de whatsapp (quitar signos +, espacios o guiones para formato internacional)
    const cleanWa = whatsapp.replace(/\D/g, '');

    const saved = await updateCommercialConfig({
      landing: {
        ...landing,
        connectivity: landing.connectivity.filter((c) => c.title.trim() || c.description.trim()),
      },
      schedule: { ...commercialConfig.schedule, visitHours },
      attributionRules: { ...commercialConfig.attributionRules, durationDays: Math.round(durationDays) },
      advisorName: advisorName.trim(),
      advisorRole: advisorRole.trim(),
      heroPropertyId: heroPropertyId || undefined,
      agencyName: agencyName.trim(),
      coverageZone: coverageZone.trim(),
      contactChannels: {
        phone: phone.trim(),
        whatsapp: cleanWa,
        email: email.trim(),
        officeAddressNote: officeAddressNote.trim(),
      },
      socialLinks: {
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
        youtube: youtube.trim(),
      },
      telegramConfig: {
        advisorChatId: recipients.find((r) => r.isActive)?.chatId || advisorChatId.trim(),
        activeChatId: recipients.find((r) => r.isActive)?.chatId || advisorChatId.trim(),
        recipients,
      },
      featuredPrice: {
        ...commercialConfig.featuredPrice,
        amountFormatted: amountFormatted.trim(),
      },
    });

    if (!saved) {
      setSaveError('No se pudo guardar en el servidor. Revisa tu conexión e inténtalo de nuevo.');
      return;
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera Fija (Pinned Header) */}
        <div className="p-5 sm:p-6 pb-0 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-2.5 text-[#0d233a]">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span>Configuración Comercial y Plataforma</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    White-Label
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Personaliza asesor, teléfonos, redes sociales, bot móvil y base de datos en la nube
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pestañas de Ajustes */}
          <div className="flex items-center justify-between gap-1 pt-1 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('advisor')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'advisor'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Asesor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'social'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Redes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('development')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'development'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Inmobiliaria</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'landing'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('telegram')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'telegram'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>Telegram</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`pb-2 px-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'database'
                  ? 'border-[#0d233a] text-[#0d233a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Base de Datos</span>
            </button>
          </div>
        </div>

        {/* Formulario y Contenedor con Scroll Interno Suave */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">

          {/* TAB 1: ASESOR Y TELÉFONOS */}
          {activeTab === 'advisor' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Asesor Inmobiliario *
                  </label>
                  <input
                    type="text"
                    required
                    value={advisorName}
                    onChange={(e) => setAdvisorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-medium"
                  />
                  <span className="text-[10px] text-slate-400">Aparece en mensajes y presentación</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo / Certificación
                  </label>
                  <input
                    type="text"
                    value={advisorRole}
                    onChange={(e) => setAdvisorRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/60">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp Comercial (Solo Dígitos) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej. 523342546271 o 3342546271"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">
                    Actualiza el botón flotante, enlaces web y mensajes
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Teléfono Visible para Llamadas</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 33 4254 6271"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo Electrónico de Atención</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asesoria@tuinmobiliaria.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: REDES SOCIALES */}
          {activeTab === 'social' && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs text-slate-600">
                💡 <strong>Visibilidad Dinámica:</strong> Los iconos de redes sociales se muestran en el Footer y Navbar únicamente si agregas su enlace. Si dejas el campo vacío, se ocultará de forma limpia.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facebook (Página o Perfil)
                  </label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/tu-pagina"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instagram (Perfil)
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/tu-usuario"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    TikTok (Perfil de Video)
                  </label>
                  <input
                    type="url"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@tu-usuario"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    YouTube (Canal de Recorridos)
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/@tu-canal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INMOBILIARIA Y FRACCIONAMIENTO */}
          {activeTab === 'development' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Fraccionamiento / Desarrollo
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zona / Municipio
                  </label>
                  <input
                    type="text"
                    value={coverageZone}
                    onChange={(e) => setCoverageZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dirección de Punto de Reunión (Caseta / Oficinas)</span>
                </label>
                <input
                  type="text"
                  value={officeAddressNote}
                  onChange={(e) => setOfficeAddressNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingsInput
                  label="Dirección para Google Maps / Waze"
                  value={landing.mapQuery}
                  onChange={(v) => setLandingField('mapQuery', v)}
                  placeholder="Calle, colonia, municipio, estado"
                  hint="Vacío = se usa la dirección del punto de reunión."
                />
                <SettingsInput
                  label="Punto de reunión (nombre corto)"
                  value={landing.meetingPoint}
                  onChange={(v) => setLandingField('meetingPoint', v)}
                  placeholder="Ej. Caseta de acceso, Oficina de ventas"
                />
              </div>
              <SettingsInput
                label="Distintivo sobre el mapa"
                value={landing.accessBadge}
                onChange={(v) => setLandingField('accessBadge', v)}
                placeholder="Ej. Caseta 24/7 (vacío = no se muestra)"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio de Referencia (para mensajes de WhatsApp sin modelo asignado)
                </label>
                <input
                  type="text"
                  value={amountFormatted}
                  onChange={(e) => setAmountFormatted(e.target.value)}
                  placeholder="$0,000,000 MXN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Modelo de Casa en Portada (Hero Principal)</span>
                </label>
                <select
                  value={heroPropertyId}
                  onChange={(e) => setHeroPropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-medium bg-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.model} — {p.priceFormatted || `$${p.price.toLocaleString('es-MX')} MXN`}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  La fotografía de fachada, el nombre de este modelo y su precio se mostrarán en la portada principal de la web.
                </p>
              </div>
            </div>
          )}

          {/* TAB: CONTENIDO DE LA LANDING */}
          {activeTab === 'landing' && (
            <div className="space-y-4">
              <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3">
                Estos textos aparecen en la página pública. Cámbialos cada vez que promuevas un nuevo fraccionamiento o campaña.
                Los cambios se publican al guardar.
              </p>

              <fieldset className="space-y-3">
                <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Portada</legend>
                <SettingsInput
                  label="Cintillo superior"
                  value={landing.topBarText}
                  onChange={(v) => setLandingField('topBarText', v)}
                  placeholder={`Vacío = "Visitas privadas · ${coverageZone}"`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SettingsInput label="Etiqueta superior" value={landing.heroEyebrow} onChange={(v) => setLandingField('heroEyebrow', v)} />
                  <SettingsInput label="Texto del botón principal" value={landing.heroCtaLabel} onChange={(v) => setLandingField('heroCtaLabel', v)} />
                  <SettingsInput label="Título (parte normal)" value={landing.heroTitle} onChange={(v) => setLandingField('heroTitle', v)} />
                  <SettingsInput label="Título (parte destacada en cursiva)" value={landing.heroTitleHighlight} onChange={(v) => setLandingField('heroTitleHighlight', v)} />
                </div>
                <SettingsTextarea label="Descripción de portada" value={landing.heroDescription} onChange={(v) => setLandingField('heroDescription', v)} />
                <SettingsInput label="Placa sobre la foto" value={landing.heroBadge} onChange={(v) => setLandingField('heroBadge', v)} placeholder="Ej. Casa Muestra en Exhibición" />
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Modelos y contacto</legend>
                <SettingsTextarea label="Introducción de la sección de modelos" value={landing.propertiesIntro} onChange={(v) => setLandingField('propertiesIntro', v)} />
                <SettingsTextarea
                  label="Mensaje predeterminado de WhatsApp"
                  value={landing.whatsappDefaultMessage}
                  onChange={(v) => setLandingField('whatsappDefaultMessage', v)}
                  hint="Es el texto que se precarga cuando un visitante toca cualquier botón de WhatsApp."
                />
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Conectividad y servicios cercanos</legend>
                {landing.connectivity.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-start">
                    <input
                      type="text"
                      value={item.title}
                      aria-label={`Título ${index + 1}`}
                      onChange={(e) =>
                        setLandingField(
                          'connectivity',
                          landing.connectivity.map((c, i) => (i === index ? { ...c, title: e.target.value } : c))
                        )
                      }
                      placeholder="Ej. Vialidades principales"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.description}
                      aria-label={`Descripción ${index + 1}`}
                      onChange={(e) =>
                        setLandingField(
                          'connectivity',
                          landing.connectivity.map((c, i) => (i === index ? { ...c, description: e.target.value } : c))
                        )
                      }
                      placeholder="Ej. A 5 minutos de la carretera principal"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setLandingField('connectivity', landing.connectivity.filter((_, i) => i !== index))}
                      className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setLandingField('connectivity', [...landing.connectivity, { title: '', description: '' }])}
                  className="text-xs font-semibold text-[#0d233a] flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar punto de conectividad
                </button>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pie de página y buscadores (SEO)</legend>
                <SettingsTextarea label="Descripción en el pie de página" value={landing.footerDescription} onChange={(v) => setLandingField('footerDescription', v)} />
                <SettingsTextarea label="Aviso legal / descargo" value={landing.footerDisclaimer} onChange={(v) => setLandingField('footerDisclaimer', v)} />
                <SettingsInput label="Título en Google y pestaña del navegador" value={landing.seoTitle} onChange={(v) => setLandingField('seoTitle', v)} />
                <SettingsTextarea label="Descripción en Google" value={landing.seoDescription} onChange={(v) => setLandingField('seoDescription', v)} />
              </fieldset>

              <button
                type="button"
                onClick={() => setLanding({ ...COMMERCIAL_CONFIG.landing })}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Restaurar textos predeterminados
              </button>
            </div>
          )}

          {/* TAB: AGENDA Y REGLAS */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Horarios disponibles para visitas</label>
                <div className="flex flex-wrap gap-1.5">
                  {visitHours.map((hour) => (
                    <span key={hour} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-1 py-1 text-xs font-semibold">
                      {hour}
                      <button
                        type="button"
                        onClick={() => setVisitHours(visitHours.filter((h) => h !== hour))}
                        className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        aria-label={`Quitar ${hour}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="time"
                    value={newVisitHour}
                    onChange={(e) => setNewVisitHour(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!newVisitHour}
                    onClick={() => {
                      const formatted = formatHour12(newVisitHour);
                      if (!visitHours.includes(formatted)) setVisitHours(sortHours([...visitHours, formatted]));
                      setNewVisitHour('');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#0d233a] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar horario
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitHours([...DEFAULT_VISIT_HOURS])}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-600 cursor-pointer"
                  >
                    Restaurar
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Se usan en el formulario de la landing, en /registro y al agendar desde el panel.</p>
              </div>

              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Días de atribución con la inmobiliaria</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={durationDays || ''}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Vigencia que inicia al confirmar el registro en la inmobiliaria. Aplica a las confirmaciones nuevas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BOT DE TELEGRAM & DIRECTORIO DE DESTINATARIOS */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              {/* Tarjeta Destacada del Destinatario Activo */}
              {(() => {
                const activeRec = recipients.find((r) => r.isActive) || recipients[0];
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            Destino Activo en Vivo:
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            Recibiendo Alertas
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{activeRec?.alias || 'Asesor Principal'}</span>
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900">
                            ID: {activeRec?.chatId || advisorChatId}
                          </span>
                        </h3>
                      </div>
                    </div>

                    {activeRec && (
                      <button
                        type="button"
                        onClick={() => handleTestRecipient(activeRec)}
                        disabled={testRecipientStatus[activeRec.id] === 'loading'}
                        className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {testRecipientStatus[activeRec.id] === 'loading'
                            ? 'Enviando...'
                            : testRecipientStatus[activeRec.id] === 'success'
                            ? '¡Enviado!'
                            : 'Probar Alerta Activa'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Directorio de Chat IDs Guardados (Alternar a voluntad) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Directorio de Destinatarios de Telegram</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {recipients.length} {recipients.length === 1 ? 'guardado' : 'guardados'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Alterna con 1 solo clic quién recibe las notificaciones de clientes según estés en pruebas o en producción.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {recipients.map((rec) => {
                    const isTesting = testRecipientStatus[rec.id] === 'loading';
                    const isSuccess = testRecipientStatus[rec.id] === 'success';
                    const hasError = testRecipientStatus[rec.id] === 'error';

                    return (
                      <div
                        key={rec.id}
                        className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                          rec.isActive
                            ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                              rec.isActive
                                ? 'bg-emerald-100 text-emerald-800 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{rec.alias}</span>
                              {rec.isActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✓ Activo
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              Chat ID: <span className="font-bold text-slate-700">{rec.chatId}</span>
                            </span>
                          </div>
                        </div>

                        {/* Botones de Acción por Fila */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {!rec.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleSetActiveRecipient(rec.id)}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <span>Activar</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200">
                              En servicio
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleTestRecipient(rec)}
                            disabled={isTesting}
                            title="Enviar mensaje de prueba a este Chat ID"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3 text-sky-600" />
                            <span>
                              {isTesting ? 'Probando...' : isSuccess ? '¡Exitoso!' : 'Probar'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(rec.id)}
                            disabled={recipients.length <= 1}
                            title={
                              recipients.length <= 1
                                ? 'No puedes eliminar el único destinatario'
                                : 'Eliminar de la lista'
                            }
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {hasError && (
                          <div className="w-full text-[10px] text-rose-600 font-semibold px-2 py-1 bg-rose-50 rounded-lg border border-rose-200 mt-1">
                            Error: {testRecipientError[rec.id]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Formulario para Agregar Nuevo Destinatario */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#0d233a]" />
                    <span>Agregar Nuevo Destinatario / Agente</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={newAlias}
                        onChange={(e) => setNewAlias(e.target.value)}
                        placeholder="Alias (ej. Asesor Carlos Cantú)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newChatId}
                        onChange={(e) => setNewChatId(e.target.value)}
                        placeholder="Chat ID (ej. 987654321)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSetAsActive}
                        onChange={(e) => setNewSetAsActive(e.target.checked)}
                        className="rounded text-[#0d233a] focus:ring-0"
                      />
                      <span>Establecer como destino activo de inmediato</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddRecipient}
                      disabled={!newAlias.trim() || !newChatId.trim()}
                      className="bg-[#0d233a] hover:bg-[#163b5c] disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Guardar en Lista</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Explicación Amigable sobre Teléfono vs Chat ID de Telegram */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-900">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>¿Cómo obtener el Chat ID de un nuevo asesor en 30 segundos?</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700 leading-relaxed">
                  <li>
                    Pide al asesor que en su celular abra Telegram, busque el bot <strong>@userinfobot</strong> y pulse Iniciar. Le responderá su número de <strong>Id</strong> (ej. <code>123456789</code>).
                  </li>
                  <li>
                    Pídele que también abra <strong>{botHandle}</strong> y presione <strong>Iniciar / Start</strong> (requisito para que Telegram permita enviarle mensajes).
                  </li>
                  <li>
                    Escribe su nombre y su ID arriba y pulsa <strong>Guardar en Lista</strong>. ¡Podrás alternar a su número cuando desees!
                  </li>
                </ol>
              </div>

              {/* Bot Oficial Verificado y Conectado en Segundo Plano */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>Bot Oficial de Alertas:</span>
                    <span className="font-mono text-emerald-800 font-bold">{botHandle}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Botones interactivos de aprobación y cancelación activos 24/7 en la nube.
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 flex items-center gap-1 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Conectado en Producción
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: BASE DE DATOS (SUPABASE) */}
          {activeTab === 'database' && (
            <div className="space-y-3.5">
              {/* Card de Estado de Salud de la Base de Datos */}
              <div className="p-3.5 rounded-2xl border transition bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800">
                      Estado de la Base de Datos en la Nube
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={checkDbStatus}
                    disabled={dbLoading}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${dbLoading ? 'animate-spin' : ''}`} />
                    <span>{dbLoading ? 'Verificando...' : 'Comprobar'}</span>
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                  {dbLoading && !dbStatusData && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      <span>Auditando estado de la conexión...</span>
                    </p>
                  )}

                  {dbStatusData && (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        {dbStatusData.provider === 'supabase' && dbStatusData.status === 'connected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Conectado a Supabase PostgreSQL
                          </span>
                        )}

                        {dbStatusData.provider === 'local_fallback' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Modo Local / Fallback Activo (/tmp)
                          </span>
                        )}

                        {dbStatusData.status === 'migration_needed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Requiere Migración SQL
                          </span>
                        )}

                        {dbStatusData.latencyMs !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {dbStatusData.latencyMs}ms
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {dbStatusData.message || dbStatusData.error}
                      </p>

                      {dbStatusData.pendingMigration && (
                        <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                          ⚠️ Falta ejecutar la migración <code>{dbStatusData.pendingMigrationFile}</code> en el SQL Editor de
                          Supabase. Sin ella no se guardan los textos de la landing, los horarios, la portada elegida, la CURP ni
                          el origen de los prospectos.
                        </p>
                      )}

                      {dbStatusData.leadsCount !== undefined && (
                        <p className="text-[11px] font-semibold text-slate-700">
                          📊 Prospectos registrados en almacén:{' '}
                          <strong className="text-[#0d233a] font-bold font-mono">
                            {dbStatusData.leadsCount}
                          </strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Zona de Mantenimiento / Depuración Protegida */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Mantenimiento del Sistema (Solo Administrador)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Herramienta protegida por contraseña para depuración y reseteo de citas de prueba.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDeveloperPurgeOpen(true)}
                  className="text-xs text-rose-700 hover:text-white hover:bg-rose-700 font-bold px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Gestionar Registros de Prueba</span>
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Pie de Página Fijo (Pinned Footer) */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0 flex items-center justify-between">
            {saveError ? (
              <span role="alert" className="text-xs text-rose-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{saveError}</span>
              </span>
            ) : savedSuccess ? (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Cambios guardados en toda la plataforma!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Se sincroniza en tiempo real en la web
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cerrar
              </button>

              {activeTab !== 'database' && (
                <button
                  type="submit"
                  className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Guardar Configuración</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Purga y Seguridad Developer */}
      <DeveloperPurgeModal
        isOpen={isDeveloperPurgeOpen}
        onClose={() => setIsDeveloperPurgeOpen(false)}
      />
    </div>
  );
}

interface DbStatus {
  ok: boolean;
  provider?: 'supabase' | 'local_fallback';
  status?: string;
  latencyMs?: number;
  leadsCount?: number;
  message?: string;
  error?: string;
  pendingMigration?: boolean;
  pendingMigrationFile?: string;
}

/** Convierte "14:30" a "02:30 PM" (formato usado en los horarios de visita). */
function formatHour12(value: string): string {
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

function hourToMinutes(value: string): number {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let h = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(match[2]);
}

function sortHours(hours: string[]): string[] {
  return [...hours].sort((a, b) => hourToMinutes(a) - hourToMinutes(b));
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
      />
      {hint && <span className="block text-[10px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

function SettingsTextarea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
      />
      {hint && <span className="block text-[10px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}
