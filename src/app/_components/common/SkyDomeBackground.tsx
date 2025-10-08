"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC_WEBM = "/assets/fondo_trackers.webm";
const VIDEO_SRC_MP4 = "/assets/fondo_trackers.mp4";

const SkyDomeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Lazy load: cargar el video después de que la página haya cargado
    if (typeof window !== "undefined") {
      const loadVideo = () => {
        // Pequeño delay adicional para priorizar contenido crítico
        setTimeout(() => setShouldLoadVideo(true), 500);
      };

      if (document.readyState === "complete") {
        loadVideo();
      } else {
        window.addEventListener("load", loadVideo);
        return () => window.removeEventListener("load", loadVideo);
      }
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) {
      return;
    }

    let isIntersecting = false;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {
          // Ignoramos errores de autoplay; el video se reproducirá tras interacción.
        });
      }
    };

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== container) {
              return;
            }
            if (entry.isIntersecting) {
              if (!isIntersecting) {
                isIntersecting = true;
                attemptPlay();
              }
            } else if (isIntersecting) {
              isIntersecting = false;
              video.pause();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(container);
      attemptPlay();

      return () => {
        observer.disconnect();
        video.pause();
        video.currentTime = 0;
      };
    }

    attemptPlay();

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [shouldLoadVideo]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 bg-slate-950"
      aria-hidden="true"
    >
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-1000"
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay
        >
          <source src={VIDEO_SRC_WEBM} type="video/webm" />
          <source src={VIDEO_SRC_MP4} type="video/mp4" />
        </video>
      )}
      {/* Interlace/Scanlines overlay - simula CRT con efecto de desentrelazado */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)",
          opacity: 0.7,
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />
      {/* Overlay oscuro sutil para mejorar contraste */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/50" />
    </div>
  );
};

export default SkyDomeBackground;
