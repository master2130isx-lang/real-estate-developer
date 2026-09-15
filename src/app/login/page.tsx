'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/panel';

  // Pre-configurado con el correo del asesor por defecto
  const [email, setEmail] = useState('master2130.isx@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Credenciales inválidas. Verifica tu contraseña.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 350);
    } catch {
      setError('Error de conexión al servidor. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1522] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos visuales de fondo arquitectónico */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#C09B53]/10 via-transparent to-transparent pointer-events-none blur-3xl"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#0F2C40] opacity-50 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Cabecera / Identidad */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#102033] border border-[#1E354D] hover:border-[#C09B53]/50 transition mb-6 backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-lg bg-[#C09B53] text-[#0F2C40] flex items-center justify-center font-bold">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              Valle de los Encinos
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
            Portal Comercial del Asesor
          </h1>
          <p className="mt-2 text-xs text-slate-400">
            Ingresa con tus credenciales de asesor para gestionar prospectos y citas
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="mt-8 bg-[#102033] border border-[#1E354D] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de Error */}
            {error && (
              <div className="bg-rose-950/50 border border-rose-800/60 rounded-2xl p-3.5 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {/* Mensaje de Éxito */}
            {success && (
              <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-2xl p-3.5 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">¡Acceso concedido! Redirigiendo al panel...</span>
              </div>
            )}

            {/* Campo Correo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Correo Electrónico Registrado</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="master2130.isx@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1929] border border-[#1E354D] text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#C09B53] focus:border-[#C09B53] focus:outline-none font-medium transition"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contraseña de Acceso</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#0B1929] border border-[#1E354D] text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-[#C09B53] focus:border-[#C09B53] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Envío */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-[#C09B53] hover:bg-[#D4AF37] disabled:opacity-50 text-[#0F2C40] font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Entrar al Panel Comercial</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie de Seguridad */}
          <div className="mt-6 pt-4 border-t border-[#1E354D] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autenticación protegida con cifrado SSL y Supabase Auth</span>
          </div>
        </div>

        {/* Enlace para volver a la Landing */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-[#C09B53] transition font-medium"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1522] flex items-center justify-center text-slate-300 text-xs">
          Cargando portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
