"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../../atoms/Button";
import { cn } from "../../../utils/cn";

interface NavItem {
  href: string;
  label: string;
}

interface HeaderProps {
  className?: string;
  navItems?: NavItem[];
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  showLanguageSelector?: boolean;
  onLanguageChange?: (lang: "en" | "es") => void;
  currentLanguage?: "en" | "es";
  translations?: {
    home: string;
    contact: string;
    faq: string;
    pricing: string;
  };
}

/**
 * Selector de idioma como componente interno
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
    <div className="flex space-x-2 ml-4">
      <Button
        variant={lang === "en" ? "default" : "ghost"}
        size="sm"
        onClick={handleSelectEnglish}
      >
        EN
      </Button>
      <Button
        variant={lang === "es" ? "default" : "ghost"}
        size="sm"
        onClick={handleSelectSpanish}
      >
        ES
      </Button>
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

/**
 * Botón de navegación
 */
const NavButton = React.memo<{
  href: string;
  label: string;
  isActive?: boolean;
}>(({ href, label, isActive }) => {
  return (
    <Link 
      href={href}
      className={cn(
        "inline-block no-underline py-2 px-4 transition-all duration-300 ease-in-out rounded-md",
        isActive 
          ? "text-blue-600 bg-blue-50 font-medium" 
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      )}
    >
      {label}
    </Link>
  );
});

NavButton.displayName = 'NavButton';

export const Header = React.memo<HeaderProps>(({
  className,
  navItems = [],
  logo = {
    src: "/assets/madtrackers.svg",
    alt: "madTrackers",
    width: 60,
    height: 60
  },
  showLanguageSelector = true,
  onLanguageChange,
  currentLanguage = "es",
  translations = {
    home: "Inicio",
    contact: "Contacto", 
    faq: "FAQ",
    pricing: "Precios"
  }
}) => {
  const [scrollPos, setScrollPos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar si no estamos en la página de inicio
  const isNotHomePage = pathname !== "/";

  // Lógica de estilos del header
  let headerClass = "";
  if (scrollPos > 10 || isMenuOpen) {
    headerClass = "bg-white shadow-lg";
  } else if (isNotHomePage) {
    headerClass = "bg-white shadow-sm";
  } else {
    headerClass = "bg-transparent";
  }

  // Determinar color del texto basado en el fondo
  const textColorClass = scrollPos > 10 || isMenuOpen || isNotHomePage 
    ? "text-gray-900" 
    : "text-white";

  const defaultNavItems = [
    { href: "/", label: translations.home },
    { href: "/faq", label: translations.faq },
    { href: "/#pricing", label: translations.pricing },
    { href: "/contacto", label: translations.contact },
  ];

  const finalNavItems = navItems.length > 0 ? navItems : defaultNavItems;

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", headerClass, className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={cn(
                "transition-all duration-300",
                textColorClass === "text-white" ? "filter invert" : ""
              )}
            />
            <span className={cn("text-xl font-bold transition-colors", textColorClass)}>
              madTrackers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {finalNavItems.map((item) => (
              <NavButton
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
            
            {showLanguageSelector && onLanguageChange && (
              <LanguageSelector
                lang={currentLanguage}
                onChange={onLanguageChange}
              />
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={cn("text-2xl", textColorClass)}>
              {isMenuOpen ? "✕" : "☰"}
            </span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 bg-white border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {finalNavItems.map((item) => (
                <NavButton
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
              
              {showLanguageSelector && onLanguageChange && (
                <div className="pt-2 border-t border-gray-200">
                  <LanguageSelector
                    lang={currentLanguage}
                    onChange={onLanguageChange}
                  />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
