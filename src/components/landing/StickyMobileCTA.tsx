'use client';

import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

interface StickyMobileCTAProps {
  onOpenPrequalification: () => void;
}

export function StickyMobileCTA({ onOpenPrequalification }: StickyMobileCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={onOpenPrequalification}
          className="w-full h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] active:opacity-90 text-[var(--color-navy)] dark:text-[#0B1929] font-semibold rounded text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Solicitar una visita</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
