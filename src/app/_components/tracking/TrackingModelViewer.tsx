"use client";

import React, { useMemo } from "react";
import { colors as colorOptions } from "../../constants";
import RotatingFBXModel from "../RotatingFBXModel";
import { translations } from "../../i18n";
import { useLang } from "../../lang-context";

interface TrackingModelViewerProps {
  caseColor: string;
  coverColor: string;
}

/**
 * Componente que muestra el modelo 3D del tracker con los colores especificados
 * del case y la tapa según los datos de seguimiento.
 */
const TrackingModelViewer: React.FC<TrackingModelViewerProps> = ({
  caseColor,
  coverColor,
}) => {
  const { lang } = useLang();
  const t = translations[lang];
  // Convertir los colores de string a valores hex para el modelo 3D
  const modelColors = useMemo(() => {
    // Buscar los colores en la lista de colores disponibles
    const caseColorData = colorOptions.find(color => color.id === caseColor);
    const coverColorData = colorOptions.find(color => color.id === coverColor);
    
    // Determinar el color del logo basado en la tapa
    const logoColor = coverColor === "blanco" ? "#000000" : "#CCCCCC";
    
    // Material 0: Case, material 1: Tapa, materiales 2 y 3: Logo
    return [
      caseColorData?.hex ?? "#444444",    // Material 0: Case
      coverColorData?.hex ?? "#FFFFFF",   // Material 1: Tapa
      logoColor,                          // Material 2: Logo
      logoColor,                          // Material 3: Logo
    ];
  }, [caseColor, coverColor]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-300 rounded-lg overflow-hidden shadow-inner border border-gray-200">
      {/* Etiqueta flotante */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-md px-3 py-1 shadow-sm border border-gray-200">
          <span className="text-xs font-medium text-gray-700">{t.modelPreview}</span>
        </div>
      </div>
      
      {/* Modelo 3D */}
      <RotatingFBXModel colors={modelColors} />
    </div>
  );
};

export default TrackingModelViewer;
