import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        "20px": "20px",
      },
      colors: {
        "accent-1": "#2D004E", // Morado oscuro (fondo principal)
        "accent-2": "#1A002A", // Fondo secundario más oscuro
        "accent-7": "#FFFFFF", // Blanco
        success: "#00FF85", // Verde flúor reutilizado para estados
        cyan: "#2D004E", // Tono original si lo necesitas
      },
      spacing: {
        28: "7rem",
      },
      fontFamily: {
        sans: ['"Exo 2"', "sans-serif"],
        exo2: ['var(--font-exo2)', '"Exo 2"', "sans-serif"], // Variable CSS + fallback
        faustina: ['var(--font-faustina)', '"Faustina"', "serif"], // Nueva fuente secundaria
      },
      fontSize: {
        "5xl": "2.5rem",
        "6xl": "2.75rem",
        "7xl": "4.5rem",
        "8xl": "6.25rem",
      },
      boxShadow: {
        sm: "0 5px 10px rgba(0, 0, 0, 0.12)",
        md: "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
