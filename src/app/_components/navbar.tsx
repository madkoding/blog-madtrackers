"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { translations } from "../i18n";
import { useLang } from "../lang-context";
import { ThemeToggle } from "./ThemeToggle";

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
        className={`px-2 py-1 rounded transition-colors ${
          lang === "en"
            ? "bg-slate-900 text-white dark:bg-white/20 dark:text-white"
            : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/10"
        }`}
      >
        EN
      </button>
      <button
        onClick={handleSelectSpanish}
        className={`px-2 py-1 rounded transition-colors ${
          lang === "es"
            ? "bg-slate-900 text-white dark:bg-white/20 dark:text-white"
            : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-transparent dark:text-white/80 dark:hover:bg-white/10"
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
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    const updateThemeState = () => {
      setIsDarkTheme(root.dataset.theme !== "light");
    };

    updateThemeState();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          updateThemeState();
          break;
        }
      }
    });

    observer.observe(root, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Detectar si no estamos en la página de inicio
  const isNotHomePage = pathname !== "/";

  // Lógica de estilos del header
  let headerClass = "";
  if (scrollpos > 10 || isMenuOpen) {
    headerClass = "theme-surface border-b theme-border shadow";
  } else if (isNotHomePage) {
    headerClass = "bg-gradient-to-r from-blue-900 via-blue-700 to-purple-700 shadow-lg";
  }

  const navContentClass = scrollpos > 10 || isMenuOpen ? "theme-surface" : "";
  const isScrolledOrMenuOpen = scrollpos > 10 || isMenuOpen;
  
  // Cuando está sobre el hero (sin scroll), SIEMPRE usar texto blanco con sombra
  // Cuando tiene scroll, usar el color del tema actual
  const textColorClass =
    scrollpos > 10 || isMenuOpen
      ? "theme-text-primary"
      : "theme-text-on-accent text-white"; // Siempre blanco sobre el hero
  
  const shouldInvertLogo = isDarkTheme || !isScrolledOrMenuOpen;
  
  // Siempre aplicar sombra al logo cuando está sobre el hero (sin scroll)
  const shouldApplyShadow = !isScrolledOrMenuOpen;

  const logoFilterParts = [
    shouldInvertLogo ? "invert(1)" : "",
    ...(shouldApplyShadow ? [
      "drop-shadow(-1.2px -1.2px 0 rgba(0, 0, 0, 0.85))",
      "drop-shadow(1.2px -1.2px 0 rgba(0, 0, 0, 0.85))",
      "drop-shadow(-1.2px 1.2px 0 rgba(0, 0, 0, 0.85))",
      "drop-shadow(1.2px 1.2px 0 rgba(0, 0, 0, 0.85))"
    ] : [])
  ].filter(Boolean);

  const logoFilter = logoFilterParts.join(" ");
  const iconInvertClass = shouldInvertLogo ? "invert" : "";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      id="header"
      className={`fixed w-full z-[200] top-0 ${headerClass} ${scrollpos > 10 || isMenuOpen ? 'header-scrolled' : ''} transition-all duration-300 ease-in-out`}
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
              className="transition-all duration-300 ease-in-out"
              style={{ filter: logoFilter }}
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
              className={`fill-current h-6 w-6 ${iconInvertClass} transition-all duration-300 ease-in-out`}
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
          } mt-2 lg:mt-0 ${navContentClass} theme-text-primary p-4 lg:p-0 z-20 transition-all duration-300 ease-in-out`}
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
            {/* Menú desplegable de países */}
            <li className="mr-3 relative">
              <button
                className={`inline-block ${textColorClass} no-underline hover:opacity-80 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out flex items-center`}
                onMouseEnter={() => setIsCountryMenuOpen(true)}
                onMouseLeave={() => setIsCountryMenuOpen(false)}
                onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsCountryMenuOpen(!isCountryMenuOpen);
                  } else if (e.key === 'Escape') {
                    setIsCountryMenuOpen(false);
                  }
                }}
                aria-expanded={isCountryMenuOpen}
                aria-haspopup="true"
                aria-label={lang === 'es' ? 'Menú de países' : 'Countries menu'}
              >
                {lang === 'es' ? 'Países' : 'Countries'}
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isCountryMenuOpen && (
                <ul 
                  className="absolute top-full left-0 theme-surface theme-border border shadow-lg rounded-lg py-2 w-48 z-50"
                  onMouseEnter={() => setIsCountryMenuOpen(true)}
                  onMouseLeave={() => setIsCountryMenuOpen(false)}
                >
                  <li>
                    <Link 
                      href="/trackers-slimevr-chile" 
                      className="block px-4 py-2 theme-text-primary hover:bg-slate-100 dark:hover:bg-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCountryMenuOpen(false);
                        }
                      }}
                    >
                      🇨🇱 Chile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/trackers-slimevr-espana" 
                      className="block px-4 py-2 theme-text-primary hover:bg-slate-100 dark:hover:bg-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCountryMenuOpen(false);
                        }
                      }}
                    >
                      🇪🇸 España
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/trackers-slimevr-mexico" 
                      className="block px-4 py-2 theme-text-primary hover:bg-slate-100 dark:hover:bg-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCountryMenuOpen(false);
                        }
                      }}
                    >
                      🇲🇽 México
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/trackers-slimevr-argentina" 
                      className="block px-4 py-2 theme-text-primary hover:bg-slate-100 dark:hover:bg-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCountryMenuOpen(false);
                        }
                      }}
                    >
                      🇦🇷 Argentina
                    </Link>
                  </li>
                  <li>
                    <div className="border-t border-gray-200 my-1" aria-hidden="true"></div>
                  </li>
                  <li>
                    <Link 
                      href="/posts/Envios_Internacionales_Trackers_SlimeVR" 
                      className="block px-4 py-2 theme-text-primary hover:bg-slate-100 dark:hover:bg-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsCountryMenuOpen(false);
                        }
                      }}
                    >
                      🌎 {lang === 'es' ? 'Todos los Países' : 'All Countries'}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
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
            {/* <NavButton href="/faq" label={t.faq} className={textColorClass} /> */}
            <LanguageSelector lang={lang} onChange={handleLangChange} />
            <li className="ml-2">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
}
