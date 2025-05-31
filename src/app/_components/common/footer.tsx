"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

/**
 * Props para el componente Footer de MadTrackers.
 */
export type FooterProps = Record<string, never>;

/**
 * Footer corporativo para MadTrackers.
 * Incluye logo, navegación, información de contacto y redes sociales.
 */
const Footer: React.FC<FooterProps> = () => {
  const { lang } = useLang();
  const t = translations[lang];

  // Forzar re-render en textos que dependan del idioma y la fecha
  React.useEffect(() => {}, [lang]);

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo y descripción */}
        <div className="flex flex-col items-start">
          <Image
            src="/assets/madtrackers.svg"
            alt="Logo"
            width={60}
            height={60}
            className={"invert"}
          />
          <p className="text-lg text-white font-bold">madTrackers</p>
          <br />
          <p className="text-sm text-gray-400">{t.footerDescription}</p>
        </div>

        {/* Links de navegación */}
        <div>
          <h4 className="text-lg font-semibold mb-4">{t.navigation}</h4>
          <ul className="space-y-2 text-gray-300">
            <li>
              <Link href="/" className="hover:text-white">
                {t.home}
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                {t.contact}
              </Link>
            </li>
          </ul>
        </div>

        {/* Redes sociales y contacto */}
        <div>
          <h4 className="text-lg font-semibold mb-4">{t.contactUs}</h4>
          <p className="text-gray-300 text-sm">{t.email}</p>
          <p className="text-gray-300 text-sm">{t.phone}</p>

          <div className="flex items-center space-x-4 mt-4">
            <a
              href="https://twitter.com/madtrackers"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4 1.7a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11.64c-2.5 0-4.51 2-4.51 4.49 0 .35.04.7.1 1.03A12.8 12.8 0 013 1.67a4.49 4.49 0 001.4 6A4.51 4.51 0 012.8 7v.05A4.49 4.49 0 006.44 11a4.52 4.52 0 01-2.04.08A4.5 4.5 0 008 14.56a9.09 9.09 0 01-6.7 1.9A12.8 12.8 0 007 20c8.2 0 12.7-6.8 12.7-12.7v-.58A9.22 9.22 0 0023 3z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/madkoding"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M12 2.16c3.2 0 3.584.012 4.85.07 1.17.055 1.97.24 2.427.4.59.22 1.01.49 1.45.93.44.44.71.86.93 1.45.16.458.35 1.258.4 2.428.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.4 2.428-.22.59-.49 1.01-.93 1.45-.44.44-.86.71-1.45.93-.458.16-1.258.35-2.428.4-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.428-.4-.59-.22-1.01-.49-1.45-.93-.44-.44-.71-.86-.93-1.45-.16-.458-.35-1.258-.4-2.428C2.172 15.584 2.16 15.2 2.16 12s.012-3.584.07-4.85c.055-1.17.24-1.97.4-2.428.22-.59.49-1.01.93-1.45.44-.44.86-.71 1.45-.93.458-.16 1.258-.35 2.428-.4C8.416 2.172 8.8 2.16 12 2.16zm0-2.16C8.735 0 8.332.013 7.052.072 5.78.131 4.803.346 4.042.7a4.507 4.507 0 00-1.63 1.06A4.507 4.507 0 00.700 3.042c-.354.761-.569 1.738-.628 3.01C.013 8.332 0 8.735 0 12s.013 3.668.072 4.948c.059 1.272.274 2.249.628 3.01a4.507 4.507 0 001.06 1.63 4.507 4.507 0 001.63 1.06c.761.354 1.738.569 3.01.628C8.332 23.987 8.735 24 12 24s3.668-.013 4.948-.072c1.272-.059 2.249-.274 3.01-.628a4.507 4.507 0 001.63-1.06 4.507 4.507 0 001.06-1.63c.354-.761.569-1.738.628-3.01C23.987 15.668 24 15.265 24 12s-.013-3.668-.072-4.948c-.059-1.272-.274-2.249-.628-3.01a4.507 4.507 0 00-1.06-1.63A4.507 4.507 0 0019.958.700c-.761-.354-1.738-.569-3.01-.628C15.668.013 15.265 0 12 0z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        {t.rights.replace("{year}", String(new Date().getFullYear()))}
      </div>
    </footer>
  );
};

export default Footer;
