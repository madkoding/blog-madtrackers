"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../../atoms";
import { SimpleTestCanvas } from "./SimpleTestCanvas";

interface UltraSafeThreeCanvasProps {
  colors: string[];
  className?: string;
  modelPath?: string;
  rotationSpeed?: {
    x?: number;
    y?: number;
    z?: number;
  };
  loadingDelay?: number;
}

const UltraSafeThreeCanvas: React.FC<UltraSafeThreeCanvasProps> = ({ 
  colors,
  className = "",
  modelPath = "/models/SmolModel.fbx",
  // Cambiar valores por defecto para rotar en los 3 ejes
  rotationSpeed = { x: 0.005, y: 0.005, z: 0.005 },
  loadingDelay = 50 // Reducir delay para carga más rápida
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Delay mínimo para asegurar hydratación
      const timer = setTimeout(() => {
        setIsReady(true);
      }, loadingDelay);
      
      return () => clearTimeout(timer);
    }
  }, [loadingDelay]);

  // Mostrar loading mientras esperamos
  if (!isClient || !isReady) {
    return (
      <div 
        className={`three-canvas-container relative aspect-square flex items-center justify-center ${className}`}
        style={{ 
          backgroundColor: "transparent",
          background: "none"
        }}
      >
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D optimizado...</span>
      </div>
    );
  }

  // Usar el canvas simple
  return (
    <SimpleTestCanvas 
      colors={colors}
      modelPath={modelPath}
      rotationSpeed={rotationSpeed}
      className={className}
    />
  );
};

export { UltraSafeThreeCanvas };
