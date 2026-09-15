-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS DEFINITIVA (SUPABASE / POSTGRESQL)
-- Plataforma Inmobiliaria Comercial - Fraccionamiento Valle de los Encinos
-- ==============================================================================
--
-- INSTRUCCIONES DE INSTALACIÓN:
-- 1. Inicia sesión en https://supabase.com y abre tu proyecto.
-- 2. Ve al menú lateral "SQL Editor".
-- 3. Pega todo el contenido de este archivo y haz clic en "Run" (Ejecutar).
-- 4. Copia tu "Project URL" y "service_role key" (en Settings > API) y
--    agrégalas a Vercel o a tu archivo .env.local:
--      NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
--      SUPABASE_SERVICE_ROLE_KEY="tu-service-role-secret-key"
-- ==============================================================================

-- 1. TABLA DE PROSPECTOS Y CITAS (LEADS)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  folio TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_channel TEXT DEFAULT 'whatsapp',
  preferred_contact_time TEXT DEFAULT 'tarde',
  interested_zone TEXT DEFAULT 'Salinas Victoria, N.L. (Valle de los Encinos)',
  selected_property_id TEXT,
  selected_property_title TEXT,
  budget_range TEXT DEFAULT 'aun_no_lo_se',
  purchase_timeline TEXT DEFAULT 'corto',
  financing_type TEXT DEFAULT 'infonavit',
  financing_subtype TEXT,
  needs_orientation BOOLEAN DEFAULT FALSE,
  privacy_consent_accepted BOOLEAN DEFAULT TRUE,
  marketing_consent_accepted BOOLEAN DEFAULT FALSE,
  
  -- Manejo de NSS
  nss_status TEXT DEFAULT 'no_aplica',
  nss_value_encrypted_mock TEXT,
  nss_last_four TEXT,
  
  -- Seguimiento de atribución comercial interna (15 días)
  attribution_status TEXT DEFAULT 'no_aplica',
  attribution_advisor TEXT,
  attribution_confirmed_at TEXT,
  attribution_expires_at TEXT,
  attribution_reference TEXT,
  attribution_confirmed_by TEXT,
  attribution_notes TEXT,
  
  -- Estado y gestión comercial
  commercial_status TEXT DEFAULT 'nuevo',
  compatibility TEXT DEFAULT 'media',
  next_action TEXT,
  assigned_advisor TEXT,
  
  -- Detalles de cita, notas y bitácora (JSONB)
  appointment_request JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  audit_history JSONB DEFAULT '[]'::jsonb,
  
  -- Metadatos de auditoría en base de datos
  db_created_at TIMESTAMPTZ DEFAULT NOW(),
  db_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas en panel
CREATE INDEX IF NOT EXISTS idx_leads_commercial_status ON leads (commercial_status);
CREATE INDEX IF NOT EXISTS idx_leads_attribution_status ON leads (attribution_status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- 2. TABLA DE CONFIGURACIÓN COMERCIAL Y MARCA BLANCA
CREATE TABLE IF NOT EXISTS commercial_config (
  id TEXT PRIMARY KEY DEFAULT 'primary_config',
  advisor_name TEXT NOT NULL,
  advisor_role TEXT,
  agency_name TEXT NOT NULL,
  coverage_zone TEXT,
  contact_channels JSONB NOT NULL,
  social_links JSONB NOT NULL,
  telegram_config JSONB,
  featured_price JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE TELEMETRÍA DEL EMBUDO (FUNNEL EVENTS)
CREATE TABLE IF NOT EXISTS funnel_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_funnel_event_name ON funnel_events (event_name);
CREATE INDEX IF NOT EXISTS idx_funnel_timestamp ON funnel_events (timestamp DESC);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD ESTRICTAS (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- 1. SEGURIDAD EN PROSPECTOS (LEADS):
-- Público anónimo: ÚNICAMENTE puede registrar su propia solicitud desde la landing (INSERT)
-- NUNCA puede consultar (SELECT), modificar (UPDATE) ni borrar (DELETE) prospectos o NSS de otros clientes.
CREATE POLICY "Permitir envio de prospectos desde landing publica"
  ON leads FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Asesor autenticado y backend de servidor: Lectura y gestión comercial completa
CREATE POLICY "Permitir lectura y gestion comercial solo a usuarios autenticados"
  ON leads FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 2. SEGURIDAD EN CONFIGURACIÓN COMERCIAL (COMMERCIAL_CONFIG):
-- Público anónimo: Solo puede leer los datos comerciales públicos para mostrarlos en la web
CREATE POLICY "Lectura publica de configuracion comercial en landing"
  ON commercial_config FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Asesor autenticado y backend: Pueden editar teléfonos, redes y datos comerciales
CREATE POLICY "Edicion de configuracion comercial solo a asesores autenticados"
  ON commercial_config FOR ALL
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 3. SEGURIDAD EN TELEMETRÍA (FUNNEL_EVENTS):
-- Público anónimo: Solo puede registrar eventos de navegación (INSERT)
CREATE POLICY "Registro de telemetria anonima"
  ON funnel_events FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Asesor autenticado: Auditoría de telemetría
CREATE POLICY "Lectura de telemetria para asesores autenticados"
  ON funnel_events FOR SELECT
  TO authenticated, service_role
  USING (true);

-- ==============================================================================
-- SEMBRADO INICIAL DE CONFIGURACIÓN COMERCIAL (SEED DATA)
-- ==============================================================================
INSERT INTO commercial_config (
  id,
  advisor_name,
  advisor_role,
  agency_name,
  coverage_zone,
  contact_channels,
  social_links,
  telegram_config,
  featured_price
)
VALUES (
  'primary_config',
  'Carlos Cantú',
  'Asesor Inmobiliario Certificado',
  'Valle de los Encinos Residencial',
  'Salinas Victoria, Nuevo León',
  '{
    "phone": "+52 33 4254 6271",
    "whatsapp": "523342546271",
    "email": "asesoria@valledelosencinos.com",
    "officeAddressNote": "Caseta principal de acceso sobre Calzada del Sol, Valle de los Encinos, Salinas Victoria, N.L."
  }'::jsonb,
  '{
    "facebook": "",
    "instagram": "",
    "tiktok": "",
    "youtube": ""
  }'::jsonb,
  '{
    "botToken": "",
    "advisorChatId": ""
  }'::jsonb,
  '{
    "amount": 1180000,
    "amountFormatted": "$1,180,000 MXN",
    "notes": "Precio base sujeto a disponibilidad y cambios sin previo aviso"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
