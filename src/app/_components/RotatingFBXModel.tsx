"use client";

import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  useProgress,
  Html,
  Environment,
  useEnvironment,
} from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TextureLoader } from "three";

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
 * @property {string[]} colors - Array de colores para aplicar a los materiales del modelo.
 */
interface ModelProps {
  modelPath: string;
  colors: string[];
}

/**
 * Componente que carga, clona y renderiza un modelo FBX con materiales actualizables.
 *
 * @param {ModelProps} props - Propiedades del componente.
 * @returns {JSX.Element} El modelo FBX renderizado.
 */
const FBXModel: React.FC<ModelProps> = ({ modelPath, colors }) => {
  // Carga el modelo FBX solo una vez
  const fbxOriginal = useLoader(FBXLoader, modelPath);
  // Obtener el envMap del entorno HDRI
  const envMap = useEnvironment({ files: "/assets/env.hdr" });
  // Cargar normalMap rugoso procedural o de imagen
  const normalMap = useLoader(TextureLoader, "/assets/noise-normal.png");
  // Aumentar la escala del normalMap para que la textura sea más visible
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(0.1, 0.1);
  // Referencia para el grupo del modelo clonado
  const modelRef = useRef<THREE.Group>(null);
  // Almacenamos los materiales clonados para actualizarlos dinámicamente
  const materials = useRef<THREE.Material[]>([]);
  // El modelo 3D y el grupo solo se crean una vez
  const [clonedModel] = useState(() => {
    const model = fbxOriginal.clone();
    model.scale.set(0.6, 0.6, 0.6);
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    const group = new THREE.Group();
    group.add(model);
    // Inicializa materiales
    materials.current = [];
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        let matIndex = 0;
        const processMaterial = (mat: THREE.Material) => {
          let newMat: THREE.MeshStandardMaterial;
          // Para ABS morado (índices 0 y 1), simular rugosidad/porosidad
          if (matIndex === 0 || matIndex === 1) {
            newMat = new THREE.MeshStandardMaterial({
              color: colors && colors[matIndex] ? colors[matIndex] : 0x800080,
              metalness: 1,
              roughness: 0.5,
              envMapIntensity: 1,
              emissive: 0x000000,
              normalMap: normalMap,
              normalScale: new THREE.Vector2(1.0, 1.0), // Fuerza máxima
            });
          } else if (matIndex === 2) {
            // ABS blanco: opaco, blanco puro
            newMat = new THREE.MeshStandardMaterial({
              color: colors && colors[matIndex] ? colors[matIndex] : 0xffffff,
              metalness: 0.5,
              roughness: 0.8,
              envMapIntensity: 0.7,
              emissive: 0x000000,
            });
          } else if (mat instanceof THREE.MeshStandardMaterial) {
            // Para otros materiales, clonar y ajustar
            newMat = mat.clone();
            newMat.metalness = 0.3;
            newMat.roughness = 0.6;
            newMat.envMapIntensity = 1;
            newMat.emissive.set(0x000000);
            if (colors && colors[matIndex]) {
              newMat.color.set(colors[matIndex]);
            }
          } else {
            // Si no es MeshStandardMaterial, crea uno básico
            newMat = new THREE.MeshStandardMaterial({
              color: colors && colors[matIndex] ? colors[matIndex] : 0xffffff,
              metalness: 0.3,
              roughness: 0.6,
              envMapIntensity: 1,
              emissive: 0x000000,
            });
          }
          // Elimina mapas de textura para evitar interferencias, pero NO el normalMap
          newMat.map = null;
          // newMat.normalMap = null; // No borrar el normalMap
          newMat.roughnessMap = null;
          newMat.metalnessMap = null;
          newMat.aoMap = null;
          newMat.alphaMap = null;
          materials.current.push(newMat);
          matIndex++;
          return newMat;
        };
        if (Array.isArray(child.material)) {
          child.material = child.material.map(processMaterial);
        } else {
          child.material = processMaterial(child.material);
        }
      }
    });
    return group;
  });

  // Solo actualiza los colores de los materiales, nunca el modelo
  useEffect(() => {
    if (!colors || colors.length === 0) return;
    materials.current.forEach((mat, i) => {
      if (hasColorProperty(mat) && colors[i] !== undefined) {
        mat.color.set(colors[i]);
        mat.needsUpdate = true;
      }
    });
    if (modelRef.current) {
      modelRef.current.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => (mat.needsUpdate = true));
          } else {
            (obj.material as THREE.Material).needsUpdate = true;
          }
        }
      });
    }
  }, [colors]);

  // Asignar envMap a los materiales reflectivos (ABS morado) cuando esté disponible
  useEffect(() => {
    if (!envMap || !("texture" in envMap)) return;
    const cubeTexture = (envMap as any).texture;
    materials.current.forEach((mat, i) => {
      if ((i === 0 || i === 1) && mat instanceof THREE.MeshStandardMaterial) {
        mat.envMap = cubeTexture;
        mat.needsUpdate = true;
      }
    });
    if (modelRef.current) {
      modelRef.current.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat, i) => {
              if (
                (i === 0 || i === 1) &&
                mat instanceof THREE.MeshStandardMaterial
              ) {
                mat.envMap = cubeTexture;
                mat.needsUpdate = true;
              }
            });
          } else if (
            (obj.material as any) instanceof THREE.MeshStandardMaterial
          ) {
            (obj.material as THREE.MeshStandardMaterial).envMap = cubeTexture;
            (obj.material as THREE.MeshStandardMaterial).needsUpdate = true;
          }
        }
      });
    }
  }, [envMap]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x += 0.003;
      modelRef.current.rotation.y += 0.005;
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
      <p className="text-lg">{`Cargando modelo... ${Math.round(progress)}%`}</p>
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
      <ambientLight intensity={0.5} />
      {/* Luces puntuales frontales tipo joyería */}
      <pointLight
        position={[0, 3, 5]}
        intensity={1.5}
        color="#fffbe6"
        castShadow
      />
      <pointLight
        position={[-1.5, 2.5, 4]}
        intensity={1.1}
        color="#fffbe6"
        castShadow
      />
      <pointLight
        position={[1.5, 2.5, 4]}
        intensity={1.1}
        color="#fffbe6"
        castShadow
      />
      {/* Luces laterales y traseras suaves */}
      <pointLight position={[0, 2, -3]} intensity={0.3} />
      <pointLight position={[3, 2, 0]} intensity={0.3} />
      <pointLight position={[-3, 2, 0]} intensity={0.3} />
      {/* Luces inferiores para resaltar detalles desde abajo */}
      <pointLight position={[1.5, -2, 1.5]} intensity={0.2} />
      <pointLight position={[-1.5, -2, 1.5]} intensity={0.2} />
      {/* Spotlights cálidos para efecto vitrina */}
      <spotLight
        position={[0, 5, 2]}
        angle={0.35}
        penumbra={0.5}
        intensity={0.7}
        castShadow
        color="#fffbe6"
        target-position={[0, 0, 0]}
      />
      {/* Luz direccional para crear sombras y resaltar detalles */}
      <directionalLight position={[0, 10, 0]} intensity={0.3} castShadow />
    </>
  );
};

/**
 * Componente principal que envuelve el FBXModel y las luces en un Canvas de Three.js.
 *
 * @param {{ colors: string[] }} props - Propiedades del componente.
 * @returns {JSX.Element} Escena completa con modelo y luces.
 */
const RotatingFBXModel: React.FC<{ colors: string[] }> = ({ colors }) => {
  return (
    <div className="relative aspect-square">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ExhibitionLights />
        <Suspense fallback={<Loading />}>
          <Environment files="/assets/env.hdr" background={false} />
          <FBXModel modelPath="/models/SmolModel.fbx" colors={colors} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RotatingFBXModel;
