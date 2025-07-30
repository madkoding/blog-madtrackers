"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { translations } from "../i18n";
import { useLang } from "../lang-context";

/**
 * Botón de navegación genérico
 */
const NavButton = React.memo<{
  href: string;
  label: string;
  className: string;
}>(({ href, label, className }) => {
  return (
    <li className="mr-3">
      <a
        className={`inline-block ${className} no-underline hover:text-gray-800 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out`}
        href={href}
      >
        {label}
      </a>
    </li>
  );
});

NavButton.displayName = 'NavButton';

/**
 * Selector de idioma
 */
const LanguageSelector = React.memo<{
  lang: "en" | "es";
  onChange: (lang: "en" | "es") => void;
}>(({ lang, onChange }) => {
  const handleSelectEnglish = React.useCallback(() => {
    onChange("en");
  }, [onChange]);

  const handleSelectSpanish = React.useCallback(() => {
    onChange("es");
  }, [onChange]);

  return (
    <li className="flex space-x-2 ml-4">
      <button
        onClick={handleSelectEnglish}
        className={`px-2 py-1 rounded ${
          lang === "en" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        EN
      </button>
      <button
        onClick={handleSelectSpanish}
        className={`px-2 py-1 rounded ${
          lang === "es" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        ES
      </button>
    </li>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export function NavBar() {
  const [scrollpos, setScrollpos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const { lang, setLang } = useLang();
  const t = translations[lang];

  const handleLangChange = (newLang: "en" | "es") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", newLang);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollpos(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar si no estamos en la página de inicio
  const isNotHomePage = pathname !== "/";

  // Lógica de estilos del header
  let headerClass = "";
  if (scrollpos > 10 || isMenuOpen) {
    headerClass = "bg-white shadow";
  } else if (isNotHomePage) {
    headerClass = "bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 shadow-lg";
  }

  const navContentClass = scrollpos > 10 || isMenuOpen ? "bg-white" : "";
  const textColorClass =
    scrollpos > 10 || isMenuOpen ? "text-gray-800" : "text-white";
  const svgClass = scrollpos > 10 || isMenuOpen ? "" : "invert";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      id="header"
      className={`fixed w-full z-10 top-0 ${headerClass} transition-all duration-300 ease-in-out`}
    >
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        <div className="pl-4 flex items-center space-x-2">
          <Link
            className={`toggleColour no-underline hover:no-underline font-bold text-2xl lg:text-4xl flex items-center ${textColorClass} transition-all duration-300 ease-in-out`}
            href="/"
          >
            <Image
              src="/assets/madtrackers.svg"
              alt="Logo"
              width={60}
              height={60}
              className={svgClass}
            />
            <span className="ml-2">madTrackers</span>
          </Link>
        </div>
        <div className="block lg:hidden pr-4">
          <button
            id="nav-toggle"
            onClick={toggleMenu}
            className="flex items-center p-1 text-pink-800 hover:text-gray-900 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          >
            <svg
              className={`fill-current h-6 w-6 ${svgClass} transition-all duration-300 ease-in-out`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div
          className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${
            isMenuOpen ? "" : "hidden"
          } mt-2 lg:mt-0 ${navContentClass} text-black p-4 lg:p-0 z-20 transition-all duration-300 ease-in-out`}
          id="nav-content"
        >
          <ul
            className={`list-reset lg:flex justify-end flex-1 items-center ${textColorClass}`}
          >
            <NavButton href="/" label={t.home} className={textColorClass} />
            <NavButton
              href="/trackers-slimevr-chile"
              label="SlimeVR Compatible"
              className={textColorClass}
            />
            <NavButton
              href="/seguimiento"
              label={t.tracking}
              className={textColorClass}
            />
            <NavButton
              href="/posts/Configuracion_Inicial"
              label={t.firstConfig}
              className={textColorClass}
            />
            <NavButton href="/faq" label={t.faq} className={textColorClass} />
            <LanguageSelector lang={lang} onChange={handleLangChange} />
          </ul>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
}
