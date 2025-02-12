"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

interface ModelProps {
  modelPath: string;
}

/**
 * Carga y renderiza un modelo FBX con texturas.
 * @param {string} modelPath - Ruta del modelo FBX.
 */
const FBXModel: React.FC<ModelProps> = ({ modelPath }) => {
  const modelRef = useRef<THREE.Group | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Estado de carga del modelo

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      modelPath,
      (fbx) => {
        fbx.scale.set(0.06, 0.06, 0.06); // Ajusta la escala para que sea visible
        fbx.position.set(0, 0, 0); // Posición para asegurar que el modelo esté centrado

        // Modificar los materiales del modelo para hacerlo negro con aspecto metálico y reflejante
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;

            // Establecer el color negro
            material.color.set(0x444444);

            // Hacerlo metálico pero con un acabado sutil, no tan brillante
            material.metalness = 0.3; // Valor intermedio para un aspecto metálico sutil
            material.roughness = 0.6; // Un poco de rugosidad para darle un toque plástico, no tan brillante
            material.emissive.set(0x000000); // Evitar emitir luz por defecto
          }
        });

        modelRef.current = fbx;
        setIsLoaded(true); // El modelo se cargó correctamente
      },
      (xhr) => {
        console.log(`Cargando: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error("Error cargando FBX:", error);
      }
    );
  }, [modelPath]);

  // Animación de rotación automática
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005; // Rotación suave
      modelRef.current.rotation.x += 0.003;
    }
  });

  // No renderizar el modelo hasta que esté completamente cargado
  if (!isLoaded) {
    return null; // No renderizar hasta que esté listo
  }

  return modelRef.current ? <primitive object={modelRef.current} /> : null;
};

/**
 * Componente para obtener y manejar la escena y el tamaño del canvas.
 */
const CanvasScene: React.FC = () => {
  // Obtener el tamaño y la actualización de la escena
  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    if (scene && gl) {
      // Forzar la actualización de la escena (forzamos un resize inicial)
      gl.setSize(size.width, size.height);
    }
  }, [scene, gl, size]);

  return null; // Este componente solo sirve para actualizar el canvas
};

/**
 * Contenedor principal con el canvas en una caja 3:4 con fondo semitransparente.
 */
const RotatingFBXModel: React.FC = () => {
  return (
    <div className="relative w-full max-w-[600px] aspect-square">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Actualización de la escena */}
        <CanvasScene />
        {/* Luces */}
        <ambientLight intensity={0.6} /> {/* Luz ambiental suave */}
        {/* Luz direccional */}
        <directionalLight
          intensity={1}
          position={[5, 5, 5]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          intensity={0.8}
          position={[-5, 5, -5]} // Luz direccional desde otro ángulo
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Luces puntuales */}
        <pointLight
          position={[0, 2, 2]}
          intensity={0.8}
          color="white"
          distance={10}
          decay={2}
        />
        <pointLight
          position={[-2, 1, 3]}
          intensity={0.7}
          color="white"
          distance={8}
          decay={1}
        />
        {/* Luz de foco (Spotlight) */}
        <spotLight
          position={[0, 4, -5]}
          angle={0.3}
          intensity={1}
          color="white"
          distance={10}
          penumbra={1}
          castShadow
        />
        {/* Carga del modelo */}
        <Suspense fallback={<Loading />}>
          <FBXModel modelPath="/models/tracker.fbx" />
        </Suspense>
      </Canvas>
    </div>
  );
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

export default RotatingFBXModel;
