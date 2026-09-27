import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

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

export const metadata: Metadata = {
  title: 'Residencial & Asesoría Inmobiliaria | Valle de los Encinos',
  description:
    'Portal comercial y precalificación transparente para compra de vivienda con Infonavit, crédito bancario o contado en Valle de los Encinos, Salinas Victoria, N.L.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialConfig = await getServerCommercialConfig();

  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/properties/aguila-premier/01-facade.jpg"
          // @ts-expect-error fetchpriority is a modern HTML attribute
          fetchpriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <AppProvider initialConfig={initialConfig}>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
