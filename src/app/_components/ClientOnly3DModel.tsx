"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";
import UltraSafeThreeCanvas from "./UltraSafeThreeCanvas";

interface ClientOnly3DModelProps {
  colors: string[];
}

// Componente que garantiza renderizado solo en cliente
const ClientOnly3DModel: React.FC<ClientOnly3DModelProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      // Delay adicional para asegurar que la hydration esté completa
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // No renderizar nada hasta que estemos en el cliente
  if (!isClient || !isReady) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  // Renderizar el componente 3D ultra-seguro
  return <UltraSafeThreeCanvas colors={colors} />;
};

export default ClientOnly3DModel;
