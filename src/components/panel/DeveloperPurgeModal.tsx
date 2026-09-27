'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface DeveloperPurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

const REQUIRED_CONFIRMATION_CODE = 'BORRAR-CITAS-TEST';
const REQUIRED_RESET_CODE = 'RESTABLECER-DEMO';

export function DeveloperPurgeModal({
  isOpen,
  onClose,
  currentUserEmail = 'master2130.isx@gmail.com',
}: DeveloperPurgeModalProps) {
  const { purgeAllLeads, resetLeadsToDemo } = useApp();

  const [adminPassword, setAdminPassword] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState<'purge' | 'reset'>('purge');

  if (!isOpen) return null;

  const isPurgeReady = confirmationInput.trim() === REQUIRED_CONFIRMATION_CODE && adminPassword.trim().length > 0;
  const isResetReady = confirmationInput.trim() === REQUIRED_RESET_CODE && adminPassword.trim().length > 0;

  const handleExecute = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!adminPassword.trim()) {
      setErrorMessage('Por seguridad, debes ingresar tu contraseña de acceso para autorizar esta operación.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Validar contraseña contra el servidor / Supabase Auth
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUserEmail,
          password: adminPassword.trim(),
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData.ok) {
        setErrorMessage(authData.error || 'Contraseña incorrecta. Solo el administrador puede autorizar este cambio.');
        setIsSubmitting(false);
        return;
      }

      if (mode === 'purge') {
        if (confirmationInput.trim() !== REQUIRED_CONFIRMATION_CODE) {
          setErrorMessage(`Debes escribir exactamente "${REQUIRED_CONFIRMATION_CODE}" para confirmar.`);
          setIsSubmitting(false);
          return;
        }

        const res = await purgeAllLeads(REQUIRED_CONFIRMATION_CODE);
        if (!res.ok) {
          setErrorMessage(res.message || 'Error al ejecutar la purga.');
        } else {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        if (confirmationInput.trim() !== REQUIRED_RESET_CODE) {
          setErrorMessage(`Debes escribir exactamente "${REQUIRED_RESET_CODE}" para confirmar.`);
          setIsSubmitting(false);
          return;
        }

        const res = await resetLeadsToDemo(REQUIRED_RESET_CODE);
        if (!res.ok) {
          setErrorMessage(res.message || 'Error al restablecer registros.');
        } else {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado al validar credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0B1522] border-2 border-rose-900/60 rounded-3xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera de Alerta de Seguridad */}
        <div className="px-6 py-4 border-b border-rose-900/40 bg-gradient-to-r from-rose-950/80 via-[#102033] to-[#102033] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-900/40 border border-rose-600/50 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Zona de Desarrollador (Master Key)</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Crítico
                </span>
              </div>
              <p className="text-xs text-rose-300/80 font-mono">
                Autorizado para: <span className="text-white font-bold">{currentUserEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Modo */}
        <div className="flex border-b border-[#1E354D] bg-[#07131F] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('purge');
              setConfirmationInput('');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              mode === 'purge'
                ? 'border-rose-500 text-rose-400 bg-rose-950/20 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>1. Vaciar Base de Citas (0 Registros)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setConfirmationInput('');
              setErrorMessage('');
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              mode === 'reset'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>2. Restablecer Citas de Prueba</span>
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-4">
          {mode === 'purge' ? (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">¿Qué pasará al ejecutar esta acción?</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Se eliminarán <strong>todas las citas y prospectos de prueba</strong> de la base de datos de Supabase.</li>
                    <li>Se vaciará la memoria y el almacenamiento local de citas.</li>
                    <li><strong>Tus modelos de casas (Águila Premier, Milán, etc.) NO se tocarán</strong> y quedarán 100% a salvo.</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">Restablecer datos de demostración</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Se borrarán los registros actuales y se precargarán los 7 prospectos iniciales de muestra con distintas etapas comerciales para pruebas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campo de Contraseña de Administrador */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Contraseña de Administrador:</span>
              <span className="text-[10px] text-slate-400">Verifica tu cuenta ({currentUserEmail})</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Ingresa tu contraseña de acceso"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Caja de Código de Confirmación */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-300">
              Escribe{' '}
              <span className="font-mono font-bold text-rose-400 select-all bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                {mode === 'purge' ? REQUIRED_CONFIRMATION_CODE : REQUIRED_RESET_CODE}
              </span>{' '}
              para desbloquear el botón:
            </label>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={mode === 'purge' ? REQUIRED_CONFIRMATION_CODE : REQUIRED_RESET_CODE}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#102033] border border-[#1E354D] text-white text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none tracking-wider placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Mensajes de Alerta */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="px-6 py-4 border-t border-[#1E354D] bg-[#07131F] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Acción con registro de auditoría</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={
                isSubmitting ||
                (mode === 'purge' && !isPurgeReady) ||
                (mode === 'reset' && !isResetReady)
              }
              className={`px-5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === 'purge'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : mode === 'purge' ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Purgar Todas las Citas</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Restablecer Citas Demo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
