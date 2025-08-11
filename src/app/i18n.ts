// Traducciones y lógica de idioma para la app
import { translations } from '../locales';

export { translations };

// Detecta el idioma preferido del usuario (solo en cliente)
export function detectLang(): "en" | "es" {
  // Asegurar que solo se ejecute en el cliente
  if (typeof window === "undefined") return "en";
  
  try {
    if (window.navigator) {
      const lang = window.navigator.language || window.navigator.languages?.[0] || "en";
      if (lang.startsWith("es")) return "es";
      if (lang.startsWith("en")) return "en";
    }
  } catch (error) {
    console.warn("Error detecting language:", error);
  }
  
  return "en";
}
