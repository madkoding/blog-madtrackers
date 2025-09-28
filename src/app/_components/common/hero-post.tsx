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
      setFade(true);
    }, 400); // Duración del fade out
  }, [subtitles.length]);

  useEffect(() => {
    setFade(true); // Asegura que el primer render sea visible
    intervalRef.current = setInterval(nextSubtitle, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [subtitles.length, nextSubtitle]);

  // Si no hay subtítulos, no renderizar nada
  const currentSubtitle = subtitles[subtitleIndex] || "";

  return (
    <section className="relative overflow-hidden">
      <SkyDomeBackground />
      <div className="relative z-10 pt-16">
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
                className={`my-0 text-2xl font-bold leading-tight min-h-[2.5rem] transition-all duration-700 ease-in-out theme-text-secondary ${fade ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionProperty: 'opacity' }}
              >
                {currentSubtitle}
              </h3>
            </div>

            {!isMaintenanceMode && (
              <a
                href="#pricing"
                className="hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
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
