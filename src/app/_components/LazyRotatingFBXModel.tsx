"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

// Importación directa sin múltiples capas de dynamic loading
const SimpleRotatingFBXModel = dynamic(() => import("./SimpleRotatingFBXModel"), {
  ssr: false,
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
    // Cargar el modelo 3D después de un pequeño delay
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);

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
      <SimpleRotatingFBXModel colors={colors} />
    </Suspense>
  );
};

export default LazyRotatingFBXModel;
