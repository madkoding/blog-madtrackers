"use client";

import React from "react";
import { Navigation } from "../../components/organisms";
import { translations } from "../i18n";
import { useLang } from "../lang-context";

/**
 * Wrapper del componente Navigation que integra con el context de idioma
 * Este es un ejemplo de cómo migrar de los componentes viejos a los nuevos
 */
export const NavigationWrapper = React.memo(() => {
  const { lang, setLang } = useLang();
  const t = translations[lang];

  const handleLangChange = (newLang: "en" | "es") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", newLang);
    }
  };

  return (
    <Navigation 
      translations={t}
      lang={lang}
      onLanguageChange={handleLangChange}
    />
  );
});

NavigationWrapper.displayName = "NavigationWrapper";

export default NavigationWrapper;
