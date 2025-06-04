import React from "react";
import dynamic from "next/dynamic";

// Importar el modelo FBX original optimizado
const FBXModel = dynamic(
  () => import("./RotatingFBXModel/FBXModel"),
  { 
    ssr: false,
    loading: () => null // No loading component dentro de R3F Canvas
  }
);

interface LazyOptimizedFBXModelProps {
  colors: string[];
  modelPath?: string;
}

const LazyOptimizedFBXModel: React.FC<LazyOptimizedFBXModelProps> = ({ 
  colors,
  modelPath = "/models/SmolModel.fbx"
}) => {
  return (
    <FBXModel 
      modelPath={modelPath}
      colors={colors}
    />
  );
};

export default LazyOptimizedFBXModel;
