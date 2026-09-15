import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { getServerCommercialConfig } from '@/lib/commercialConfigStore';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <AppProvider initialConfig={initialConfig}>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
