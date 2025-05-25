"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ExhibitionLights from "./RotatingFBXModel/ExhibitionLights";
import FBXModel from "./RotatingFBXModel/FBXModel";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

const RotatingFBXModel: React.FC<{ colors: string[] }> = ({ colors }) => {
  return (
    <div className="relative aspect-square">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <LoadingSpinner />
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 2, 5], fov: 50 }}
          className="!w-full !h-full"
          gl={{ alpha: true }}
          style={{ background: "transparent" }}
        >
          <ExhibitionLights />
          <Environment files="/assets/env.hdr" background={false} />
          <FBXModel modelPath="/models/SmolModel.fbx" colors={colors} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default RotatingFBXModel;
