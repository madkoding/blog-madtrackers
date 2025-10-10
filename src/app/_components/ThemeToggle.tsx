"use client";

import React, { useState, useEffect } from "react";

/**
 * Componente de switch para cambiar entre modo oscuro y modo día
 */
export const ThemeToggle = React.memo(() => {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    setIsDark(root.dataset.theme === "dark");
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const newTheme = isDark ? "light" : "dark";
    
    root.dataset.theme = newTheme;
    root.classList.toggle("dark", newTheme === "dark");
    
    setIsDark(!isDark);
    
    // Guardar preferencia del usuario
    try {
      localStorage.setItem("theme", newTheme);
    } catch (error) {
      console.warn("No se pudo guardar la preferencia de tema:", error);
    }
  };

  // Evitar hidratación incorrecta
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg transition-colors bg-slate-200 dark:bg-white/10"
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-all duration-300 hover:bg-slate-200 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-white/20"
      aria-label={isDark ? "Cambiar a modo día" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo día" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        // Icono de Sol (modo día)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-yellow-500 transition-transform duration-300 hover:rotate-45"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        // Icono de Luna (modo oscuro)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:rotate-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
