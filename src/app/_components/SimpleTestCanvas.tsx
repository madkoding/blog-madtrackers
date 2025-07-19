"use client";

import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  FBX_MODEL_METALNESS_MAIN,
  FBX_MODEL_ROUGHNESS_MAIN,
  FBX_MODEL_ENV_INTENSITY,
  FBX_MODEL_NORMAL_SCALE,
  FBX_MODEL_NORMAL_REPEAT,
  FBX_MODEL_ROTATION_SPEED_X,
  FBX_MODEL_ROTATION_SPEED_Y,
  FBX_MODEL_ROTATION_SPEED_Z
} from "../constants/fbx-model.constants";

interface SimpleTestCanvasProps {
  colors: string[];
}

const SimpleTestCanvas: React.FC<SimpleTestCanvasProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState("initializing");
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalTextureRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      setStep("client-ready");
      
      const timer1 = setTimeout(() => {
        setStep("testing-three");
        testThreeJS();
      }, 1000);
      
      return () => clearTimeout(timer1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modelRef.current && normalTextureRef.current && step === "animated") {
      updateModelColors(modelRef.current, normalTextureRef.current, colors);
    }
  }, [colors, step]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateModelColors = async (fbx: any, normalTexture: any, newColors: string[]) => {
    const THREE = await import('three');
    
    let materialIndex = 0;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbx.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          child.material.forEach((mat: any, index: number) => {
            const globalMaterialIndex = materialIndex + index;
            const colorToUse = newColors[globalMaterialIndex] || newColors[globalMaterialIndex % newColors.length] || '#8B5CF6';
            mat.color = new THREE.Color(colorToUse);
            mat.metalness = FBX_MODEL_METALNESS_MAIN;
            mat.roughness = FBX_MODEL_ROUGHNESS_MAIN;
            mat.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
            if (mat.normalScale) {
              mat.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
            }
            mat.needsUpdate = true;
          });
          materialIndex += child.material.length;
        } else {
          const colorToUse = newColors[materialIndex] || newColors[materialIndex % newColors.length] || '#8B5CF6';
          child.material.color = new THREE.Color(colorToUse);
          child.material.metalness = FBX_MODEL_METALNESS_MAIN;
          child.material.roughness = FBX_MODEL_ROUGHNESS_MAIN;
          child.material.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
          if (child.material.normalScale) {
            child.material.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
          }
          child.material.needsUpdate = true;
          materialIndex++;
        }
      }
    });
  };

  const testThreeJS = async () => {
    try {
      const [THREE, { FBXLoader }, { RGBELoader }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/FBXLoader.js'),
        import('three/examples/jsm/loaders/RGBELoader.js')
      ]);
      
      setStep("three-loaded");
      
      setTimeout(() => {
        createBasicScene(THREE, FBXLoader, RGBELoader);
      }, 500);
      
    } catch {
      setStep("error");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createBasicScene = (THREE: any, FBXLoader: any, RGBELoader: any) => {
    try {
      setStep("scene-created");
      
      const initializeRenderer = () => {
        if (!containerRef.current) {
          setStep("error");
          return;
        }

        const containerSize = containerRef.current.getBoundingClientRect();
        const width = containerSize.width || 300;
        const height = containerSize.height || 300;

        try {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
          });

          renderer.setSize(width, height);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setClearColor(0x000000, 0);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.2;
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.physicallyCorrectLights = true;

          renderer.domElement.style.backgroundColor = 'transparent';

          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(renderer.domElement);

          camera.position.set(0, 0, 2.5);
          camera.lookAt(0, 0, 0);

          const rgbeLoader = new RGBELoader();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rgbeLoader.load('/assets/env.hdr', (texture: any) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.backgroundIntensity = 0;
            scene.environmentIntensity = 1.5;
          });

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight.position.set(2, 2, 2);
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 1024;
          directionalLight.shadow.mapSize.height = 1024;
          scene.add(directionalLight);

          const textureLoader = new THREE.TextureLoader();
          const normalTexture = textureLoader.load('/assets/noise-normal.webp');
          normalTexture.wrapS = THREE.RepeatWrapping;
          normalTexture.wrapT = THREE.RepeatWrapping;
          normalTexture.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
          normalTexture.flipY = false;
          
          normalTextureRef.current = normalTexture;

          const loader = new FBXLoader();
          loader.load(
            '/models/SmolModel.fbx',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (fbx: any) => {
              // Centrar el modelo en el origen REAL
              const box = new THREE.Box3().setFromObject(fbx);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 2 / maxDim;
              fbx.scale.setScalar(scale);
              // Mover todos los hijos para que el centro esté en el origen
              fbx.traverse((child: any) => {
                if (child.isMesh || child.isObject3D) {
                  child.position.sub(center);
                }
              });
              fbx.position.set(0, 0, 0);
              fbx.castShadow = true;
              fbx.receiveShadow = true;
              
              let materialIndex = 0;
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fbx.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  if (child.material) {
                    if (Array.isArray(child.material)) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      child.material = child.material.map((mat: any, index: number) => {
                        const globalMaterialIndex = materialIndex + index;
                        const colorToUse = colors[globalMaterialIndex] || colors[globalMaterialIndex % colors.length] || '#8B5CF6';
                        
                        const newMat = new THREE.MeshStandardMaterial({
                          color: new THREE.Color(colorToUse),
                          metalness: FBX_MODEL_METALNESS_MAIN,
                          roughness: FBX_MODEL_ROUGHNESS_MAIN,
                          normalMap: normalTexture,
                          normalScale: FBX_MODEL_NORMAL_SCALE,
                          envMapIntensity: FBX_MODEL_ENV_INTENSITY,
                          side: THREE.DoubleSide
                        });
                        
                        if (mat.map) newMat.map = mat.map;
                        if (mat.normalMap) newMat.normalMap = mat.normalMap;
                        if (mat.transparent !== undefined) newMat.transparent = mat.transparent;
                        if (mat.opacity !== undefined) newMat.opacity = mat.opacity;
                        
                        return newMat;
                      });
                      
                      materialIndex += child.material.length;
                    } else {
                      const colorToUse = colors[materialIndex] || colors[materialIndex % colors.length] || '#8B5CF6';
                      
                      const originalMaterial = child.material;
                      const newMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(colorToUse),
                        metalness: FBX_MODEL_METALNESS_MAIN,
                        roughness: FBX_MODEL_ROUGHNESS_MAIN,
                        normalMap: normalTexture,
                        normalScale: FBX_MODEL_NORMAL_SCALE,
                        envMapIntensity: FBX_MODEL_ENV_INTENSITY,
                        side: THREE.DoubleSide
                      });
                      
                      if (originalMaterial.map) newMaterial.map = originalMaterial.map;
                      if (originalMaterial.normalMap) newMaterial.normalMap = originalMaterial.normalMap;
                      if (originalMaterial.transparent !== undefined) newMaterial.transparent = originalMaterial.transparent;
                      if (originalMaterial.opacity !== undefined) newMaterial.opacity = originalMaterial.opacity;
                      
                      child.material = newMaterial;
                      materialIndex++;
                    }
                  }
                }
              });
              
              scene.add(fbx);
              modelRef.current = fbx;

              // Animación: rotar en X, Y y Z sobre el centro
              const animate = () => {
                requestAnimationFrame(animate);
                fbx.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
                fbx.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
                fbx.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
                renderer.render(scene, camera);
              };

              animate();
              setStep("animated");
            },
            undefined,
            () => {
              setStep("error");
            }
          );

        } catch {
          setStep("error");
        }
      };

      setTimeout(initializeRenderer, 200);
      
    } catch {
      setStep("error");
    }
  };

  if (!isClient) {
    return (
      <div 
        className="three-canvas-container relative aspect-square flex items-center justify-center"
        style={{ 
          backgroundColor: "transparent",
          background: "transparent",
          backgroundImage: "none"
        }}
      >
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm mt-2">Detectando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="three-canvas-container relative aspect-square flex items-center justify-center" 
      style={{ 
        minHeight: "300px", 
        minWidth: "300px",
        backgroundColor: "transparent",
        background: "transparent",
        backgroundImage: "none",
        backgroundClip: "border-box",
        backgroundOrigin: "border-box"
      }}
    >
      <div 
        ref={containerRef} 
        className="three-canvas-container w-full h-full absolute inset-0"
        style={{ 
          minWidth: "300px", 
          minHeight: "300px", 
          backgroundColor: "transparent",
          background: "transparent",
          backgroundImage: "none",
          overflow: "hidden"
        }}
      ></div>
    </div>
  );
};

export default SimpleTestCanvas;