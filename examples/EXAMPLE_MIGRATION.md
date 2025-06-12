/**
 * EJEMPLO: Cómo migrar el layout actual al nuevo sistema de Atomic Design
 * 
 * Este archivo muestra cómo se vería el layout.tsx utilizando el nuevo sistema
 * No reemplaza el archivo actual, es solo una demostración
 */

import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { MainLayout } from "../components/templates/MainLayout";
import { LangProvider } from "./lang-context";
import { exo2, faustina } from "./fonts";
import ResourceOptimizer from "./_components/common/ResourceOptimizer";
import CriticalCSS from "./_components/common/CriticalCSS";
import WebVitalsMonitor from "./_components/common/WebVitalsMonitor";
import ConditionalAnalytics from "./_components/common/ConditionalAnalytics";
import { translations } from "./i18n";
import { useLang } from "./lang-context";

export const metadata: Metadata = {
  title: `madTrackers`,
  description: `Trackers Slime por fan de VRChat para fans de VRChat.`,
  openGraph: {
    images: ["https://www.madtrackers.com/assets/blog/preview/cover.jpg"],
  },
};

declare global {
  interface Window {
    paypal: unknown;
  }
}

/**
 * EJEMPLO: Layout raíz usando Atomic Design
 * 
 * Beneficios de esta aproximación:
 * - Componentes reutilizables y consistentes
 * - Fácil mantenimiento y testing
 * - Props tipadas y documentadas
 * - Estructura escalable
 */
export default function RootLayoutExample({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  
  // Hook para obtener el idioma actual (se movería a un provider)
  const { lang, setLang } = useLang();
  const t = translations[lang];

  return (
    <html lang="en" className={`${exo2.variable} ${faustina.variable}`}>
      <head>
        <CriticalCSS />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.paypal.com" />
        <link rel="dns-prefetch" href="https://www.paypalobjects.com" />
        
        <Script
          src="https://www.paypal.com/sdk/js?client-id=BAAeh6JHd00AdVhZOeXQzNBTbUJsl6pydxlxpvSOvzq4RdlRi4nwtYpYUS_DFVur0iBvF9U6vXkTIPEd7Y&components=hosted-buttons&disable-funding=venmo&currency=USD"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* ... resto de favicons y meta tags ... */}
      </head>
      
      <body className={`leading-normal tracking-normal text-white gradient ${exo2.className}`}>
        <WebVitalsMonitor />
        <ResourceOptimizer />
        <ConditionalAnalytics />
        
        <LangProvider>
          {/* 
            NUEVO: Usando MainLayout del sistema de Atomic Design
            - Header y Footer son organismos reutilizables
            - Props tipadas para configuración
            - Fácil personalización por página
          */}
          <MainLayout
            headerProps={{
              showLanguageSelector: true,
              currentLanguage: lang,
              onLanguageChange: setLang,
              translations: {
                home: t.home,
                contact: t.contact,
                faq: t.faq,
                pricing: t.pricing
              },
              navItems: [
                { href: "/", label: t.home },
                { href: "/faq", label: t.faq },
                { href: "/#pricing", label: t.pricing },
                { href: "/contacto", label: t.contact },
              ]
            }}
            footerProps={{
              companyName: "madTrackers",
              description: t.footerDescription,
              contactInfo: {
                email: "info@madtrackers.com",
                phone: "+56 9 1234 5678"
              },
              sections: [
                {
                  title: t.navigation,
                  links: [
                    { href: "/", label: t.home },
                    { href: "/contacto", label: t.contact }
                  ]
                }
              ]
            }}
          >
            {children}
          </MainLayout>
        </LangProvider>
      </body>
    </html>
  );
}

/**
 * MIGRACIÓN PASO A PASO:
 * 
 * 1. Crear componentes básicos (atoms) ✅
 * 2. Combinar en moléculas ✅ 
 * 3. Crear organismos (Header, Footer) ✅
 * 4. Crear templates (MainLayout) ✅
 * 5. Migrar gradualmente las páginas
 * 6. Actualizar tests y storybook
 * 7. Documentar componentes
 * 
 * BENEFICIOS INMEDIATOS:
 * - Componentes más mantenibles
 * - Mejor experiencia de desarrollo
 * - Reutilización maximizada
 * - Testing simplificado
 * - Documentación autogenerada con TypeScript
 */
