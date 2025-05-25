"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { translations } from "../i18n";
import { useLang } from "../lang-context";

export function NavBar() {
  // Estado para gestionar el scroll
  const [scrollpos, setScrollpos] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { lang, setLang } = useLang();
  const t = translations[lang];

  // Cambiar idioma manualmente y guardar en localStorage y contexto global
  const handleLangChange = (newLang: "en" | "es") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", newLang);
    }
  };

  // UseEffect para manejar el evento de scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollpos(window.scrollY);
    };

    // Agregar el evento de scroll al montar el componente
    window.addEventListener("scroll", handleScroll);

    // Limpiar el evento al desmontar el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Clases dinámicas en base al scroll
  const headerClass = scrollpos > 10 || isMenuOpen ? "bg-white shadow" : "";
  const navContentClass = scrollpos > 10 || isMenuOpen ? "bg-white" : "";
  const textColorClass =
    scrollpos > 10 || isMenuOpen ? "text-gray-800" : "text-white"; // Cambiar color del texto
  const svgClass = scrollpos > 10 || isMenuOpen ? "" : "invert"; // Cambiar la clase del SVG (invertir solo si el scroll es bajo)

  // Toggle del menú de navegación
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      id="header"
      className={`fixed w-full z-30 top-0 ${headerClass} transition-all duration-300 ease-in-out`}
    >
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        {/* Selector de idioma */}
        <div className="absolute right-4 top-2 flex space-x-2 z-50">
          <button
            onClick={() => handleLangChange("en")}
            className={`px-2 py-1 rounded ${
              lang === "en"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => handleLangChange("es")}
            className={`px-2 py-1 rounded ${
              lang === "es"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            ES
          </button>
        </div>
        <div className="pl-4 flex items-center space-x-2">
          <a
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
          </a>
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
            <li className="mr-3">
              <a
                className={`inline-block ${textColorClass} no-underline hover:text-gray-800 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out`}
                href="/"
              >
                {t.home}
              </a>
            </li>
            <li className="mr-3">
              <a
                className={`inline-block ${textColorClass} no-underline hover:text-gray-800 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out`}
                href="/#pricing"
              >
                {t.pricing}
              </a>
            </li>
            <li className="mr-3">
              <a
                className={`inline-block ${textColorClass} no-underline hover:text-gray-800 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out`}
                href="/posts/Configuracion_Inicial"
              >
                Primera configuración
              </a>
            </li>
            <li className="mr-3">
              <a
                className={`inline-block ${textColorClass} no-underline hover:text-gray-800 hover:text-underline py-2 px-4 transition-all duration-300 ease-in-out`}
                href="/faq"
              >
                {t.faq}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
}
