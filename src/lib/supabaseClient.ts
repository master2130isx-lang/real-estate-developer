import { createClient, SupabaseClient } from '@supabase/supabase-js';

function cleanUrl(raw?: string): string {
  if (!raw) return '';
  let url = raw.trim().replace(/^["']|["']$/g, '').trim();
  // Quitar /rest/v1 o cualquier subruta de api agregada accidentalmente
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/auth\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

function cleanKey(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']|["']$/g, '').trim();
}

const supabaseUrl = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
const supabaseKey = cleanKey(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let cachedClient: SupabaseClient | null = null;

/**
 * Verifica si las variables de entorno de Supabase están configuradas válidamente
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey &&
    supabaseKey.length > 20
  );
}

/**
 * Retorna el cliente singleton de Supabase si está configurado, o null si está en modo fallback local
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}
