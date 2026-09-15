'use client';

import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

interface CommercialSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommercialSettingsModal({ isOpen, onClose }: CommercialSettingsModalProps) {
  const { commercialConfig, updateCommercialConfig } = useApp();

  const [activeTab, setActiveTab] = useState<'advisor' | 'social' | 'development' | 'telegram'>('advisor');

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

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

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

    // Limpiar número de whatsapp (quitar signos +, espacios o guiones si los hubiera para formato internacional)
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
              <span>Configuración Comercial y Marca Personal</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                White-Label
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Personaliza los datos del asesor, teléfonos, redes sociales y bot de alertas
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
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
