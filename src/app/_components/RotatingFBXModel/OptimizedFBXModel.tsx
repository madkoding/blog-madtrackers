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

const OptimizedFBXModel: React.FC<OptimizedModelProps> = ({ 
  modelPath, 
  colors,
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
  const lodModels = useMemo(() => {
    if (!fbxOriginal || !enableLOD) return null;

    const cacheKey = `${modelPath}_lod`;
    if (modelCache.has(cacheKey)) {
      return modelCache.get(cacheKey);
    }

    const createLODModel = (simplificationFactor: number, isLowDetail: boolean) => {
      const assignMaterial = (mat: THREE.Material | undefined, globalMatIndex: number) => {
        const colorValue = colors?.[globalMatIndex] ?? 
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

        // Limpiar mapas innecesarios
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

      const model = fbxOriginal.clone();
      model.scale.set(FBX_MODEL_SCALE, FBX_MODEL_SCALE, FBX_MODEL_SCALE);
      
      // Centrar modelo
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      let globalMatIndex = 0;
      model.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          // Simplificar geometría según factor
          if (child.geometry && simplificationFactor < 1) {
            child.geometry = simplifyGeometry(child.geometry, simplificationFactor);
          }

          // Asignar materiales
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

      const group = new THREE.Group();
      group.add(model);
      return group;
    };

    // Crear diferentes niveles de LOD
    const lodGroup = new THREE.Group();
    
    // LOD 0: Máximo detalle (distancia cercana)
    const highDetail = createLODModel(1.0, false);
    lodGroup.userData.lod0 = highDetail;
    
    // LOD 1: Detalle medio (distancia media)
    const mediumDetail = createLODModel(0.7, false);
    lodGroup.userData.lod1 = mediumDetail;
    
    // LOD 2: Bajo detalle (distancia lejana)
    const lowDetail = createLODModel(0.4, true);
    lodGroup.userData.lod2 = lowDetail;

    // Cachear el grupo LOD
    modelCache.set(cacheKey, lodGroup);
    
    return lodGroup;
  }, [fbxOriginal, normalMap, colors, enableLOD, modelPath]);

  // Modelo simple para cuando LOD está deshabilitado
  const simpleModel = useMemo(() => {
    if (!fbxOriginal || enableLOD) return null;
    
    const cacheKey = `${modelPath}_simple`;
    if (modelCache.has(cacheKey)) {
      return modelCache.get(cacheKey);
    }

    const assignMaterial = (mat: THREE.Material | undefined, globalMatIndex: number) => {
      const colorValue = colors?.[globalMatIndex] ?? 
        (globalMatIndex === 0 || globalMatIndex === 1 
          ? FBX_MODEL_PURPLE_COLOR 
          : FBX_MODEL_DEFAULT_COLOR);
      
      const newMat = createOptimizedMaterial({
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
      newMat.lightMap = null;
      newMat.emissiveMap = null;

      materials.current.push(newMat);
      return newMat;
    };

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

    modelCache.set(cacheKey, group);
    return group;
  }, [fbxOriginal, normalMap, colors, enableLOD, modelPath]);

  const currentModel = enableLOD ? lodModels : simpleModel;

  // Efecto para actualizar colores
  useEffect(() => {
    if (!currentModel || !colors || colors.length === 0) return;
    
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

  // Frame loop con LOD dinámico
  useFrame(({ camera }) => {
    if (modelRef.current) {
      // Rotación del modelo
      modelRef.current.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
      modelRef.current.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
      modelRef.current.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;

      // LOD dinámico basado en distancia
      if (enableLOD && lodModels) {
        const distance = camera.position.distanceTo(modelRef.current.position);
        let newLODLevel = 0;
        
        if (distance > maxDistance * 0.7) {
          newLODLevel = 2; // Bajo detalle
        } else if (distance > maxDistance * 0.4) {
          newLODLevel = 1; // Detalle medio
        } else {
          newLODLevel = 0; // Alto detalle
        }

        // Cambiar LOD solo si es necesario
        if (newLODLevel !== currentLODLevel.current) {
          currentLODLevel.current = newLODLevel;
          
          // Limpiar hijos actuales
          while (modelRef.current.children.length > 0) {
            modelRef.current.remove(modelRef.current.children[0]);
          }
          
          // Añadir el modelo LOD apropiado
          const lodKey = `lod${newLODLevel}`;
          if (lodModels.userData[lodKey]) {
            modelRef.current.add(lodModels.userData[lodKey].clone());
          }
        }
      }
    }
  });

  if (!currentModel) return null;

  return <primitive object={currentModel} ref={modelRef} />;
};

export default OptimizedFBXModel;
