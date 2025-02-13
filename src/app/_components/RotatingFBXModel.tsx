"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useProgress, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

interface ModelProps {
  modelPath: string;
  color: string;
}

/**
 * Carga y renderiza un modelo FBX con texturas optimizadas.
 * Usa `useLoader` en lugar de `useEffect` para mejorar el rendimiento.
 */
const FBXModel: React.FC<ModelProps> = ({ modelPath, color }) => {
  const fbx = useLoader(FBXLoader, modelPath);
  const modelRef = useRef<THREE.Group>(null);

  // Ajuste inicial de escala y materiales
  useMemo(() => {
    fbx.scale.set(0.06, 0.06, 0.06);

    fbx.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        material.color.set(color);
        material.metalness = 0.3;
        material.roughness = 0.6;
        material.emissive.set(0x000000);
      }
    });
  }, [fbx, color]); // Solo se ejecuta cuando cambia el modelo o el color

  return <RotatingModel modelRef={modelRef} fbx={fbx} />;
};

/**
 * Agrega rotación al modelo sin afectar la carga del FBX.
 */
const RotatingModel: React.FC<{
  modelRef: React.RefObject<THREE.Group>;
  fbx: THREE.Group;
}> = ({ modelRef, fbx }) => {
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003;
      modelRef.current.rotation.x += 0.003;
    }
  });

  return <primitive object={fbx} ref={modelRef} />;
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
 * Contenedor del Canvas con luces optimizadas y OrbitControls.
 */
const RotatingFBXModel: React.FC<{ color: string }> = ({ color }) => {
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.5} />
        {/* 🔥 Iluminación enfocada para modelos oscuros 🔥 */}
        <pointLight
          position={[0, 2, 3]}
          intensity={1.5}
          color={"#ffffff"}
          distance={8}
        />
        <pointLight
          position={[-2, 2, 3]}
          intensity={1.2}
          color={"#ffffff"}
          distance={6}
        />
        <pointLight
          position={[2, 1, 3]}
          intensity={1.2}
          color={"#ffffff"}
          distance={6}
        />
        <pointLight
          position={[0, 3, 0]}
          intensity={1.5}
          color={"#ffffff"}
          distance={10}
        />
        <pointLight
          position={[0, -1, 3]}
          intensity={1}
          color={"#ffffff"}
          distance={6}
        />

        <spotLight position={[0, 5, 5]} angle={0.3} intensity={1} castShadow />
      </>
    ),
    []
  );

  return (
    <div className="relative w-full aspect-square">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        {lights}
        <Suspense fallback={<Loading />}>
          <FBXModel modelPath="/models/tracker.fbx" color={color} />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default RotatingFBXModel;
