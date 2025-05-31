import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { NavBar } from "./_components/navbar";
import Footer from "./_components/common/footer";
import { LangProvider } from "./lang-context";

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
    <html lang="en">
      <head>
        <Script
          src="https://www.paypal.com/sdk/js?client-id=BAAeh6JHd00AdVhZOeXQzNBTbUJsl6pydxlxpvSOvzq4RdlRi4nwtYpYUS_DFVur0iBvF9U6vXkTIPEd7Y&components=hosted-buttons&disable-funding=venmo&currency=USD"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
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
      <body className="leading-normal tracking-normal text-white gradient">
        <LangProvider>
          <NavBar />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
