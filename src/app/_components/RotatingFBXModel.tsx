"use client";

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

/**
 * Type guard que verifica si un material posee la propiedad `color` de tipo THREE.Color.
 *
 * @param {THREE.Material} material - Material a verificar.
 * @returns {material is THREE.Material & { color: THREE.Color }} True si el material tiene propiedad `color`.
 */
const hasColorProperty = (
  material: THREE.Material
): material is THREE.Material & { color: THREE.Color } => {
  return "color" in material && (material as any).color instanceof THREE.Color;
};

/**
 * Props para el componente FBXModel.
 *
 * @typedef {Object} ModelProps
 * @property {string} modelPath - Ruta del archivo FBX.
 * @property {string} color - Color para aplicar a los materiales del modelo.
 */
interface ModelProps {
  modelPath: string;
  color: string;
}

/**
 * Componente que carga, clona y renderiza un modelo FBX con materiales actualizables.
 *
 * @param {ModelProps} props - Propiedades del componente.
 * @returns {JSX.Element} El modelo FBX renderizado.
 */
const FBXModel: React.FC<ModelProps> = ({ modelPath, color }) => {
  // Carga el modelo FBX
  const fbxOriginal = useLoader(FBXLoader, modelPath);
  // Referencia para el grupo del modelo clonado
  const modelRef = useRef<THREE.Group>(null);
  // Almacenamos los materiales clonados para actualizarlos dinámicamente
  const materials = useRef<THREE.Material[]>([]);

  /**
   * Clona el modelo original y sus materiales, aplicando escalado y configuraciones iniciales.
   *
   * @returns {THREE.Group} Modelo clonado y configurado.
   */
  const clonedModel = useMemo(() => {
    const model = fbxOriginal.clone();
    model.scale.set(0.06, 0.06, 0.06);
    materials.current = [];

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        /**
         * Procesa y clona un material si posee la propiedad `color`.
         *
         * @param {THREE.Material} mat - Material original.
         * @returns {THREE.Material} Material clonado (y modificado si es MeshStandardMaterial) o el original.
         */
        const processMaterial = (mat: THREE.Material) => {
          if (hasColorProperty(mat)) {
            const newMat = mat.clone();
            if (newMat instanceof THREE.MeshStandardMaterial) {
              newMat.metalness = 0.3;
              newMat.roughness = 0.6;
              newMat.emissive.set(0x000000);
            }
            materials.current.push(newMat);
            return newMat;
          }
          return mat;
        };

        child.material = Array.isArray(child.material)
          ? child.material.map(processMaterial)
          : processMaterial(child.material);
      }
    });

    return model;
  }, [fbxOriginal]);

  /**
   * Efecto que actualiza el color de los materiales cuando cambia la prop "color".
   */
  useEffect(() => {
    const hexColor = color.startsWith("#") ? color : `#${color}`;
    const threeColor = new THREE.Color(hexColor);

    materials.current.forEach((mat) => {
      if (hasColorProperty(mat)) {
        mat.color.copy(threeColor);
        mat.needsUpdate = true;
      }
    });

    // Forzar la actualización de cada material en el modelo
    if (modelRef.current) {
      modelRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => (mat.needsUpdate = true));
          } else {
            obj.material.needsUpdate = true;
          }
        }
      });
    }
  }, [color]);

  /**
   * Anima la rotación del modelo en cada frame para una animación suave.
   */
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
      modelRef.current.rotation.x += 0.005;
    }
  });

  return <primitive object={clonedModel} ref={modelRef} />;
};

/**
 * Componente que muestra una pantalla de carga mientras se descarga el modelo.
 *
 * @returns {JSX.Element} Indicador de carga.
 */
const Loading: React.FC = () => {
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
 * Componente que encapsula todas las luces para lograr un efecto de exhibición.
 *
 * @returns {JSX.Element} Grupo de luces para la escena.
 */
const ExhibitionLights: React.FC = () => {
  return (
    <>
      {/* Luz ambiental base */}
      <ambientLight intensity={0.8} />
      {/* Luces laterales y frontales */}
      <pointLight position={[0, 2, 3]} intensity={0.8} />
      <pointLight position={[-2, 2, 3]} intensity={0.8} />
      <pointLight position={[2, 1, 3]} intensity={0.8} />
      <pointLight position={[0, 2, -3]} intensity={0.8} />
      <pointLight position={[3, 2, 0]} intensity={0.8} />
      <pointLight position={[-3, 2, 0]} intensity={0.8} />
      {/* Luces inferiores para resaltar detalles desde abajo */}
      <pointLight position={[1.5, -2, 1.5]} intensity={0.8} />
      <pointLight position={[-1.5, -2, 1.5]} intensity={0.8} />
      {/* Luz direccional para crear sombras y resaltar detalles */}
      <directionalLight position={[0, 10, 0]} intensity={0.7} castShadow />
    </>
  );
};

/**
 * Componente principal que envuelve el FBXModel y las luces en un Canvas de Three.js.
 *
 * @param {{ color: string }} props - Propiedades del componente.
 * @returns {JSX.Element} Escena completa con modelo y luces.
 */
const RotatingFBXModel: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="relative w-full aspect-square">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ExhibitionLights />
        <Suspense fallback={<Loading />}>
          <FBXModel modelPath="/models/tracker.fbx" color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RotatingFBXModel;
