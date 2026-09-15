'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Lead } from '@/types';
import { useApp } from '@/context/AppContext';
import { COMMERCIAL_CONFIG } from '@/config/commercialConfig';

interface ConfirmRegistrationModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function ConfirmRegistrationModal({ lead, onClose }: ConfirmRegistrationModalProps) {
  const { confirmAttributionInAgency, markAttributionConflict, commercialConfig } = useApp();
  const cfg = commercialConfig || COMMERCIAL_CONFIG;

  const [mode, setMode] = useState<'confirmar' | 'conflicto'>('confirmar');
  const [reference, setReference] = useState('');
  const [confirmedAtDate, setConfirmedAtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [confirmedAtTime, setConfirmedAtTime] = useState(() => new Date().toTimeString().substring(0, 5));
  const [advisorName, setAdvisorName] = useState(cfg.advisorName);
  const [operatorUser, setOperatorUser] = useState(cfg.advisorName);
  const [notes, setNotes] = useState('');
  const [conflictReason, setConflictReason] = useState('Prospecto ya registrado por otro asesor previamente.');

  if (!lead) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const fullDateTime = `${confirmedAtDate} ${confirmedAtTime}`;
    confirmAttributionInAgency(lead.id, reference.trim(), fullDateTime, operatorUser.trim(), notes.trim());
    onClose();
  };

  const handleRejectConflict = (e: React.FormEvent) => {
    e.preventDefault();
    markAttributionConflict(lead.id, conflictReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reg-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[#0d233a]">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Seguimiento de Atribución Comercial (15 Días)
          </span>
        </div>

        <div>
          <h3 id="confirm-reg-title" className="text-lg font-bold text-slate-900">
            Registro en Inmobiliaria: {lead.fullName || 'Prospecto'}
          </h3>
          <p className="text-xs text-slate-500">
            Folio web: <strong>{lead.folio || 'N/A'}</strong> • Estado actual: <strong>{lead.attributionStatus || 'Sin registro'}</strong>
          </p>
        </div>

        {/* REGLA CRÍTICA DE NEGOCIO */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Regla fundamental de inicio de los 15 días:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-900">
            Los 15 días de atribución comercial <strong>NO inician desde que el prospecto envió el formulario web</strong>.
            Inician únicamente a partir de la fecha y hora en que la inmobiliaria confirma el registro efectivo en su mecanismo interno.
          </p>
        </div>

        {/* Selector de modo */}
        <div className="flex border-b border-slate-200 gap-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('confirmar')}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              mode === 'confirmar'
                ? 'border-[#0d233a] text-[#0d233a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Confirmar Registro Efectivo
          </button>
          <button
            type="button"
            onClick={() => setMode('conflicto')}
            className={`pb-2 border-b-2 transition cursor-pointer ${
              mode === 'conflicto'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-red-700'
            }`}
          >
            Reportar Conflicto o Rechazo
          </button>
        </div>

        {mode === 'confirmar' ? (
          <form onSubmit={handleConfirm} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Fecha efectiva en inmobiliaria</label>
                <input
                  type="date"
                  value={confirmedAtDate}
                  onChange={(e) => setConfirmedAtDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Hora de registro</label>
                <input
                  type="time"
                  value={confirmedAtTime}
                  onChange={(e) => setConfirmedAtTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800">
                Folio o Referencia interna de la Inmobiliaria
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. INM-2026-9812 (Opcional)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Asesor asignado</label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Usuario que registra</label>
                <input
                  type="text"
                  value={operatorUser}
                  onChange={(e) => setOperatorUser(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800">Notas internas sobre el registro</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles sobre la mesa de control o clave de oferente..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Bloqueo de 15 Días</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRejectConflict} className="space-y-3 text-xs">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-950">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Registro rechazado o duplicado:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Si la inmobiliaria rechaza el registro (por ejemplo, si el NSS ya estaba asignado a otro asesor o ya existía en su base dentro de los últimos 15 días), el prospecto pasa a revisión sin atribución.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800">Motivo del conflicto o rechazo:</label>
              <select
                value={conflictReason}
                onChange={(e) => setConflictReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Prospecto ya registrado por otro asesor previamente.">
                  Prospecto ya registrado por otro asesor (Conflicto de asignación)
                </option>
                <option value="NSS ya registrado dentro de los últimos 15 días.">
                  NSS duplicado en periodo de atribución vigente
                </option>
                <option value="Rechazado por mesa de control de la inmobiliaria.">
                  Rechazado por mesa de control institucional
                </option>
                <option value="Error en datos proporcionados en inmobiliaria.">
                  Inconsistencia en datos
                </option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-xl shadow cursor-pointer"
              >
                Marcar Conflicto / Rechazo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
