'use client';

import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

interface StickyMobileCTAProps {
  onOpenPrequalification: () => void;
}

export function StickyMobileCTA({ onOpenPrequalification }: StickyMobileCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={onOpenPrequalification}
          className="w-full h-12 bg-[#0d233a] dark:bg-amber-500 dark:text-slate-950 active:bg-[#163b5c] dark:active:bg-amber-400 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-400 dark:text-slate-950" />
          <span>Solicitar una visita</span>
          <ArrowRight className="w-4 h-4 text-amber-400 dark:text-slate-950" />
        </button>
      </div>
    </div>
  );
}
