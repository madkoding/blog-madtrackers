import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { NavBar } from "./_components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `madTrackers`,
  description: `Trackers SlimeVR por fan de VRChat para fans de VRChat.`,
  openGraph: {
    images: ["https://www.madtrackers.com/assets/blog/preview/cover.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
        <NavBar />
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
