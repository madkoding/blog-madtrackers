"use client";

import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import SimpleTestCanvas from "./SimpleTestCanvas";

interface UltraSafeThreeCanvasProps {
  colors: string[];
}

const UltraSafeThreeCanvas: React.FC<UltraSafeThreeCanvasProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Breve delay para asegurar hidratación
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Mostrar loading mientras esperamos
  if (!isClient || !isReady) {
    return (
      <div 
        className="three-canvas-container relative aspect-square flex items-center justify-center"
        style={{ 
          backgroundColor: "transparent",
          background: "none"
        }}
      >
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  // Usar directamente SimpleTestCanvas ya que funciona bien
  return <SimpleTestCanvas colors={colors} />;
};

export default UltraSafeThreeCanvas;
