"use client";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { detectLang } from "./i18n";

export type Lang = "en" | "es";

interface LangContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextProps | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = React.useState<Lang>("en");

  // Actualiza el idioma y lo guarda en localStorage
  const setLangAndStore = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", newLang);
    }
  };

  useEffect(() => {
    // Solo ejecutar en el cliente para evitar hydration mismatch
    if (typeof window === "undefined") {return;}
    
    const stored = localStorage.getItem("lang");
    
    // Usar idioma almacenado o detectar el idioma del navegador
    const detectedLang = stored === "en" || stored === "es" ? stored : detectLang();
    setLang(detectedLang);
    
    // Escuchar cambios de localStorage (por si hay más de una pestaña)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lang" && (e.newValue === "en" || e.newValue === "es")) {
        setLang(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Memoizar el valor del contexto para evitar renders innecesarios
  const contextValue = useMemo(
    () => ({ lang, setLang: setLangAndStore }),
    [lang]
  );

  return (
    <LangContext.Provider value={contextValue}>{children}</LangContext.Provider>
  );
};

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    // En lugar de lanzar error, devolver valores por defecto
    console.warn("useLang must be used within a LangProvider, using defaults");
    return { lang: "en" as Lang, setLang: () => {} };
  }
  return context;
}
