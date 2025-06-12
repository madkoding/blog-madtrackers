"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../atoms";
import { cn } from "../../../utils/cn";

// Types
interface NavButtonProps {
  href: string;
  label: string;
  className?: string;
}

interface LanguageSelectorProps {
  lang: "en" | "es";
  onChange: (lang: "en" | "es") => void;
}

interface NavigationProps {
  translations: Record<string, string>;
  lang: "en" | "es";
  onLanguageChange: (lang: "en" | "es") => void;
}

/**
 * Botón de navegación genérico
 */
const NavButton = React.memo<NavButtonProps>(({ href, label, className }) => {
  return (
    <li className="mr-3">
      <Link
        className={cn(
          "inline-block no-underline hover:text-gray-800 hover:underline py-2 px-4 transition-all duration-300 ease-in-out",
          className
        )}
        href={href}
      >
        {label}
      </Link>
    </li>
  );
});

NavButton.displayName = 'NavButton';

/**
 * Selector de idioma
 */
const LanguageSelector = React.memo<LanguageSelectorProps>(({ lang, onChange }) => {
  const handleSelectEnglish = React.useCallback(() => {
    onChange("en");
  }, [onChange]);

  const handleSelectSpanish = React.useCallback(() => {
    onChange("es");
  }, [onChange]);

  return (
    <li className="flex space-x-2 ml-4">
      <Button
        onClick={handleSelectEnglish}
        variant={lang === "en" ? "default" : "outline"}
        size="sm"
        className="px-2 py-1"
      >
        EN
      </Button>
      <Button
        onClick={handleSelectSpanish}
        variant={lang === "es" ? "default" : "outline"}
        size="sm"
        className="px-2 py-1"
      >
        ES
      </Button>
    </li>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export const Navigation = React.memo<NavigationProps>(({ 
  translations: t, 
  lang, 
  onLanguageChange 
}) => {
  const [scrollpos, setScrollpos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

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
    headerClass = "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-lg";
  }

  const navContentClass = scrollpos > 10 || isMenuOpen ? "bg-white" : "";
  const textColorClass = scrollpos > 10 || isMenuOpen ? "text-gray-800" : "text-white";
  const svgClass = scrollpos > 10 || isMenuOpen ? "" : "invert";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      id="header"
      className={cn(
        "fixed w-full z-30 top-0 transition-all duration-300 ease-in-out",
        headerClass
      )}
    >
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        {/* Logo */}
        <div className="pl-4 flex items-center space-x-2">
          <Link
            className={cn(
              "no-underline hover:no-underline font-bold text-2xl lg:text-4xl flex items-center transition-all duration-300 ease-in-out",
              textColorClass
            )}
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

        {/* Menu Toggle Button */}
        <div className="block lg:hidden pr-4">
          <button
            id="nav-toggle"
            onClick={toggleMenu}
            className={cn(
              "flex items-center p-1 hover:text-gray-900 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out",
              scrollpos > 10 || isMenuOpen ? "text-pink-800" : "text-white"
            )}
          >
            <svg
              className={cn("fill-current h-6 w-6 transition-all duration-300 ease-in-out", svgClass)}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div
          className={cn(
            "w-full flex-grow lg:flex lg:items-center lg:w-auto mt-2 lg:mt-0 text-black p-4 lg:p-0 z-20 transition-all duration-300 ease-in-out",
            isMenuOpen ? "" : "hidden",
            navContentClass
          )}
          id="nav-content"
        >
          <ul className={cn("list-reset lg:flex justify-end flex-1 items-center", textColorClass)}>
            <NavButton href="/" label={t.home} className={textColorClass} />
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
            <LanguageSelector lang={lang} onChange={onLanguageChange} />
          </ul>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
