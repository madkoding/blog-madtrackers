import React from "react";
import FBXModel from "./RotatingFBXModel/FBXModel";

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
