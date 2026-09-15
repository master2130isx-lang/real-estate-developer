import fs from 'fs';
import path from 'path';
import { COMMERCIAL_CONFIG, CommercialConfig } from '@/config/commercialConfig';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'commercialConfigStore.json');

let inMemoryConfig: CommercialConfig = { ...COMMERCIAL_CONFIG };

function readConfigFromStorage(): CommercialConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (parsed && parsed.advisorName) {
        inMemoryConfig = { ...COMMERCIAL_CONFIG, ...parsed };
        return inMemoryConfig;
      }
    }
  } catch (error) {
    console.warn('Advertencia al leer commercialConfigStore.json:', error);
  }
  return inMemoryConfig;
}

function writeConfigToStorage(config: CommercialConfig): void {
  inMemoryConfig = config;
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Advertencia al escribir en commercialConfigStore.json:', error);
  }
}

export async function getServerCommercialConfig(): Promise<CommercialConfig> {
  return readConfigFromStorage();
}

export async function saveServerCommercialConfig(configUpdate: Partial<CommercialConfig>): Promise<CommercialConfig> {
  const current = readConfigFromStorage();
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

  writeConfigToStorage(updated);
  return updated;
}
