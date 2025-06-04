"use client";

import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ExhibitionLights from "./RotatingFBXModel/ExhibitionLights";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";
import LazyOptimizedFBXModel from "./LazyOptimizedFBXModel";

interface RotatingFBXModelProps {
  colors: string[];
}

const RotatingFBXModel: React.FC<RotatingFBXModelProps> = ({ colors }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-square">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={null}>
          <ExhibitionLights />
          <Environment files="/assets/env_256x128.hdr" background={false} />
          <LazyOptimizedFBXModel 
            colors={colors}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RotatingFBXModel;
