"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import { LoadingSpinner } from "../../components/atoms";

// Importación directa sin múltiples capas de dynamic loading
const SimpleRotatingFBXModel = dynamic(() => import("../../components/organisms/SimpleRotatingFBXModel/SimpleRotatingFBXModel").then(mod => ({ default: mod.SimpleRotatingFBXModel })), {
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    setIsClient(true);
    
    // Cargar el modelo 3D de forma más gradual
    const timer = setTimeout(() => {
      // Verificar si el navegador está idle antes de cargar
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => setShouldLoad(true), { timeout: 1000 });
      } else {
        setShouldLoad(true);
      }
    }, 200); // Aumentar delay inicial

    return () => clearTimeout(timer);
  }, []);

  // No renderizar nada hasta que estemos en el cliente
  if (!isClient) {
    return (
      <div className="relative aspect-square flex items-center justify-center rounded-lg bg-gray-100">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  if (!shouldLoad) {
    return (
      <div className="relative aspect-square flex items-center justify-center rounded-lg bg-gray-100">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="relative aspect-square flex items-center justify-center rounded-lg bg-gray-100">
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
