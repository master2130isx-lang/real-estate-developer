import fs from 'fs';
import path from 'path';
import { COMMERCIAL_CONFIG, CommercialConfig, mergeCommercialConfig } from '@/config/commercialConfig';
import { getSupabase } from './supabaseClient';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'commercialConfigStore.json');
const TMP_CONFIG_FILE_PATH = path.join('/tmp', 'commercialConfigStore.json');

let inMemoryConfig: CommercialConfig = { ...COMMERCIAL_CONFIG };
let warnedMissingSettingsColumn = false;

function readConfigFromLocalStorage(): CommercialConfig {
  // Rutas fijas (no en un bucle) para que el bundler no rastree todo el proyecto
  try {
    const raw = fs.existsSync(TMP_CONFIG_FILE_PATH)
      ? fs.readFileSync(TMP_CONFIG_FILE_PATH, 'utf-8')
      : fs.existsSync(CONFIG_FILE_PATH)
      ? fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')
      : null;
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.advisorName) {
      inMemoryConfig = mergeCommercialConfig(COMMERCIAL_CONFIG, parsed);
    }
  } catch (error) {
    console.warn('Advertencia al leer commercialConfigStore.json local:', error);
  }
  return inMemoryConfig;
}

function writeConfigToLocalStorage(config: CommercialConfig): void {
  inMemoryConfig = config;
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Persistiendo configuración únicamente en memoria:', tmpErr);
    }
  }
}

function sanitizeTelegramConfig(tgConfig?: CommercialConfig['telegramConfig']) {
  if (!tgConfig) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { botToken, ...safe } = tgConfig;
  return safe;
}

function withoutSecrets(config: CommercialConfig): CommercialConfig {
  return { ...config, telegramConfig: sanitizeTelegramConfig(config.telegramConfig) };
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === 'PGRST204' || error.code === '42703' || /column/i.test(error.message || '');
}

/** Convierte una fila de commercial_config en configuración completa. */
function rowToConfig(data: Record<string, unknown>): CommercialConfig {
  // Formato nuevo: toda la configuración vive en la columna JSON `settings`
  if (data.settings && typeof data.settings === 'object') {
    return mergeCommercialConfig(COMMERCIAL_CONFIG, data.settings);
  }
  // Formato anterior: columnas individuales
  return mergeCommercialConfig(COMMERCIAL_CONFIG, {
    advisorName: data.advisor_name || undefined,
    advisorRole: data.advisor_role || undefined,
    agencyName: data.agency_name || undefined,
    coverageZone: data.coverage_zone || undefined,
    contactChannels: data.contact_channels || undefined,
    socialLinks: data.social_links || undefined,
    telegramConfig: data.telegram_config || undefined,
    featuredPrice: data.featured_price || undefined,
  });
}

function configToRow(config: CommercialConfig): Record<string, unknown> {
  const safe = withoutSecrets(config);
  return {
    id: 'primary_config',
    advisor_name: safe.advisorName,
    advisor_role: safe.advisorRole,
    agency_name: safe.agencyName,
    coverage_zone: safe.coverageZone,
    contact_channels: safe.contactChannels,
    social_links: safe.socialLinks,
    telegram_config: safe.telegramConfig,
    featured_price: safe.featuredPrice,
    settings: safe,
    updated_at: new Date().toISOString(),
  };
}

async function upsertConfigRow(config: CommercialConfig): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const row = configToRow(config);
  let { error } = await supabase.from('commercial_config').upsert(row);
  if (isMissingColumnError(error)) {
    if (!warnedMissingSettingsColumn) {
      console.warn(
        'Supabase: falta la columna "settings" en commercial_config. Ejecuta ' +
          'supabase/migrations/2026-10-05_curp_origen_configuracion.sql para guardar textos de la landing, ' +
          'horarios y portada. Guardando solo los campos básicos.'
      );
      warnedMissingSettingsColumn = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { settings, ...legacyRow } = row;
    ({ error } = await supabase.from('commercial_config').upsert(legacyRow));
  }
  if (error) {
    console.error('Error al guardar configuración en Supabase:', error.message);
    throw new Error(error.message);
  }
}

export async function getServerCommercialConfig(): Promise<CommercialConfig> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('commercial_config')
        .select('*')
        .eq('id', 'primary_config')
        .maybeSingle();

      if (!error && data) {
        inMemoryConfig = withoutSecrets(rowToConfig(data));
        return inMemoryConfig;
      }

      if (!error && !data) {
        // Inicializar registro en Supabase con la configuración por defecto
        await upsertConfigRow(COMMERCIAL_CONFIG).catch(() => {});
        return withoutSecrets(COMMERCIAL_CONFIG);
      }
    } catch (err) {
      console.warn('Error al leer configuración comercial de Supabase, usando local:', err);
    }
  }

  return withoutSecrets(readConfigFromLocalStorage());
}

export async function saveServerCommercialConfig(configUpdate: Partial<CommercialConfig>): Promise<CommercialConfig> {
  const current = await getServerCommercialConfig();
  const updated = withoutSecrets(mergeCommercialConfig(current, configUpdate));

  writeConfigToLocalStorage(updated);
  await upsertConfigRow(updated);

  return updated;
}

/** Indica si la columna `settings` ya existe (para el diagnóstico de la pestaña Base de Datos). */
export async function hasSettingsColumn(): Promise<boolean | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from('commercial_config').select('settings').limit(1);
  return !isMissingColumnError(error);
}
