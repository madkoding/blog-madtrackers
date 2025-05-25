// sonarlint-disable typescript:S6747
import React, { useRef, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEnvironment } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TextureLoader } from "three";
import { ModelProps, hasColorProperty } from "./types";
import {
  FBX_MODEL_SCALE,
  FBX_MODEL_ROTATION_SPEED_X,
  FBX_MODEL_ROTATION_SPEED_Y,
  FBX_MODEL_ROTATION_SPEED_Z,
  FBX_MODEL_METALNESS_MAIN,
  FBX_MODEL_ROUGHNESS_MAIN,
  FBX_MODEL_METALNESS_SECONDARY,
  FBX_MODEL_ROUGHNESS_SECONDARY,
  FBX_MODEL_METALNESS_DEFAULT,
  FBX_MODEL_ROUGHNESS_DEFAULT,
  FBX_MODEL_ENV_INTENSITY,
  FBX_MODEL_NORMAL_SCALE,
  FBX_MODEL_DEFAULT_COLOR,
  FBX_MODEL_PURPLE_COLOR,
  FBX_MODEL_NORMAL_REPEAT,
} from "../../constants";

// Función auxiliar para crear un material estándar según el índice y color
function createStandardMaterial({
  mat,
  colorValue,
  normalMap,
  globalMatIndex,
  colors,
}: {
  mat?: THREE.Material;
  colorValue: string | number;
  normalMap: THREE.Texture;
  globalMatIndex: number;
  colors: string[];
}): THREE.MeshStandardMaterial {
  if (globalMatIndex === 0 || globalMatIndex === 1) {
    return new THREE.MeshStandardMaterial({
      color: colorValue,
      metalness: FBX_MODEL_METALNESS_MAIN,
      roughness: FBX_MODEL_ROUGHNESS_MAIN,
      envMapIntensity: FBX_MODEL_ENV_INTENSITY,
      emissive: 0x000000,
      normalMap: normalMap,
      normalScale: FBX_MODEL_NORMAL_SCALE,
    });
  } else if (globalMatIndex === 2) {
    return new THREE.MeshStandardMaterial({
      color: colorValue,
      metalness: FBX_MODEL_METALNESS_SECONDARY,
      roughness: FBX_MODEL_ROUGHNESS_SECONDARY,
      envMapIntensity: FBX_MODEL_ENV_INTENSITY,
      emissive: 0x000000,
    });
  } else if (mat instanceof THREE.MeshStandardMaterial) {
    const newMat = mat.clone();
    newMat.metalness = FBX_MODEL_METALNESS_DEFAULT;
    newMat.roughness = FBX_MODEL_ROUGHNESS_DEFAULT;
    newMat.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
    newMat.emissive.set(0x000000);
    if (colors?.[globalMatIndex]) {
      newMat.color.set(colors[globalMatIndex]);
    }
    return newMat;
  } else {
    return new THREE.MeshStandardMaterial({
      color: colorValue,
      metalness: FBX_MODEL_METALNESS_DEFAULT,
      roughness: FBX_MODEL_ROUGHNESS_DEFAULT,
      envMapIntensity: FBX_MODEL_ENV_INTENSITY,
      emissive: 0x000000,
    });
  }
}

const FBXModel: React.FC<ModelProps> = ({ modelPath, colors }) => {
  const fbxOriginal = useLoader(FBXLoader, modelPath);
  const envMap = useEnvironment({ files: "/assets/env.hdr" });
  const normalMap = useLoader(TextureLoader, "/assets/noise-normal.png");
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
  const modelRef = useRef<THREE.Group>(null);
  const materials = useRef<THREE.Material[]>([]);

  // Defino assignMaterial ANTES de useMemo
  const assignMaterial = (
    mat: THREE.Material | undefined,
    globalMatIndex: number
  ) => {
    const colorValue =
      colors?.[globalMatIndex] ??
      (globalMatIndex === 0 || globalMatIndex === 1
        ? FBX_MODEL_PURPLE_COLOR
        : FBX_MODEL_DEFAULT_COLOR);
    const newMat = createStandardMaterial({
      mat,
      colorValue,
      normalMap,
      globalMatIndex,
      colors,
    });
    newMat.map = null;
    newMat.roughnessMap = null;
    newMat.metalnessMap = null;
    newMat.aoMap = null;
    newMat.alphaMap = null;
    materials.current.push(newMat);
    return newMat;
  };

  const clonedModel = React.useMemo(() => {
    if (!fbxOriginal) return null;
    const model = fbxOriginal.clone();
    model.scale.set(FBX_MODEL_SCALE, FBX_MODEL_SCALE, FBX_MODEL_SCALE);
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);
    const group = new THREE.Group();
    group.add(model);
    materials.current = [];
    let globalMatIndex = 0;
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => {
            const newMat = assignMaterial(mat, globalMatIndex);
            globalMatIndex++;
            return newMat;
          });
        } else {
          const newMat = assignMaterial(child.material, globalMatIndex);
          child.material = newMat;
          globalMatIndex++;
        }
      }
    });
    return group;
  }, [fbxOriginal, normalMap]);

  useEffect(() => {
    if (!clonedModel || !colors || colors.length === 0) return;
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
  }, [clonedModel, colors]);

  useEffect(() => {
    if (!clonedModel || !envMap || !("texture" in envMap)) return;
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
          } else if (obj.material instanceof THREE.MeshStandardMaterial) {
            obj.material.envMap = cubeTexture;
            obj.material.needsUpdate = true;
          }
        }
      });
    }
  }, [clonedModel, envMap]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
      modelRef.current.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
      modelRef.current.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
    }
  });

  if (!clonedModel) return null;

  // @ts-ignore
  return <primitive object={clonedModel} ref={modelRef} />;
};

export default FBXModel;
