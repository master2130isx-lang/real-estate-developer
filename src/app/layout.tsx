import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';
import { getServerProperties } from '@/lib/propertiesServerStore';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// La landing se genera de forma estática y se regenera cada 5 minutos o de inmediato
// cuando el asesor guarda configuración o modelos (revalidatePath en las APIs).
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getServerCommercialConfig();
  return {
    title: config.landing.seoTitle || config.agencyName,
    description: config.landing.seoDescription || undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, initialProperties] = await Promise.all([getServerCommercialConfig(), getServerProperties()]);
  // El directorio de Telegram (Chat IDs) no se incrusta en el HTML público
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { telegramConfig, ...initialConfig } = config;

  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <AppProvider initialConfig={initialConfig} initialProperties={initialProperties}>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
