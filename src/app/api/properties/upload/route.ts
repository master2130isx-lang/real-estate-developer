import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

const BUCKET_NAME = 'property-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB límite de seguridad
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Asegura que el bucket de Supabase exista y sea público
 */
async function ensureSupabaseBucket(supabase: any) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (!error && buckets) {
      const exists = buckets.some((b: any) => b.name === BUCKET_NAME);
      if (!exists) {
        await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
      }
    }
  } catch (err) {
    console.warn('Advertencia al verificar bucket en Supabase:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const propertyId = (formData.get('propertyId') as string) || 'modelos';

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // 1. Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Formato no válido. Solo se permiten imágenes JPG, PNG o WebP.' },
        { status: 400 }
      );
    }

    // 2. Validar tamaño máximo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'El archivo excede el límite máximo de 10 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const storagePath = `${propertyId}/${cleanFileName}`;

    // 3. Intentar guardar en Supabase Storage (Prioridad 1 para producción en Vercel)
    const supabase = getSupabase();
    if (supabase) {
      try {
        await ensureSupabaseBucket(supabase);

        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, buffer, {
            contentType: file.type,
            cacheControl: '31536000', // 1 año de caché para rendimiento óptimo
            upsert: false,
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

          return NextResponse.json({
            ok: true,
            url: publicData.publicUrl,
            storageType: 'supabase',
            fileName: cleanFileName,
          });
        }
        console.warn('Fallo al subir a Supabase Storage, aplicando fallback local:', error?.message);
      } catch (err: any) {
        console.warn('Excepción en Supabase Storage:', err.message);
      }
    }

    // 4. Fallback local para desarrollo en localhost
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties', propertyId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, cleanFileName);
      fs.writeFileSync(localFilePath, buffer);

      const publicUrl = `/uploads/properties/${propertyId}/${cleanFileName}`;
      return NextResponse.json({
        ok: true,
        url: publicUrl,
        storageType: 'local',
        fileName: cleanFileName,
      });
    } catch (localErr: any) {
      // 5. Si el sistema de archivos es de solo lectura (Vercel Serverless sin Supabase), retornar como Data URL WebP
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        ok: true,
        url: dataUrl,
        storageType: 'inline',
        fileName: cleanFileName,
      });
    }
  } catch (error: any) {
    console.error('Error al procesar subida de foto:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ ok: false, error: 'URL requerida' }, { status: 400 });
    }

    // Si la URL es de Supabase Storage, eliminar el objeto
    const supabase = getSupabase();
    if (supabase && fileUrl.includes(BUCKET_NAME)) {
      try {
        const parts = fileUrl.split(`${BUCKET_NAME}/`);
        if (parts.length > 1) {
          const relativePath = decodeURIComponent(parts[1]);
          await supabase.storage.from(BUCKET_NAME).remove([relativePath]);
        }
      } catch (e) {
        console.warn('Aviso al eliminar de Supabase Storage:', e);
      }
    }

    return NextResponse.json({ ok: true, message: 'Archivo eliminado' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
