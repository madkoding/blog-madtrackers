import React, { useRef, useEffect, useMemo } from "react";
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
import ModelCache from "./ModelCache";

interface OptimizedModelProps extends ModelProps {
  enableLOD?: boolean;
  maxDistance?: number;
}

// Tipo auxiliar para los userData de LOD
interface LODUserData {
  lod0?: THREE.Group;
  lod1?: THREE.Group;
  lod2?: THREE.Group;
  [key: string]: THREE.Group | undefined;
}

// Función para simplificar geometría según distancia
function simplifyGeometry(geometry: THREE.BufferGeometry, factor: number): THREE.BufferGeometry {
  if (factor >= 1) return geometry;
  
  const simplified = geometry.clone();
  
  // Simplificar índices si existen
  if (simplified.index) {
    const indexArray = simplified.index.array;
    const newLength = Math.floor(indexArray.length * factor);
    const newIndices = new Uint16Array(newLength);
    
    for (let i = 0; i < newLength; i += 3) {
      const srcIndex = Math.floor((i / newLength) * (indexArray.length - 2));
      newIndices[i] = indexArray[srcIndex];
      newIndices[i + 1] = indexArray[srcIndex + 1];
      newIndices[i + 2] = indexArray[srcIndex + 2];
    }
    
    simplified.setIndex(new THREE.BufferAttribute(newIndices, 1));
  }
  
  return simplified;
}

// Función auxiliar para crear material optimizado
function createOptimizedMaterial({
  mat,
  colorValue,
  normalMap,
  globalMatIndex,
  colors,
  isLowDetail = false,
}: {
  mat?: THREE.Material;
  colorValue: string | number;
  normalMap: THREE.Texture;
  globalMatIndex: number;
  colors: string[];
  isLowDetail?: boolean;
}): THREE.MeshStandardMaterial {
  const baseMaterial = {
    color: colorValue,
    envMapIntensity: FBX_MODEL_ENV_INTENSITY,
    emissive: 0x000000,
  };

  // Configuración específica por índice de material
  if (globalMatIndex === 0 || globalMatIndex === 1) {
    return new THREE.MeshStandardMaterial({
      ...baseMaterial,
      metalness: FBX_MODEL_METALNESS_MAIN,
      roughness: FBX_MODEL_ROUGHNESS_MAIN,
      normalMap: isLowDetail ? null : normalMap, // Omitir normal map en LOD bajo
      normalScale: isLowDetail ? undefined : FBX_MODEL_NORMAL_SCALE,
    });
  } else if (globalMatIndex === 2) {
    return new THREE.MeshStandardMaterial({
      ...baseMaterial,
      metalness: FBX_MODEL_METALNESS_SECONDARY,
      roughness: FBX_MODEL_ROUGHNESS_SECONDARY,
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
      ...baseMaterial,
      metalness: FBX_MODEL_METALNESS_DEFAULT,
      roughness: FBX_MODEL_ROUGHNESS_DEFAULT,
    });
  }
}

// Extracción de funciones auxiliares fuera de useMemo para reducir anidamiento y tipado explícito
function assignMaterialFactory({ normalMap, colors, materials, isLowDetail = false }: {
  normalMap: THREE.Texture;
  colors: string[];
  materials: React.MutableRefObject<THREE.Material[]>;
  isLowDetail?: boolean;
}) {
  return function assignMaterial(mat: THREE.Material | undefined, globalMatIndex: number): THREE.MeshStandardMaterial {
    const colorValue = colors[globalMatIndex] ??
      (globalMatIndex === 0 || globalMatIndex === 1
        ? FBX_MODEL_PURPLE_COLOR
        : FBX_MODEL_DEFAULT_COLOR);
    const newMat = createOptimizedMaterial({
      mat,
      colorValue,
      normalMap,
      globalMatIndex,
      colors,
      isLowDetail,
    });
    newMat.map = null;
    newMat.roughnessMap = null;
    newMat.metalnessMap = null;
    newMat.aoMap = null;
    newMat.alphaMap = null;
    newMat.lightMap = null;
    newMat.emissiveMap = null;
    materials.current.push(newMat);
    return newMat;
  };
}

function centerAndScaleModel(model: THREE.Group) {
  model.scale.set(FBX_MODEL_SCALE, FBX_MODEL_SCALE, FBX_MODEL_SCALE);
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);
}

