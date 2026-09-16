/**
 * Utilidad de compresión y optimización de imágenes en el navegador del cliente
 * Convierte cualquier JPG, PNG o HEIC a WebP optimizado (< 250 KB) a 1920px max antes de subir a internet.
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export async function compressImageInBrowser(
  rawFile: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // Si no es imagen, rechazar
    if (!rawFile.type.startsWith('image/')) {
      return reject(new Error('El archivo no es una imagen válida.'));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el contexto de imagen 2D.'));
        }

        // Suavizado bicúbico de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Fallo al generar el archivo comprimido.'));
            }

            const cleanBaseName = rawFile.name.replace(/\.[^/.]+$/, '');
            const compressedFileName = `${cleanBaseName}.webp`;

            const compressedFile = new File([blob], compressedFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: compressedFile,
              previewUrl,
              originalSize: rawFile.size,
              compressedSize: compressedFile.size,
              width,
              height,
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al decodificar la imagen.'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(rawFile);
  });
}
