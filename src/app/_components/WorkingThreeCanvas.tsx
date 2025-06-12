"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

interface WorkingThreeCanvasProps {
  colors: string[];
}

// Importar el componente original que funcionaba
const RotatingFBXModel = dynamic(
  () => import("./RotatingFBXModel"),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Cargando modelo 3D...</span>
      </div>
    )
  }
);

// Componente de fallback
const FallbackCanvas: React.FC<{ colors: string[] }> = ({ colors }) => {
  return (
    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Modelo 3D</h3>
        <p className="text-sm text-gray-500 mb-4">Vista previa del tracker</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {colors.slice(0, 5).map((color, index) => (
            <div
              key={`color-${color}-${index}`}
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={`Color ${index + 1}: ${color}`}
            />
          ))}
          {colors.length > 5 && (
            <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xs text-gray-600">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkingThreeCanvas: React.FC<WorkingThreeCanvasProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Delay más largo para asegurar estabilidad
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Manejar errores
  const handleError = () => {
    setHasError(true);
  };

  // Loading inicial
  if (!isClient || !isReady) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  // Si hubo error, mostrar fallback
  if (hasError) {
    return <FallbackCanvas colors={colors} />;
  }

  // Intentar renderizar el modelo 3D original
  try {
    return (
      <div onError={handleError}>
        <RotatingFBXModel colors={colors} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering 3D model:", error);
    return <FallbackCanvas colors={colors} />;
  }
};

export default WorkingThreeCanvas;
