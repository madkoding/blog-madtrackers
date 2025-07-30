import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { NavBar } from "./_components/navbar";
import Footer from "./_components/common/footer";
import { LangProvider } from "./lang-context";
import { exo2, faustina } from "./fonts";
import ResourceOptimizer from "./_components/common/ResourceOptimizer";
import CriticalCSS from "./_components/common/CriticalCSS";
import WebVitalsMonitor from "./_components/common/WebVitalsMonitor";
import ConditionalAnalytics from "./_components/common/ConditionalAnalytics";
import CountrySimulator from "./_components/dev/CountrySimulator";
import Breadcrumbs from "./_components/common/Breadcrumbs";

export const metadata: Metadata = {
  title: "madTrackers - Trackers SlimeVR Compatible Chile | Sensores de Movimiento VR",
  description: "Trackers SlimeVR Compatible fabricados en Chile. Sensores de movimiento inalámbricos para VRChat, full body tracking, batería ultra-duradera. Envíos a todo Chile.",
  keywords: "trackers slimevr compatible chile, sensores movimiento vr, vrchat chile, full body tracking chile, madtrackers, slimevr compatible chile, vr tracking chile",
  authors: [{ name: "madKoding" }],
  creator: "madKoding",
  publisher: "madTrackers",
  robots: "index, follow",
  alternates: {
    canonical: "https://www.madtrackers.com",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://www.madtrackers.com",
    siteName: "madTrackers",
    title: "madTrackers - Trackers SlimeVR Compatible Chile | Sensores de Movimiento VR",
    description: "Trackers SlimeVR Compatible fabricados en Chile. Sensores de movimiento inalámbricos para VRChat y full body tracking.",
    images: [
      {
        url: "https://www.madtrackers.com/assets/blog/preview/cover.jpg",
        width: 1200,
        height: 630,
        alt: "madTrackers - Trackers SlimeVR Chile",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "madTrackers - Trackers SlimeVR Compatible Chile",
    description: "Trackers SlimeVR Compatible fabricados en Chile para VRChat y full body tracking",
    images: ["https://www.madtrackers.com/assets/blog/preview/cover.jpg"],
  },
};

declare global {
  interface Window {
    paypal: unknown;
  }
}

/**
 * Layout raíz de la aplicación
 *
 * @param {React.ReactNode} children - Contenido de la aplicación
 * @returns {JSX.Element} Elemento raíz con scripts de PayPal y demás configuraciones
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" className={`${exo2.variable} ${faustina.variable}`}>
      <head>
        {/* CSS crítico inline para optimizar First Paint */}
        <CriticalCSS />
        
        {/* Preconnect para optimizar carga de recursos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="https://www.paypal.com" />
        <link rel="dns-prefetch" href="https://www.paypalobjects.com" />
        
        {/* Structured Data para Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "madTrackers",
              "description": "Fabricante de trackers SlimeVR Compatible en Chile. Sensores de movimiento inalámbricos para VRChat y full body tracking.",
              "url": "https://www.madtrackers.com",
              "telephone": "+56975746099",
              "email": "madkoding@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CL",
                "addressRegion": "Región Metropolitana"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -33.4691,
                "longitude": -70.6420
              },
              "sameAs": [
                "https://github.com/madkoding"
              ],
              "makesOffer": {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Trackers SlimeVR Compatible",
                  "description": "Sensores de movimiento inalámbricos para realidad virtual",
                  "brand": "madTrackers",
                  "category": "VR Hardware"
                }
              }
            })
          }}
        />
        
        {/* Structured Data para Producto */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "madTrackers SlimeVR Compatible",
              "description": "Trackers de movimiento inalámbricos compatibles con SlimeVR Compatible, fabricados en Chile para VRChat y aplicaciones de realidad virtual",
              "brand": {
                "@type": "Brand",
                "name": "madTrackers"
              },
              "manufacturer": {
                "@type": "Organization",
                "name": "madTrackers",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "CL"
                }
              },
              "category": "VR Hardware",
              "keywords": "trackers slimevr compatible chile, sensores vr, vrchat, full body tracking",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "madTrackers"
                }
              }
            })
          }}
        />
        
        <Script
          src="https://www.paypal.com/sdk/js?client-id=BAAeh6JHd00AdVhZOeXQzNBTbUJsl6pydxlxpvSOvzq4RdlRi4nwtYpYUS_DFVur0iBvF9U6vXkTIPEd7Y&components=hosted-buttons&disable-funding=venmo&currency=USD"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="madTrackers" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className={`leading-normal tracking-normal text-white gradient ${exo2.className}`}>
        <WebVitalsMonitor />
        <ResourceOptimizer />
        <ConditionalAnalytics />
        <LangProvider>
          <CountrySimulator />
          <NavBar />
          <Breadcrumbs />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
