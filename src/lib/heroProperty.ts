import type { Property } from '@/types';
import type { CommercialConfig } from '@/config/commercialConfig';

/**
 * Modelo que se muestra en la portada (Hero), con una sola regla para todo el sitio:
 * 1. El elegido en Configuración (heroPropertyId), si todavía existe.
 * 2. El marcado como destacado (isHero).
 * 3. El primero del catálogo.
 */
export function resolveHeroProperty(
  properties: Property[],
  config: Pick<CommercialConfig, 'heroPropertyId'>
): Property | undefined {
  return (
    (config.heroPropertyId ? properties.find((p) => p.id === config.heroPropertyId) : undefined) ||
    properties.find((p) => p.isHero) ||
    properties[0]
  );
}
