'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 opacity-50 ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs ${
        isDark
          ? 'bg-slate-900 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300 ring-1 ring-amber-400/20'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 animate-in spin-in-180" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 animate-in spin-in-180" />
      )}
    </button>
  );
}
