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
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    setLang(stored === "en" || stored === "es" ? stored : detectLang());
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
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
}
