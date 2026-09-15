import fs from 'fs';
import path from 'path';
import { COMMERCIAL_CONFIG, CommercialConfig } from '@/config/commercialConfig';
import { getSupabase } from './supabaseClient';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'commercialConfigStore.json');
const TMP_CONFIG_FILE_PATH = path.join('/tmp', 'commercialConfigStore.json');

let inMemoryConfig: CommercialConfig = { ...COMMERCIAL_CONFIG };

function readConfigFromLocalStorage(): CommercialConfig {
  try {
    if (fs.existsSync(TMP_CONFIG_FILE_PATH)) {
      const tmpData = fs.readFileSync(TMP_CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(tmpData);
      if (parsed && parsed.advisorName) {
        inMemoryConfig = { ...COMMERCIAL_CONFIG, ...parsed };
        return inMemoryConfig;
      }
    }
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && parsed.advisorName) {
        inMemoryConfig = { ...COMMERCIAL_CONFIG, ...parsed };
        return inMemoryConfig;
      }
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
        const loadedConfig: CommercialConfig = {
          ...COMMERCIAL_CONFIG,
          advisorName: data.advisor_name || COMMERCIAL_CONFIG.advisorName,
          advisorRole: data.advisor_role || COMMERCIAL_CONFIG.advisorRole,
          agencyName: data.agency_name || COMMERCIAL_CONFIG.agencyName,
          coverageZone: data.coverage_zone || COMMERCIAL_CONFIG.coverageZone,
          contactChannels: data.contact_channels || COMMERCIAL_CONFIG.contactChannels,
          socialLinks: data.social_links || COMMERCIAL_CONFIG.socialLinks,
          telegramConfig: data.telegram_config || COMMERCIAL_CONFIG.telegramConfig,
          featuredPrice: data.featured_price || COMMERCIAL_CONFIG.featuredPrice,
        };
        inMemoryConfig = loadedConfig;
        return loadedConfig;
      }

      if (!error && !data) {
        // Inicializar registro en Supabase con la configuración por defecto
        await supabase.from('commercial_config').insert({
          id: 'primary_config',
          advisor_name: COMMERCIAL_CONFIG.advisorName,
          advisor_role: COMMERCIAL_CONFIG.advisorRole,
          agency_name: COMMERCIAL_CONFIG.agencyName,
          coverage_zone: COMMERCIAL_CONFIG.coverageZone,
          contact_channels: COMMERCIAL_CONFIG.contactChannels,
          social_links: COMMERCIAL_CONFIG.socialLinks,
          telegram_config: COMMERCIAL_CONFIG.telegramConfig,
          featured_price: COMMERCIAL_CONFIG.featuredPrice,
        });
        return COMMERCIAL_CONFIG;
      }
    } catch (err) {
      console.warn('Error al leer configuración comercial de Supabase, usando local:', err);
    }
  }

  return readConfigFromLocalStorage();
}

export async function saveServerCommercialConfig(
  configUpdate: Partial<CommercialConfig>
): Promise<CommercialConfig> {
  const current = await getServerCommercialConfig();
  const updated: CommercialConfig = {
    ...current,
    ...configUpdate,
    contactChannels: {
      ...current.contactChannels,
      ...(configUpdate.contactChannels || {}),
    },
    socialLinks: {
      ...current.socialLinks,
      ...(configUpdate.socialLinks || {}),
    },
    telegramConfig: {
      ...current.telegramConfig,
      ...(configUpdate.telegramConfig || {}),
    },
    featuredPrice: {
      ...current.featuredPrice,
      ...(configUpdate.featuredPrice || {}),
    },
  };

  // Guardar en local/tmp
  writeConfigToLocalStorage(updated);

  // Guardar en Supabase PostgreSQL
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('commercial_config').upsert({
        id: 'primary_config',
        advisor_name: updated.advisorName,
        advisor_role: updated.advisorRole,
        agency_name: updated.agencyName,
        coverage_zone: updated.coverageZone,
        contact_channels: updated.contactChannels,
        social_links: updated.socialLinks,
        telegram_config: updated.telegramConfig,
        featured_price: updated.featuredPrice,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error al guardar configuración en Supabase:', err);
    }
  }

  return updated;
}