const OptimizedFBXModel: React.FC<OptimizedModelProps> = ({ 
  modelPath, 
  colors = [],
  enableLOD = true,
  maxDistance = 10
}) => {
  const fbxOriginal = useLoader(FBXLoader, modelPath);
  const envMap = useEnvironment({ files: "/assets/env_256x128.hdr" });
  const normalMap = useLoader(TextureLoader, "/assets/noise-normal.webp");
  const modelRef = useRef<THREE.Group>(null);
  const materials = useRef<THREE.Material[]>([]);
  const currentLODLevel = useRef<number>(0);
  const modelCache = ModelCache.getInstance();

  // Configurar textura normal
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
  normalMap.generateMipmaps = false;
  normalMap.minFilter = THREE.LinearFilter;

  // Crear modelos con diferentes niveles de detalle
  const lodModels: (THREE.Group & { userData: LODUserData }) | null = useMemo(() => {
    if (!fbxOriginal || !enableLOD) return null;
    const cacheKey = `${modelPath}_lod`;
    if (modelCache.has(cacheKey)) {
      return modelCache.get(cacheKey) as THREE.Group & { userData: LODUserData };
    }
    const assignMaterial = assignMaterialFactory({ normalMap, colors, materials, isLowDetail: false });
    const assignMaterialLow = assignMaterialFactory({ normalMap, colors, materials, isLowDetail: true });
    function createLODModel(simplificationFactor: number, isLowDetail: boolean) {
      const assignMat = isLowDetail ? assignMaterialLow : assignMaterial;
      const model = fbxOriginal.clone();
      centerAndScaleModel(model);
      let globalMatIndex = 0;
      model.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry && simplificationFactor < 1) {
            child.geometry = simplifyGeometry(child.geometry, simplificationFactor);
          }
          if (Array.isArray(child.material)) {
            const newMats: THREE.Material[] = [];
            for (const mat of child.material) {
              newMats.push(assignMat(mat, globalMatIndex));
              globalMatIndex++;
            }
            child.material = newMats;
          } else {
            child.material = assignMat(child.material, globalMatIndex);
            globalMatIndex++;
          }
        }
      });
      const group = new THREE.Group();
      group.add(model);
      return group;
    }
    const lodGroup = new THREE.Group() as THREE.Group & { userData: LODUserData };
    lodGroup.userData.lod0 = createLODModel(1.0, false);
    lodGroup.userData.lod1 = createLODModel(0.7, false);
    lodGroup.userData.lod2 = createLODModel(0.4, true);
    modelCache.set(cacheKey, lodGroup);
    return lodGroup;
  }, [fbxOriginal, normalMap, colors, enableLOD, modelPath, modelCache]);

  // Modelo simple para cuando LOD está deshabilitado
  const simpleModel = useMemo(() => {
    if (!fbxOriginal || enableLOD) return null;
    const cacheKey = `${modelPath}_simple`;
    if (modelCache.has(cacheKey)) {
      return modelCache.get(cacheKey);
    }
    const assignMaterial = assignMaterialFactory({ normalMap, colors, materials });
    const model = fbxOriginal.clone();
    centerAndScaleModel(model);
    const group = new THREE.Group();
    group.add(model);
    materials.current = [];
    let globalMatIndex = 0;
    model.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          const newMats: THREE.Material[] = [];
          for (const mat of child.material) {
            newMats.push(assignMaterial(mat, globalMatIndex));
            globalMatIndex++;
          }
          child.material = newMats;
        } else {
          child.material = assignMaterial(child.material, globalMatIndex);
          globalMatIndex++;
        }
      }
    });
    modelCache.set(cacheKey, group);
    return group;
  }, [fbxOriginal, normalMap, colors, enableLOD, modelPath, modelCache]);

  const currentModel = enableLOD ? lodModels : simpleModel;

  // Efecto para actualizar colores
  useEffect(() => {
    if (!currentModel || colors.length === 0) return;
    
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
  }, [currentModel, colors]);

  // Efecto para configurar environment map
  useEffect(() => {
    if (!currentModel || !envMap || !("texture" in envMap)) return;
    
    const cubeTexture = (envMap as { texture: THREE.CubeTexture }).texture;
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
  }, [currentModel, envMap]);

  // Refactorizar lógica de useFrame para reducir complejidad
  function rotateModel(modelRef: React.RefObject<THREE.Group>) {
    if (modelRef.current) {
      modelRef.current.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
      modelRef.current.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
      modelRef.current.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
    }
  }
  function updateLOD(camera: THREE.Camera, modelRef: React.RefObject<THREE.Group>, lodModels: (THREE.Group & { userData: LODUserData }) | null, maxDistance: number) {
    if (!modelRef.current || !lodModels) return;
    const distance = camera.position.distanceTo(modelRef.current.position);
    let newLODLevel = 0;
    if (distance > maxDistance * 0.7) {
      newLODLevel = 2;
    } else if (distance > maxDistance * 0.4) {
      newLODLevel = 1;
    }
    if (newLODLevel !== currentLODLevel.current) {
      currentLODLevel.current = newLODLevel;
      while (modelRef.current.children.length > 0) {
        modelRef.current.remove(modelRef.current.children[0]);
      }
      const lodKey = `lod${newLODLevel}`;
      const lodChild = lodModels.userData[lodKey];
      if (lodChild) {
        modelRef.current.add(lodChild.clone());
      }
    }
  }
  useFrame(({ camera }) => {
    rotateModel(modelRef);
    if (enableLOD) {
      updateLOD(camera, modelRef, lodModels ?? null, maxDistance);
    }
  });

  if (!currentModel) return null;

  return <primitive object={currentModel} ref={modelRef} />;
};

export default OptimizedFBXModel;
