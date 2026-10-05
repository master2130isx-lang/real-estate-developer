import type { FinancingType, Property } from '@/types';

export const FINANCING_SHORT_LABELS: Record<FinancingType, string> = {
  infonavit: 'Infonavit',
  fovissste: 'FOVISSSTE',
  bancario: 'Crédito Bancario',
  contado: 'Contado',
  otro: 'Otro esquema',
  necesita_orientacion: 'Por definir',
};

export const AVAILABILITY_LABELS: Record<Property['availabilityStatus'], { label: string; className: string }> = {
  disponible: {
    label: 'Disponible',
    className: 'text-[var(--color-success)] bg-[var(--color-success-bg)]',
  },
  ultimas_unidades: {
    label: 'Últimas unidades',
    className: 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50',
  },
  preventa: {
    label: 'Preventa',
    className: 'text-sky-800 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/50',
  },
  agotado: {
    label: 'Agotado',
    className: 'text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-800',
  },
};
