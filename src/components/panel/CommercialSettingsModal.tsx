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
  Copy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface CommercialSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialSettingsModal({ isOpen, onClose }: CommercialSettingsModalProps) {
  const { commercialConfig, updateCommercialConfig } = useApp();

  const [activeTab, setActiveTab] = useState<'advisor' | 'social' | 'development' | 'telegram' | 'database'>('advisor');

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

  // Telegram
  const [botToken, setBotToken] = useState(commercialConfig.telegramConfig?.botToken || '');
  const [advisorChatId, setAdvisorChatId] = useState(commercialConfig.telegramConfig?.advisorChatId || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  // Webhook Producción
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string>('');
  const [webhookLoading, setWebhookLoading] = useState(false);

  // Diagnóstico de Base de Datos (Supabase)
  const [dbStatusData, setDbStatusData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const checkDbStatus = async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatusData(data);
    } catch (e: any) {
      setDbStatusData({ ok: false, error: e.message });
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database' && !dbStatusData && !dbLoading) {
      checkDbStatus();
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    const sqlContent = `-- ESQUEMA DE BASE DE DATOS DEFINITIVA (SUPABASE / POSTGRESQL)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  folio TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_channel TEXT DEFAULT 'whatsapp',
  preferred_contact_time TEXT DEFAULT 'tarde',
  interested_zone TEXT DEFAULT 'Salinas Victoria, N.L. (Valle de los Encinos)',
  selected_property_id TEXT,
  selected_property_title TEXT,
  budget_range TEXT DEFAULT 'aun_no_lo_se',
  purchase_timeline TEXT DEFAULT 'corto',
  financing_type TEXT DEFAULT 'infonavit',
  financing_subtype TEXT,
  needs_orientation BOOLEAN DEFAULT FALSE,
  privacy_consent_accepted BOOLEAN DEFAULT TRUE,
  marketing_consent_accepted BOOLEAN DEFAULT FALSE,
  nss_status TEXT DEFAULT 'no_aplica',
  nss_value_encrypted_mock TEXT,
  nss_last_four TEXT,
  attribution_status TEXT DEFAULT 'no_aplica',
  attribution_advisor TEXT,
  attribution_confirmed_at TEXT,
  attribution_expires_at TEXT,
  attribution_reference TEXT,
  attribution_confirmed_by TEXT,
  attribution_notes TEXT,
  commercial_status TEXT DEFAULT 'nuevo',
  compatibility TEXT DEFAULT 'media',
  next_action TEXT,
  assigned_advisor TEXT,
  appointment_request JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  audit_history JSONB DEFAULT '[]'::jsonb,
  db_created_at TIMESTAMPTZ DEFAULT NOW(),
  db_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_commercial_status ON leads (commercial_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

CREATE TABLE IF NOT EXISTS commercial_config (
  id TEXT PRIMARY KEY DEFAULT 'primary_config',
  advisor_name TEXT NOT NULL,
  advisor_role TEXT,
  agency_name TEXT NOT NULL,
  coverage_zone TEXT,
  contact_channels JSONB NOT NULL,
  social_links JSONB NOT NULL,
  telegram_config JSONB,
  featured_price JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo acceso leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso config" ON commercial_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo acceso funnel" ON funnel_events FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSetWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setWebhookLoading(true);
    setWebhookStatus('');
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', webhookUrl: webhookUrl.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebhookStatus('✅ Webhook conectado con éxito en Telegram.');
      } else {
        setWebhookStatus(`❌ Error: ${data.description || data.error}`);
      }
    } catch (e: any) {
      setWebhookStatus(`❌ Error de conexión: ${e.message}`);
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleDeleteWebhook = async () => {
    setWebhookLoading(true);
    setWebhookStatus('');
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      });
      const data = await res.json();
      if (data.ok) {
        setWebhookStatus('✅ Webhook desactivado. Modo local activo.');
      } else {
        setWebhookStatus(`❌ Error: ${data.description || data.error}`);
      }
    } catch (e: any) {
      setWebhookStatus(`❌ Error de conexión: ${e.message}`);
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar número de whatsapp (quitar signos +, espacios o guiones para formato internacional)
    const cleanWa = whatsapp.replace(/\D/g, '');

    await updateCommercialConfig({
      advisorName: advisorName.trim(),
      advisorRole: advisorRole.trim(),
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
        botToken: botToken.trim(),
        advisorChatId: advisorChatId.trim(),
      },
      featuredPrice: {
        ...commercialConfig.featuredPrice,
        amountFormatted: amountFormatted.trim(),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestTelegram = async () => {
    setTestStatus('loading');
    setTestError('');

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken.trim(), chatId: advisorChatId.trim() }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setTestError(data.error || 'Error al conectar con Telegram');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Error de red');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-7 text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-2.5 text-[#0d233a] border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
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

        {/* Pestañas de Ajustes */}
        <div className="flex items-center gap-1.5 pt-3 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('advisor')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'advisor'
                ? 'border-[#0d233a] text-[#0d233a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Asesor y Teléfonos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'social'
                ? 'border-[#0d233a] text-[#0d233a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Redes Sociales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('development')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'development'
                ? 'border-[#0d233a] text-[#0d233a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Inmobiliaria / Caseta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telegram')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'border-[#0d233a] text-[#0d233a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>Bot de Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'border-[#0d233a] text-[#0d233a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Base de Datos</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="space-y-4 pt-3">
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
                  placeholder="asesoria@valledelosencinos.com"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precio Base Promocional
                </label>
                <input
                  type="text"
                  value={amountFormatted}
                  onChange={(e) => setAmountFormatted(e.target.value)}
                  placeholder="$1,180,000 MXN"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-bold"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BOT DE TELEGRAM */}
          {activeTab === 'telegram' && (
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sky-900">
                  <Send className="w-4 h-4 text-sky-600" />
                  <span>Configuración del Bot Móvil de Alertas</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cualquier agente que adquiera tu plantilla solo debe pegar su <strong>Token de @BotFather</strong> y su <strong>Chat ID de @userinfobot</strong> para recibir las citas en su celular y aprobarlas con botones interactivos.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HTTP API Bot Token
                  </label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Ej. 8744099329:AAEKPsqni4ugVioOXYd7dMi3zZREBP0RrKc"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram Advisor Chat ID
                  </label>
                  <input
                    type="text"
                    value={advisorChatId}
                    onChange={(e) => setAdvisorChatId(e.target.value)}
                    placeholder="Ej. 948786976"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                  />
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={!botToken || !advisorChatId || testStatus === 'loading'}
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testStatus === 'loading' ? 'Enviando...' : 'Enviar Mensaje de Prueba al Celular'}</span>
                  </button>

                  {testStatus === 'success' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Mensaje enviado a tu Telegram!
                    </span>
                  )}
                  {testStatus === 'error' && (
                    <span className="text-xs text-rose-600 font-semibold flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {testError}
                    </span>
                  )}
                </div>

                {/* Conexión de Webhook (Producción vs Local) */}
                <div className="pt-3 mt-3 border-t border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Receptor de Botones Interactivos del Bot</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        En local, los botones interactivos se procesan al instante en tu equipo. Al publicar en Vercel, registra tu dominio aquí para que funcione en la nube sin servidores locales.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      URL del Dominio en Producción (Vercel o Dominio Propio):
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://tu-proyecto.vercel.app"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0d233a] focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSetWebhook}
                        disabled={!webhookUrl.trim() || webhookLoading}
                        className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                      >
                        {webhookLoading ? 'Conectando...' : 'Conectar Webhook'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteWebhook}
                        disabled={webhookLoading}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
                        title="Desconectar Webhook para volver a Modo Local"
                      >
                        Modo Local
                      </button>
                    </div>

                    {webhookStatus && (
                      <p className="text-[11px] font-semibold text-slate-700 animate-in fade-in pt-1">
                        {webhookStatus}
                      </p>
                    )}
                  </div>
                </div>
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

              {/* Guía en 3 Pasos para Conectar Supabase en Producción */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs text-emerald-950">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <span>🚀 Cómo Activar Persistencia Permanente en Vercel (3 Pasos)</span>
                  </h4>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 underline"
                  >
                    <span>Abrir Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="space-y-2 text-[11px] list-decimal list-inside text-emerald-900/90 leading-relaxed">
                  <li>
                    <strong>Crea un proyecto gratis en Supabase</strong> (toma 1 minuto).
                  </li>
                  <li>
                    Abre el <strong>SQL Editor</strong> de Supabase, pega el script de abajo y presiona <strong>Run</strong>.
                  </li>
                  <li>
                    En tu panel de <strong>Vercel &gt; Settings &gt; Environment Variables</strong>, agrega:
                    <div className="mt-1 bg-white p-2 rounded-xl border border-emerald-200 font-mono text-[10px] text-slate-700 space-y-0.5">
                      <div>NEXT_PUBLIC_SUPABASE_URL = &quot;https://tu-proyecto.supabase.co&quot;</div>
                      <div>SUPABASE_SERVICE_ROLE_KEY = &quot;tu-service-role-secret-key&quot;</div>
                    </div>
                  </li>
                </ol>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700">
                    Script SQL listo para copiar (Tablas leads, config y telemetría):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-amber-300" />
                        <span>¡Script Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Script SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botones del Formulario */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {savedSuccess ? (
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
    </div>
  );
}
