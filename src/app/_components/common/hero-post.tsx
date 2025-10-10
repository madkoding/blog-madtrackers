"use client";

import { useLang } from "../../lang-context";
import { translations } from "../../i18n";
import RotatingModel from "../RotatingModel";
import SkyDomeBackground from "./SkyDomeBackground";
import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  title: string;
  // subtitle ahora es opcional y no se usa, se mantiene para compatibilidad
  subtitle?: string;
};

export function HeroPost({ isMaintenanceMode = false }: Readonly<Props & { isMaintenanceMode?: boolean }>) {
  const { lang } = useLang();
  const t = translations[lang];
  const subtitles = t.heroSubtitles || [];
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extraer la función para evitar anidamiento excesivo
  const nextSubtitle = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
      setTimeout(() => {
        setFade(true);
      }, 30); // Pequeño delay para asegurar que el texto cambie antes de quitar el glitch
    }, 250); // Duración del glitch más rápida
  }, [subtitles.length]);

  useEffect(() => {
    setFade(true); // Asegura que el primer render sea visible
    intervalRef.current = setInterval(nextSubtitle, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [subtitles.length, nextSubtitle]);

  // Si no hay subtítulos, no renderizar nada
  const currentSubtitle = subtitles[subtitleIndex] || "";

  return (
    <section className="hero-post-section relative overflow-hidden min-h-screen md:min-h-0 flex items-center">
      <SkyDomeBackground />
      {/* Degradado inferior */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none" 
        style={{
          background: 'linear-gradient(to top, rgba(24, 28, 60, 1) 0%, transparent 100%)'
        }}
      />
      <div className="relative z-10 pt-16 w-full">
        <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center md:items-stretch">
          {/* Modelo 3D */}
          <div className="w-full md:w-3/6 flex justify-center md:justify-end items-center md:items-end">
            <div className="w-full max-w-[500px] max-h-[500px] h-auto aspect-square">
              <RotatingModel
                colors={["#444444", "#000000", "#FFFFFF", "#FFFFFF"]}
              />
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col w-full md:w-3/6 justify-center md:justify-center items-center md:items-start text-center md:text-left theme-text-primary">
            <p className="tracking-loose w-full text-center md:text-left theme-text-on-accent font-medium mb-2">
              {t?.heroBrandText || "Precision Engineered for VR Enthusiasts"}
            </p>

            <div className="flex flex-col w-full">
              <h1 className="my-0 text-5xl font-bold leading-tight theme-text-primary">madTrackers</h1>
              <h3
                className={`my-0 text-2xl font-bold leading-tight min-h-[2.5rem] theme-text-secondary relative ${fade ? '' : 'glitch-effect'}`}
                data-text={currentSubtitle}
                style={{ zIndex: 10 }}
              >
                {currentSubtitle}
              </h3>
            </div>

            {!isMaintenanceMode && (
              <a
                href="#pricing"
                className="hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 focus:outline-none transform transition hover:scale-105 duration-300 ease-in-out relative"
                style={{
                  boxShadow: '0 0 25px 5px rgba(168, 85, 247, 0.9), 0 0 50px 10px rgba(168, 85, 247, 0.6), 0 0 80px 15px rgba(168, 85, 247, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(168, 85, 247, 0.5)'
                }}
              >
                {t?.heroButton || "Order a pack now!"}
              </a>
            )}

            <div className="h-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
