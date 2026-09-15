'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Users,
  CalendarCheck,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  MessageSquare,
  AlertTriangle,
  Flame,
  Calendar,
  Plus,
  ShieldCheck,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Lead, CommercialStatus, AttributionStatus } from '@/types';
import { LeadDetailModal } from '@/components/panel/LeadDetailModal';
import { WhatsAppDraftModal } from '@/components/panel/WhatsAppDraftModal';
import { ConfirmRegistrationModal } from '@/components/panel/ConfirmRegistrationModal';
import { NewAppointmentModal } from '@/components/panel/NewAppointmentModal';
import { AppointmentAgendaView } from '@/components/panel/AppointmentAgendaView';
import { CommercialSettingsModal } from '@/components/panel/CommercialSettingsModal';

export default function AgentPanelPage() {
  const { leads, resetToDemoDefaults, commercialConfig } = useApp();

  // Pestaña activa principal: Agenda o Cartera de Prospectos
  const [activeTab, setActiveTab] = useState<'agenda' | 'prospectos'>('agenda');

  // Modales
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [waLead, setWaLead] = useState<Lead | null>(null);
  const [regLead, setRegLead] = useState<Lead | null>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filtros de tabla
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [attributionFilter, setAttributionFilter] = useState<string>('todos');
  const [priorityOrder, setPriorityOrder] = useState<'prioridad' | 'recientes'>('prioridad');

  const todayStr = new Date().toISOString().split('T')[0];

  // Ordenamiento con Criterios de Prioridad del Negocio
  const sortedLeads = [...leads].sort((a, b) => {
    if (priorityOrder === 'prioridad') {
      const getPriorityScore = (lead: Lead) => {
        if (lead.attributionStatus === 'pendiente_inmobiliaria') return 4;
        if (lead.attributionStatus === 'confirmado') return 3;
        if (lead.appointmentRequest?.status === 'solicitada') return 2;
        if (lead.commercialStatus === 'en_seguimiento') return 1;
        return 0;
      };
      return getPriorityScore(b) - getPriorityScore(a);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });

  // Filtrado de prospectos para la vista de tabla
  const filteredLeads = sortedLeads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'todos' || lead.commercialStatus === statusFilter;
    const matchesAttribution = attributionFilter === 'todos' || lead.attributionStatus === attributionFilter;

    return matchesSearch && matchesStatus && matchesAttribution;
  });

  // Métricas ejecutivas de ventas
  const totalLeads = leads.length;
  const pendingInAgency = leads.filter((l) => l.attributionStatus === 'pendiente_inmobiliaria').length;
  const pendingVisits = leads.filter(
    (l) => l.appointmentRequest && l.appointmentRequest.status === 'solicitada'
  ).length;
  const confirmedAttributions = leads.filter((l) => l.attributionStatus === 'confirmado').length;
  const todayVisits = leads.filter(
    (l) => (l.appointmentRequest?.confirmedDate || l.appointmentRequest?.preferredDate) === todayStr
  ).length;

  const statusBadgeStyle: Record<CommercialStatus, { bg: string; text: string; label: string }> = {
    nuevo: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nuevo' },
    pendiente_info: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendiente Info' },
    listo_revision: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Listo Revisión' },
    contactado: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Contactado' },
    cita_solicitada: { bg: 'bg-amber-100', text: 'text-amber-900', label: 'Visita Solicitada' },
    cita_confirmada: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Visita Confirmada' },
    en_seguimiento: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Seguimiento' },
    cerrado: { bg: 'bg-slate-200', text: 'text-slate-800', label: 'Cerrado' },
    no_compatible: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'No Compatible' },
  };

  const attributionBadgeStyle: Record<AttributionStatus, { label: string; bg: string; text: string }> = {
    no_aplica: { label: 'No aplica', bg: 'bg-slate-100', text: 'text-slate-600' },
    pendiente_nss: { label: 'Pendiente NSS (Orientación)', bg: 'bg-amber-100', text: 'text-amber-800' },
    pendiente_inmobiliaria: { label: 'Pendiente en Inmobiliaria', bg: 'bg-blue-100', text: 'text-blue-900' },
    confirmado: { label: 'Confirmado (15 días)', bg: 'bg-emerald-100', text: 'text-emerald-900' },
    conflicto_rechazo: { label: 'Conflicto / Rechazo', bg: 'bg-rose-100', text: 'text-rose-800' },
    vencido: { label: 'Vencido', bg: 'bg-slate-200', text: 'text-slate-700' },
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* Barra Superior del Panel */}
      <header className="bg-[#0d233a] text-white py-3 px-4 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Página Principal</span>
            </Link>
            <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm sm:text-base">
                Panel Comercial del Asesor
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                Modelo Águila Premier
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer border border-slate-700"
              title="Personalizar datos del asesor, teléfonos, redes y bot de Telegram"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuración Comercial</span>
            </button>

            <button
              onClick={() => setIsNewAppointmentOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agendar Cita</span>
            </button>

            <button
              onClick={resetToDemoDefaults}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer text-[11px]"
              title="Restablecer datos demostrativos"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Restablecer datos</span>
            </button>

            {/* Asesor Autenticado y Cerrar Sesión */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-emerald-300 font-semibold">master2130.isx@gmail.com</span>
              </div>

              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch {}
                  window.location.href = '/login';
                }}
                className="bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/60 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer text-[11px] font-bold shadow-xs"
                title="Cerrar sesión segura del panel"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Regla Fundamental y Alerta de Exclusividad */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Protección de Comisión:</strong> Registrar el NSS en el sistema de la constructora garantiza tu periodo de 15 días de atribución comercial por cada prospecto calificado.
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 w-full flex-1 space-y-5">
        {/* Tira Ejecutiva de Métricas de Ventas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => setActiveTab('agenda')}
            className={`p-3.5 rounded-2xl border transition shadow-sm cursor-pointer ${
              todayVisits > 0
                ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 ring-1 ring-rose-300'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Visitas Hoy</span>
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-600" suppressHydrationWarning>{todayVisits}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">En caseta de acceso</p>
          </div>

          <div
            onClick={() => setActiveTab('agenda')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Por Confirmar</span>
              <CalendarCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600" suppressHydrationWarning>{pendingVisits}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Requieren WhatsApp</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('pendiente_inmobiliaria');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>NSS por Registrar</span>
              <Flame className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-600" suppressHydrationWarning>{pendingInAgency}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Prioridad en constructora</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('confirmado');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>15 Días Activos</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600" suppressHydrationWarning>{confirmedAttributions}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Exclusividad vigente</p>
          </div>

          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('todos');
            }}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition cursor-pointer col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Total Cartera</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-black text-slate-800" suppressHydrationWarning>{totalLeads}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Base acumulada</p>
          </div>
        </div>

        {/* Selector de Pestañas Principales (Agenda vs Cartera) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-[#0d233a] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Agenda de Citas</span>
              {todayVisits > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prospectos')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'prospectos'
                  ? 'bg-[#0d233a] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Cartera de Prospectos y 15 Días</span>
              <span className="bg-slate-200/80 text-slate-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {totalLeads}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden md:inline">
            Fraccionamiento Valle de los Encinos • Salinas Victoria, N.L.
          </span>
        </div>

        {/* VISTA 1: AGENDA DE CITAS */}
        {activeTab === 'agenda' && (
          <AppointmentAgendaView
            leads={leads}
            onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            onOpenWhatsApp={(lead) => setWaLead(lead)}
            onOpenLeadDetail={(lead) => setSelectedLead(lead)}
          />
        )}

        {/* VISTA 2: CARTERA DE PROSPECTOS Y ATRIBUCIÓN */}
        {activeTab === 'prospectos' && (
          <div className="space-y-4">
            {/* Barra de Búsqueda y Filtros */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, folio o teléfono..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0d233a] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Atribución:</span>
                </div>
                <select
                  value={attributionFilter}
                  onChange={(e) => setAttributionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="todos">Todos los registros</option>
                  <option value="pendiente_inmobiliaria">🔥 Pendiente en Inmobiliaria</option>
                  <option value="confirmado">Confirmado (15 días)</option>
                  <option value="pendiente_nss">Pendiente NSS (Orientación)</option>
                  <option value="conflicto_rechazo">Conflicto / Rechazo</option>
                  <option value="vencido">Vencido</option>
                  <option value="no_aplica">No aplica</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="todos">Todos los estados de visita</option>
                  <option value="cita_solicitada">Visita Solicitada</option>
                  <option value="cita_confirmada">Visita Confirmada</option>
                  <option value="contactado">Contactado</option>
                  <option value="pendiente_info">Pendiente Info</option>
                  <option value="nuevo">Nuevo</option>
                </select>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPriorityOrder(priorityOrder === 'prioridad' ? 'recientes' : 'prioridad')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      priorityOrder === 'prioridad'
                        ? 'bg-[#0d233a] text-white border-[#0d233a]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {priorityOrder === 'prioridad' ? '⚡ Por Prioridad Comercial' : '🕒 Por Fecha'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de Prospectos con Atribución Comercial de 15 Días */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Folio / Fecha</th>
                      <th className="p-3.5">Prospecto</th>
                      <th className="p-3.5">Vivienda</th>
                      <th className="p-3.5">Forma Compra</th>
                      <th className="p-3.5">Atribución Constructora (15 Días)</th>
                      <th className="p-3.5">Visita Agendada</th>
                      <th className="p-3.5">Próxima Acción</th>
                      <th className="p-3.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => {
                        const statusObj = (lead.commercialStatus && statusBadgeStyle[lead.commercialStatus]) || {
                          label: lead.commercialStatus || 'Nuevo',
                          bg: 'bg-slate-100',
                          text: 'text-slate-700',
                        };
                        const attribObj = (lead.attributionStatus && attributionBadgeStyle[lead.attributionStatus]) || {
                          label: 'Sin asignar',
                          bg: 'bg-slate-100',
                          text: 'text-slate-600',
                        };

                        return (
                          <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                            {/* Folio y fecha */}
                            <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                              <span className="font-bold text-slate-900 block">{lead.folio || 'N/A'}</span>
                              <span className="text-slate-400">{lead.createdAt || 'Reciente'}</span>
                            </td>

                            {/* Prospecto y contacto */}
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{lead.fullName || 'Prospecto'}</span>
                              <span className="text-slate-500 text-[11px] block">
                                📞 {lead.phone || 'Sin tel'} • {lead.preferredChannel || 'whatsapp'}
                              </span>
                            </td>

                            {/* Zona y modelo */}
                            <td className="p-3.5 max-w-[160px]">
                              <span className="text-slate-800 font-medium block truncate">
                                Modelo Águila Premier
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Valle de los Encinos
                              </span>
                            </td>

                            {/* Forma de compra */}
                            <td className="p-3.5 capitalize text-slate-700 font-medium whitespace-nowrap">
                              {((lead.financingType || 'infonavit') as string).replace(/_/g, ' ')}
                            </td>

                            {/* Atribución Comercial (15 Días) */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${attribObj.bg} ${attribObj.text}`}
                                >
                                  {attribObj.label}
                                </span>
                                {lead.attributionStatus === 'confirmado' && lead.attributionExpiresAt && (
                                  <span className="block text-[10px] text-emerald-800 font-semibold">
                                    Vence: {lead.attributionExpiresAt.split(' ')[0]}
                                  </span>
                                )}
                                {lead.attributionStatus === 'pendiente_inmobiliaria' && (
                                  <button
                                    onClick={() => setRegLead(lead)}
                                    className="block text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                                  >
                                    ⚡ Registrar en sistema constructora
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Estado comercial y de visita */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusObj.bg} ${statusObj.text}`}
                              >
                                {statusObj.label}
                              </span>
                              {lead.appointmentRequest && (
                                <span className="block text-[10px] text-slate-500 mt-0.5 font-medium">
                                  {lead.appointmentRequest.confirmedDate || lead.appointmentRequest.preferredDate} (
                                  {lead.appointmentRequest.confirmedTime || lead.appointmentRequest.timeSlot})
                                </span>
                              )}
                            </td>

                            {/* Próxima Acción */}
                            <td className="p-3.5 max-w-[200px]">
                              <span className="text-[11px] text-slate-600 block line-clamp-2">
                                {lead.nextAction}
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setWaLead(lead)}
                                  title="Enviar mensaje rápido de WhatsApp"
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg border border-emerald-200 transition cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="bg-[#0d233a] hover:bg-[#163b5c] text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ficha</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No se encontraron prospectos con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Agendar Nueva Cita */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
      />

      {/* Modal de Detalle Completo de Prospecto */}
      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />

      {/* Modal de Respuestas Rápidas por WhatsApp */}
      <WhatsAppDraftModal lead={waLead} onClose={() => setWaLead(null)} />

      {/* Modal de Gestión de Atribución */}
      <ConfirmRegistrationModal lead={regLead} onClose={() => setRegLead(null)} />

      {/* Modal de Configuración Comercial y Redes Sociales */}
      <CommercialSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
