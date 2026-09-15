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
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LeadDetailModal } from '@/components/panel/LeadDetailModal';
import { WhatsAppDraftModal } from '@/components/panel/WhatsAppDraftModal';
import { ConfirmRegistrationModal } from '@/components/panel/ConfirmRegistrationModal';
import { NewAppointmentModal } from '@/components/panel/NewAppointmentModal';
import { AppointmentAgendaView } from '@/components/panel/AppointmentAgendaView';
import { CommercialSettingsModal } from '@/components/panel/CommercialSettingsModal';

export default function AgentPanelPage() {
  const { leads, commercialConfig } = useApp();

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
    nuevo: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', label: 'Nuevo' },
    pendiente_info: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', label: 'Pendiente Info' },
    listo_revision: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-800 dark:text-sky-300', label: 'Listo Revisión' },
    contactado: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300', label: 'Contactado' },
    cita_solicitada: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-300', label: 'Visita Solicitada' },
    cita_confirmada: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', label: 'Visita Confirmada' },
    en_seguimiento: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-800 dark:text-purple-300', label: 'En Seguimiento' },
    cerrado: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: 'Cerrado' },
    no_compatible: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300', label: 'No Compatible' },
  };

  const attributionBadgeStyle: Record<AttributionStatus, { label: string; bg: string; text: string }> = {
    no_aplica: { label: 'No aplica', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
    pendiente_nss: { label: 'Pendiente NSS (Orientación)', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300' },
    pendiente_inmobiliaria: { label: 'Pendiente en Inmobiliaria', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-300' },
    confirmado: { label: 'Confirmado (15 días)', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300' },
    conflicto_rechazo: { label: 'Conflicto / Rechazo', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300' },
    vencido: { label: 'Vencido', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] dark:bg-[#0B1522] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Barra Superior del Panel */}
      <header className="bg-[#0F2C40] text-white py-3.5 px-4 sm:px-6 shadow-sm sticky top-0 z-30 border-b border-[#1C3B54]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Página Principal</span>
            </Link>
            <div className="h-4 w-px bg-white/15 hidden sm:block"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                <Building2 className="w-4 h-4 text-[#C09B53]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-sm sm:text-base tracking-normal text-white">
                    Panel Comercial
                  </span>
                  <span className="bg-[#C09B53]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full font-semibold border border-[#C09B53]/30 tracking-wider">
                    Valle de los Encinos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ThemeToggle className="!w-8 !h-8 !rounded-xl !bg-[#13344C] !border-[#204562] !text-slate-200 hover:!bg-[#19405E]" />

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-[#13344C] hover:bg-[#19405E] text-slate-200 hover:text-white font-medium px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#204562]"
              title="Personalizar datos del asesor, teléfonos, redes y bot de Telegram"
            >
              <Settings className="w-3.5 h-3.5 text-[#C09B53]" />
              <span className="hidden md:inline">Configuración</span>
            </button>

            <button
              onClick={() => setIsNewAppointmentOpen(true)}
              className="bg-[#C09B53] hover:bg-[#D4AF37] text-[#0F2C40] font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0F2C40]" />
              <span>Agendar Cita</span>
            </button>

            {/* Asesor Autenticado y Cerrar Sesión */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/15">
              <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-300 bg-[#0B1E30] px-2.5 py-1 rounded-xl border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-slate-200">master2130.isx@gmail.com</span>
              </div>

              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                  } catch {}
                  window.location.href = '/login';
                }}
                className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer text-[11px] font-medium"
                title="Cerrar sesión segura del panel"
              >
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Regla Fundamental y Alerta de Exclusividad */}
      <div className="bg-[#FDFBF7] dark:bg-[#0E1F30] border-b border-[#EAE3D6] dark:border-[#1A344D] px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C09B53] flex-shrink-0" />
            <span>
              <strong className="font-semibold text-slate-900 dark:text-white">Protección de Comisión (15 Días):</strong> El registro oportuno de NSS en el portal de la constructora garantiza tu exclusividad de honorarios comerciales sobre cada prospecto calificado.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
            Protocolo Comercial
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 w-full flex-1 space-y-6">
        {/* Tira Ejecutiva de Métricas de Ventas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Visitas Hoy */}
          <div
            onClick={() => setActiveTab('agenda')}
            className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-900/80 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>Visitas Hoy</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-700 dark:text-rose-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white" suppressHydrationWarning>{todayVisits}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              {todayVisits > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span className="text-rose-700 dark:text-rose-400 font-medium">Recepción en caseta</span>
                </>
              ) : (
                <span>Sin visitas para hoy</span>
              )}
            </p>
          </div>

          {/* Card 2: Por Confirmar */}
          <div
            onClick={() => setActiveTab('agenda')}
            className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-900/80 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>Por Confirmar</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white" suppressHydrationWarning>{pendingVisits}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requieren WhatsApp</p>
          </div>

          {/* Card 3: NSS por Registrar */}
          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('pendiente_inmobiliaria');
            }}
            className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs hover:shadow-md hover:border-[#C09B53] dark:hover:border-[#C09B53]/50 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>NSS por Registrar</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 flex items-center justify-center text-[#C09B53]">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white" suppressHydrationWarning>{pendingInAgency}</p>
            <p className="text-[11px] text-[#C09B53] dark:text-amber-400 font-medium mt-1">Prioridad constructora</p>
          </div>

          {/* Card 4: 15 Días Activos */}
          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('confirmado');
            }}
            className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-900/80 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>15 Días Activos</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white" suppressHydrationWarning>{confirmedAttributions}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">Exclusividad vigente</p>
          </div>

          {/* Card 5: Total Cartera */}
          <div
            onClick={() => {
              setActiveTab('prospectos');
              setAttributionFilter('todos');
            }}
            className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer col-span-2 lg:col-span-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>Total Cartera</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-3xl font-bold font-sans tracking-tight tabular-nums text-slate-900 dark:text-white" suppressHydrationWarning>{totalLeads}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Base acumulada</p>
          </div>
        </div>

        {/* Selector de Pestañas Principales (Segmented Control) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1E354D] pb-3">
          <div className="bg-slate-200/60 dark:bg-[#0E1F30] p-1 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-[#1E354D]">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-white dark:bg-[#163554] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#C09B53]" />
              <span>Agenda de Citas</span>
              {todayVisits > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prospectos')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'prospectos'
                  ? 'bg-white dark:bg-[#163554] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#C09B53]" />
              <span>Cartera de Prospectos y 15 Días</span>
              <span className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium">
                {totalLeads}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline">
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
            <div className="bg-white dark:bg-[#102033] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, folio o teléfono..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-[#1E354D] bg-slate-50/50 dark:bg-[#0B1522] text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0F2C40] dark:focus:ring-[#C09B53] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Atribución:</span>
                </div>
                <select
                  value={attributionFilter}
                  onChange={(e) => setAttributionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#1E354D] text-xs bg-white dark:bg-[#0B1522] text-slate-900 dark:text-slate-100"
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
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#1E354D] text-xs bg-white dark:bg-[#0B1522] text-slate-900 dark:text-slate-100"
                >
                  <option value="todos">Todos los estados de visita</option>
                  <option value="cita_solicitada">Visita Solicitada</option>
                  <option value="cita_confirmada">Visita Confirmada</option>
                  <option value="contactado">Contactado</option>
                  <option value="pendiente_info">Pendiente Info</option>
                  <option value="nuevo">Nuevo</option>
                </select>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-[#1E354D]">
                  <button
                    type="button"
                    onClick={() => setPriorityOrder(priorityOrder === 'prioridad' ? 'recientes' : 'prioridad')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      priorityOrder === 'prioridad'
                        ? 'bg-[#0F2C40] dark:bg-[#C09B53] text-white dark:text-[#0F2C40] border-[#0F2C40] dark:border-[#C09B53] shadow-xs'
                        : 'bg-white dark:bg-[#0B1522] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E354D] hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {priorityOrder === 'prioridad' ? '⚡ Por Prioridad' : '🕒 Por Fecha'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de Prospectos con Atribución Comercial de 15 Días */}
            <div className="bg-white dark:bg-[#102033] rounded-2xl border border-slate-200/80 dark:border-[#1E354D] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0E1E2E] border-b border-slate-200/80 dark:border-[#1E354D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-[#162B42]">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => {
                        const statusObj = (lead.commercialStatus && statusBadgeStyle[lead.commercialStatus]) || {
                          label: lead.commercialStatus || 'Nuevo',
                          bg: 'bg-slate-100 dark:bg-slate-800',
                          text: 'text-slate-700 dark:text-slate-300',
                        };
                        const attribObj = (lead.attributionStatus && attributionBadgeStyle[lead.attributionStatus]) || {
                          label: 'Sin asignar',
                          bg: 'bg-slate-100 dark:bg-slate-800',
                          text: 'text-slate-600 dark:text-slate-400',
                        };

                        return (
                          <tr key={lead.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#13283E] transition">
                            {/* Folio y fecha */}
                            <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">{lead.folio || 'N/A'}</span>
                              <span className="text-slate-400">{lead.createdAt || 'Reciente'}</span>
                            </td>

                            {/* Prospecto y contacto */}
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 dark:text-white block">{lead.fullName || 'Prospecto'}</span>
                              <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                                📞 {lead.phone || 'Sin tel'} • {lead.preferredChannel || 'whatsapp'}
                              </span>
                            </td>

                            {/* Zona y modelo */}
                            <td className="p-3.5 max-w-[160px]">
                              <span className="text-slate-800 dark:text-slate-200 font-medium block truncate">
                                Modelo Águila Premier
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Valle de los Encinos
                              </span>
                            </td>

                            {/* Forma de compra */}
                            <td className="p-3.5 capitalize text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                              {((lead.financingType || 'infonavit') as string).replace(/_/g, ' ')}
                            </td>

                            {/* Atribución Comercial (15 Días) */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${attribObj.bg} ${attribObj.text} border-slate-200/60 dark:border-transparent`}
                                >
                                  {attribObj.label}
                                </span>
                                {lead.attributionStatus === 'confirmado' && lead.attributionExpiresAt && (
                                  <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                    Vence: {lead.attributionExpiresAt.split(' ')[0]}
                                  </span>
                                )}
                                {lead.attributionStatus === 'pendiente_inmobiliaria' && (
                                  <button
                                    onClick={() => setRegLead(lead)}
                                    className="block text-[10px] text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                                  >
                                    ⚡ Registrar en sistema constructora
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Estado comercial y de visita */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusObj.bg} ${statusObj.text} border-slate-200/60 dark:border-transparent`}
                              >
                                {statusObj.label}
                              </span>
                              {lead.appointmentRequest && (
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                  {lead.appointmentRequest.confirmedDate || lead.appointmentRequest.preferredDate} (
                                  {lead.appointmentRequest.confirmedTime || lead.appointmentRequest.timeSlot})
                                </span>
                              )}
                            </td>

                            {/* Próxima Acción */}
                            <td className="p-3.5 max-w-[200px]">
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 block line-clamp-2">
                                {lead.nextAction}
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setWaLead(lead)}
                                  title="Enviar mensaje rápido de WhatsApp"
                                  className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="bg-[#0F2C40] hover:bg-[#163E5B] dark:bg-[#1E3E5E] dark:hover:bg-[#254F77] text-white font-medium px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer shadow-xs border border-[#0F2C40] dark:border-[#2D5A85]"
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
                        <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
