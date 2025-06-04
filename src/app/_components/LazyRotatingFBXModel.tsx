"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

// Lazy loading más agresivo del componente 3D pesado
const RotatingFBXModel = dynamic(() => import("./RotatingFBXModel"), {
  ssr: false, // Evitar SSR para componentes 3D
  loading: () => (
    <div className="relative aspect-square flex items-center justify-center rounded-lg">
      <LoadingSpinner />
      <span className="sr-only">Cargando modelo 3D...</span>
    </div>
  ),
});

interface LazyRotatingFBXModelProps {
  colors: string[];
}

const LazyRotatingFBXModel: React.FC<LazyRotatingFBXModelProps> = ({ colors }) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Cargar el modelo 3D solo después de que la página esté completamente cargada
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100); // Delay de 1 segundo para priorizar contenido crítico

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) {
    return (
      <div className="relative aspect-square flex items-center justify-center rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="relative aspect-square flex items-center justify-center rounded-lg">
          <LoadingSpinner />
          <span className="sr-only">Cargando modelo 3D...</span>
        </div>
      }
    >
      <RotatingFBXModel colors={colors} />
    </Suspense>
  );
};

export default LazyRotatingFBXModel;
