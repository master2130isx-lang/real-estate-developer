import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabaseClient';
import { getServerLeads } from '@/lib/leadsServerStore';

export async function GET() {
  const configured = isSupabaseConfigured();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!configured) {
    const localLeads = await getServerLeads();
    return NextResponse.json({
      ok: true,
      provider: 'local_fallback',
      status: 'active',
      isConfigured: false,
      message: 'Modo local activo (almacenamiento en /tmp y JSON). Supabase listo para ser configurado.',
      leadsCount: localLeads.length,
      config: {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseKey),
      },
    });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      provider: 'local_fallback',
      status: 'error',
      isConfigured: false,
      error: 'No se pudo inicializar el cliente de Supabase',
    });
  }

  const startTime = Date.now();
  try {
    // 1. Probar consulta a tabla leads
    const { count: leadsCount, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // 2. Probar consulta a tabla commercial_config
    const { error: configError } = await supabase
      .from('commercial_config')
      .select('id', { head: true });

    const latencyMs = Date.now() - startTime;

    if (leadsError || configError) {
      return NextResponse.json({
        ok: false,
        provider: 'supabase',
        status: 'migration_needed',
        isConfigured: true,
        latencyMs,
        tablesStatus: {
          leads: !leadsError,
          commercial_config: !configError,
        },
        error: leadsError?.message || configError?.message || 'Tablas no encontradas. Ejecuta supabase/schema.sql en el SQL Editor de Supabase.',
      });
    }

    return NextResponse.json({
      ok: true,
      provider: 'supabase',
      status: 'connected',
      isConfigured: true,
      latencyMs,
      leadsCount: leadsCount ?? 0,
      tablesStatus: {
        leads: true,
        commercial_config: true,
      },
      message: '¡Conexión exitosa a Supabase PostgreSQL! Persistencia permanente activa.',
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      provider: 'supabase',
      status: 'connection_error',
      isConfigured: true,
      error: err.message || 'Error de conexión con Supabase',
    });
  }
}
