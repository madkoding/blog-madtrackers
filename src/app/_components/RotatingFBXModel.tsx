"use client";

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

interface ModelProps {
  modelPath: string;
  color: string;
}

/**
 * Carga y renderiza un modelo FBX con instancias únicas para cada posición.
 */
const FBXModel: React.FC<ModelProps> = ({ modelPath, color }) => {
  const fbxOriginal = useLoader(FBXLoader, modelPath);
  const modelRef = useRef<THREE.Group>(null);

  const fbx = useMemo(() => {
    const clonedModel = fbxOriginal.clone(); // Clonar el modelo para evitar que se sobrescriba
    clonedModel.scale.set(0.06, 0.06, 0.06);
    clonedModel.position.set(0, 0, 0); // Posición fija en 0,0,0

    clonedModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        // Clonar materiales para evitar modificaciones globales
        mesh.material = material.clone();
        mesh.material.metalness = 0.3;
        mesh.material.roughness = 0.6;
        mesh.material.emissive.set(0x000000);
      }
    });

    return clonedModel;
  }, [fbxOriginal]);

  // Actualizar el color sin hacer un re-render completo
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material.color.set(color);
        }
      });
    }
  }, [color]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.004;
      modelRef.current.rotation.x += 0.004;
    }
  });

  return <primitive object={fbx} ref={modelRef as any} />;
};

/**
 * Componente de carga mientras se renderiza el modelo.
 */
const Loading = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="text-white text-lg">{`Cargando modelo... ${Math.round(
        progress
      )}%`}</p>
    </Html>
  );
};

/**
 * Contenedor del Canvas con luces fijas y múltiples instancias de modelos.
 */
const RotatingFBXModel: React.FC<{
  color: string;
}> = ({ color }) => {
  return (
    <div className="relative aspect-square">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* 🔥 Luces fijas 🔥 */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={1} />
        <pointLight position={[0, 3, 3]} intensity={1} />
        <pointLight position={[0, -1, 3]} intensity={1} />

        <Suspense fallback={<Loading />}>
          <FBXModel modelPath="/models/tracker.fbx" color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RotatingFBXModel;
