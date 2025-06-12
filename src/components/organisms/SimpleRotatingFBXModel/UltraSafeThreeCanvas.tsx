"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../../atoms";
import { SimpleTestCanvas } from "./SimpleTestCanvas";

interface UltraSafeThreeCanvasProps {
  colors: string[];
  className?: string;
  modelPath?: string;
  scale?: number;
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
  scale = 0.7,
  rotationSpeed = { x: 0.005, y: 0.005, z: 0.005 },
  loadingDelay = 500
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Breve delay para asegurar hydratación
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
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  // Usar directamente SimpleTestCanvas ya que funciona bien
  return (
    <SimpleTestCanvas 
      colors={colors}
      modelPath={modelPath}
      scale={scale}
      rotationSpeed={rotationSpeed}
      className={className}
    />
  );
};

export { UltraSafeThreeCanvas };
