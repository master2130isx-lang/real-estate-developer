-- ==============================================================================
-- MIGRACIÓN 2026-10-05: CURP, origen de prospectos y configuración completa
-- ==============================================================================
-- Ejecutar UNA vez en Supabase > SQL Editor. Es aditiva y segura de re-ejecutar:
-- no borra ni modifica datos existentes, y la versión anterior del sitio sigue
-- funcionando con estas columnas nuevas.
--
-- Qué agrega:
--   1. leads.curp_value / leads.curp_last_four  -> la CURP de FOVISSSTE ya no se pierde.
--   2. leads.lead_source                        -> canal y parámetros UTM de cada prospecto.
--   3. commercial_config.settings               -> configuración completa en JSON
--      (textos de la landing, horarios de visita, días de atribución, portada elegida).
--      Así los campos nuevos de configuración ya no requieren más migraciones.
-- ==============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS curp_value TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS curp_last_four TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source JSONB;

ALTER TABLE commercial_config ADD COLUMN IF NOT EXISTS settings JSONB;

-- Recargar el caché de esquema de la API de Supabase para que vea las columnas nuevas
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- PASO OPCIONAL (RECOMENDADO): cerrar la lectura anónima de commercial_config
-- ==============================================================================
-- La política "Lectura publica de configuracion comercial en landing" permite que
-- cualquiera con la anon key lea la tabla completa, incluidos telegram_config y
-- settings (Chat IDs de Telegram). El sitio no la necesita: el servidor usa la
-- service_role key y la landing obtiene la configuración a través de /api/config.
--
-- Ejecuta este bloque SOLO si SUPABASE_SERVICE_ROLE_KEY está configurada en Vercel
-- (la pestaña "Base de Datos" del panel lo indica). Para ejecutarlo, quita los "--".
--
-- DROP POLICY IF EXISTS "Lectura publica de configuracion comercial en landing" ON commercial_config;
