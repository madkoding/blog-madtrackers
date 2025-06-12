"use client";

import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import UltraSafeThreeCanvas from "./UltraSafeThreeCanvas";

interface SimpleRotatingFBXModelProps {
  colors: string[];
}

const SimpleRotatingFBXModel: React.FC<SimpleRotatingFBXModelProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Asegurar que solo se renderice en el cliente
    setIsClient(true);
    
    // Delay adicional para asegurar que la hydration esté completa
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000); // Aumentar el delay para asegurar hidratación completa

    return () => clearTimeout(timer);
  }, []);

  // No renderizar nada en el servidor o durante la hydratación
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

  // Usar UltraSafeThreeCanvas que maneja la carga segura de Three.js
  return <UltraSafeThreeCanvas colors={colors} />;
};

export default SimpleRotatingFBXModel;
