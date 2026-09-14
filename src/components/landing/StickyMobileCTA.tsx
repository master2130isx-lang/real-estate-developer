'use client';

import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

interface StickyMobileCTAProps {
  onOpenPrequalification: () => void;
}

export function StickyMobileCTA({ onOpenPrequalification }: StickyMobileCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={onOpenPrequalification}
          className="w-full h-12 bg-[#0d233a] active:bg-[#163b5c] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Solicitar una visita</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
}
