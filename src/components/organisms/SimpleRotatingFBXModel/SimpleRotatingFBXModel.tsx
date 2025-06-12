"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../../atoms";
import { UltraSafeThreeCanvas } from "./UltraSafeThreeCanvas";

interface SimpleRotatingFBXModelProps {
  colors: string[];
  className?: string;
  modelPath?: string;
  scale?: number;
  rotationSpeed?: {
    x?: number;
    y?: number;
    z?: number;
  };
  showLoadingText?: boolean;
  loadingDelay?: number;
}

const SimpleRotatingFBXModel: React.FC<SimpleRotatingFBXModelProps> = ({ 
  colors,
  className = "",
  modelPath = "/models/SmolModel.fbx",
  scale = 0.7,
  rotationSpeed = { x: 0.005, y: 0.005, z: 0.005 },
  showLoadingText = true,
  loadingDelay = 1000
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Asegurar que solo se renderice en el cliente
    setIsClient(true);
    
    // Delay adicional para asegurar que la hydration esté completa
    const timer = setTimeout(() => {
      setIsReady(true);
    }, loadingDelay);

    return () => clearTimeout(timer);
  }, [loadingDelay]);

  // No renderizar nada en el servidor o durante la hydratación
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
        {showLoadingText && (
          <span className="sr-only">Preparando modelo 3D...</span>
        )}
      </div>
    );
  }

  // Usar UltraSafeThreeCanvas que maneja la carga segura de Three.js
  return (
    <UltraSafeThreeCanvas 
      colors={colors}
      modelPath={modelPath}
      scale={scale}
      rotationSpeed={rotationSpeed}
      className={className}
    />
  );
};

export { SimpleRotatingFBXModel };
