"use client";

import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";
import {
  FBX_MODEL_METALNESS_MAIN,
  FBX_MODEL_ROUGHNESS_MAIN,
  FBX_MODEL_ENV_INTENSITY,
  FBX_MODEL_NORMAL_SCALE,
  FBX_MODEL_NORMAL_REPEAT,
  FBX_MODEL_ROTATION_SPEED_Y
} from "../constants/fbx-model.constants";

interface SimpleTestCanvasProps {
  colors: string[];
}

const SimpleTestCanvas: React.FC<SimpleTestCanvasProps> = ({ colors }) => {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState("initializing");
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null); // Referencia al modelo cargado
  const normalTextureRef = useRef<any>(null); // Referencia a la textura de normal mapping

  useEffect(() => {
    console.log("SimpleTestCanvas mounting...");
    
    if (typeof window !== 'undefined') {
      console.log("Client detected");
      setIsClient(true);
      setStep("client-ready");
      
      const timer1 = setTimeout(() => {
        console.log("Step 1: Testing basic Three.js");
        setStep("testing-three");
        testThreeJS();
      }, 1000);
      
      return () => clearTimeout(timer1);
    }
  }, []);

  // Efecto para actualizar colores cuando cambian
  useEffect(() => {
    if (modelRef.current && normalTextureRef.current && step === "animated") {
      console.log("Colors changed, updating model materials:", colors);
      updateModelColors(modelRef.current, normalTextureRef.current, colors);
    }
  }, [colors, step]);

  // Función para actualizar los colores del modelo
  const updateModelColors = async (fbx: any, normalTexture: any, newColors: string[]) => {
    const THREE = await import('three');
    
    let materialIndex = 0; // Contador global para materiales
    console.log("Updating colors for SmolModel with", newColors.length, "colors available");
    
    fbx.traverse((child: any) => {
      if (child.isMesh && child.material) {
        console.log("Updating colors for mesh:", child.name);
        
        if (Array.isArray(child.material)) {
          // Si es un array de materiales, procesar cada uno
          child.material.forEach((mat: any, index: number) => {
            const globalMaterialIndex = materialIndex + index;
            const colorToUse = newColors[globalMaterialIndex] || newColors[globalMaterialIndex % newColors.length] || '#8B5CF6';
            mat.color = new THREE.Color(colorToUse);
            // Asegurar que las propiedades estén actualizadas
            mat.metalness = FBX_MODEL_METALNESS_MAIN;
            mat.roughness = FBX_MODEL_ROUGHNESS_MAIN;
            mat.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
            if (mat.normalScale) {
              mat.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
            }
            mat.needsUpdate = true;
            console.log(`Updated material ${globalMaterialIndex} (local ${index}) of mesh ${child.name} to color ${colorToUse}`);
          });
          materialIndex += child.material.length;
        } else {
          // Material único
          const colorToUse = newColors[materialIndex] || newColors[materialIndex % newColors.length] || '#8B5CF6';
          child.material.color = new THREE.Color(colorToUse);
          // Asegurar que las propiedades estén actualizadas
          child.material.metalness = FBX_MODEL_METALNESS_MAIN;
          child.material.roughness = FBX_MODEL_ROUGHNESS_MAIN;
          child.material.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
          if (child.material.normalScale) {
            child.material.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
          }
          child.material.needsUpdate = true;
          console.log(`Updated single material ${materialIndex} of mesh ${child.name} to color ${colorToUse}`);
          materialIndex++;
        }
      }
    });
    
    console.log(`Updated ${materialIndex} materials total`);
  };

  const testThreeJS = async () => {
    try {
      console.log("Loading Three.js module...");
      const [THREE, { FBXLoader }, { RGBELoader }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/FBXLoader.js'),
        import('three/examples/jsm/loaders/RGBELoader.js')
      ]);
      console.log("Three.js, FBXLoader and RGBELoader loaded:", typeof THREE, typeof FBXLoader, typeof RGBELoader);
      
      setStep("three-loaded");
      
      setTimeout(() => {
        console.log("Creating basic scene...");
        createBasicScene(THREE, FBXLoader, RGBELoader);
      }, 500);
      
    } catch (error) {
      console.error("Failed to load Three.js:", error);
      setStep("error");
    }
  };

  const createBasicScene = (THREE: any, FBXLoader: any, RGBELoader: any) => {
    try {
      console.log("Creating scene objects...");
      setStep("scene-created");
      
      // Función para inicializar el renderer después de que el DOM esté listo
      const initializeRenderer = () => {
        if (!containerRef.current) {
          console.error("Container ref not available");
          setStep("error");
          return;
        }

        const containerSize = containerRef.current.getBoundingClientRect();
        console.log("Container size:", containerSize);

        // Usar tamaño fijo si el contenedor reporta 0
        const width = containerSize.width || 300;
        const height = containerSize.height || 300;
        
        console.log("Using size:", { width, height });

        try {
          // Crear elementos básicos
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

          renderer.setSize(width, height);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setClearColor(0x000000, 0);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.2; // Ligeramente más brillante para HDR
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.physicallyCorrectLights = true;

          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(renderer.domElement);

          console.log("Renderer initialized successfully");

          // Configurar cámara para mejor vista del modelo
          camera.position.set(0, 0, 2.5); // Más cerca para que el objeto sea más grande
          camera.lookAt(0, 0, 0);

          // Cargar HDR environment map
          const rgbeLoader = new RGBELoader();
          rgbeLoader.load('/assets/env.hdr', (texture: any) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.backgroundIntensity = 0; // Sin background visible
            scene.environmentIntensity = 1.5; // Intensidad más alta para reflejos
            // Completamente transparente - sin background
            console.log("HDR environment loaded with enhanced intensity");
          });

          // Añadir luces optimizadas pero más suaves
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight.position.set(2, 2, 2);
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 1024;
          directionalLight.shadow.mapSize.height = 1024;
          scene.add(directionalLight);

          console.log("Lights and environment setup complete");

          // Cargar texture de normal mapping
          const textureLoader = new THREE.TextureLoader();
          const normalTexture = textureLoader.load('/assets/noise-normal.webp');
          normalTexture.wrapS = THREE.RepeatWrapping;
          normalTexture.wrapT = THREE.RepeatWrapping;
          normalTexture.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
          normalTexture.flipY = false;
          
          // Guardar referencia a la textura
          normalTextureRef.current = normalTexture;

          // Cargar modelo FBX
          const loader = new FBXLoader();
          loader.load(
            '/models/SmolModel.fbx', // Usar SmolModel
            (fbx: any) => {
              console.log("SmolModel FBX loaded successfully:", fbx);
              
              // Calcular el bounding box del modelo para centrarlo y escalarlo correctamente
              const box = new THREE.Box3().setFromObject(fbx);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());
              
              // Escalar el modelo para que ocupe aproximadamente el 80% del viewport
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 1.6 / maxDim; // Ajustar para que sea más grande
              
              fbx.scale.setScalar(scale);
              
              // Centrar el modelo
              fbx.position.copy(center).multiplyScalar(-scale);
              
              fbx.castShadow = true;
              fbx.receiveShadow = true;
              
              console.log("Model centered and scaled. Original size:", size, "Scale:", scale);
              
              // Aplicar colores y materiales respetando los originales del modelo
              let materialIndex = 0; // Contador global para materiales
              
              console.log("Starting material processing for SmolModel with", colors.length, "colors available");
              
              fbx.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  if (child.material) {
                    console.log("Processing mesh:", child.name, "Material type:", Array.isArray(child.material) ? "Array" : "Single");
                    
                    if (Array.isArray(child.material)) {
                      // Si es un array de materiales, procesar cada uno
                      console.log(`Mesh ${child.name} has ${child.material.length} materials`);
                      
                      child.material = child.material.map((mat: any, index: number) => {
                        const globalMaterialIndex = materialIndex + index;
                        const colorToUse = colors[globalMaterialIndex] || colors[globalMaterialIndex % colors.length] || '#8B5CF6';
                        console.log(`Applying color ${colorToUse} to material ${globalMaterialIndex} (local ${index}) of mesh ${child.name}`);
                        
                        const newMat = new THREE.MeshStandardMaterial({
                          color: new THREE.Color(colorToUse),
                          metalness: FBX_MODEL_METALNESS_MAIN,
                          roughness: FBX_MODEL_ROUGHNESS_MAIN,
                          normalMap: normalTexture,
                          normalScale: FBX_MODEL_NORMAL_SCALE,
                          envMapIntensity: FBX_MODEL_ENV_INTENSITY,
                          side: THREE.DoubleSide
                        });
                        
                        // Preservar texturas originales si existen
                        if (mat.map) newMat.map = mat.map;
                        if (mat.normalMap) newMat.normalMap = mat.normalMap;
                        if (mat.transparent !== undefined) newMat.transparent = mat.transparent;
                        if (mat.opacity !== undefined) newMat.opacity = mat.opacity;
                        
                        return newMat;
                      });
                      
                      materialIndex += child.material.length; // Incrementar contador global
                    } else {
                      // Material único
                      const colorToUse = colors[materialIndex] || colors[materialIndex % colors.length] || '#8B5CF6';
                      console.log(`Applying color ${colorToUse} to single material ${materialIndex} of mesh ${child.name}`);
                      
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
                      
                      // Preservar texturas originales si existen
                      if (originalMaterial.map) newMaterial.map = originalMaterial.map;
                      if (originalMaterial.normalMap) newMaterial.normalMap = originalMaterial.normalMap;
                      if (originalMaterial.transparent !== undefined) newMaterial.transparent = originalMaterial.transparent;
                      if (originalMaterial.opacity !== undefined) newMaterial.opacity = originalMaterial.opacity;
                      
                      child.material = newMaterial;
                      materialIndex++; // Incrementar contador global
                    }
                    
                    console.log("Applied enhanced material to mesh:", child.name, "Total materials processed so far:", materialIndex);
                  }
                }
              });
              
              console.log(`Total materials found and processed: ${materialIndex}`);
              
              scene.add(fbx);
              console.log("SmolModel added to scene with enhanced materials");
              
              // Guardar referencia al modelo para futuras actualizaciones de color
              modelRef.current = fbx;

              // Animación suave
              const animate = () => {
                requestAnimationFrame(animate);
                fbx.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
                renderer.render(scene, camera);
              };

              animate();
              setStep("animated");
              console.log("Animation started with SmolModel");
            },
            (progress: any) => {
              console.log("Loading progress:", (progress.loaded / progress.total) * 100 + '%');
            },
            (error: any) => {
              console.error("Error loading SmolModel:", error);
              setStep("error");
            }
          );

        } catch (innerError) {
          console.error("Failed to create scene:", innerError);
          setStep("error");
        }
      };

      // Esperar a que el DOM esté listo
      setTimeout(initializeRenderer, 200);
      
    } catch (error) {
      console.error("Failed to create scene:", error);
      setStep("error");
    }
  };

  if (!isClient) {
    return (
      <div className="relative aspect-square flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm mt-2">Detectando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square flex items-center justify-center" style={{ minHeight: "300px", minWidth: "300px" }}>
      {/* Contenedor siempre visible para Three.js */}
      <div 
        ref={containerRef} 
        className="w-full h-full absolute inset-0"
        style={{ minWidth: "300px", minHeight: "300px", backgroundColor: "transparent" }}
      ></div>
      
      {/* Overlay de debug solo cuando no está animando */}
      {step !== "animated" && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="p-4 bg-white bg-opacity-90 rounded shadow">
            <h3 className="font-bold mb-2">Debug SmolModel</h3>
            <p className="text-sm">Estado: {step}</p>
            <div className="mt-2">
              <div className="w-4 h-4 mx-auto rounded-full" 
                   style={{ backgroundColor: colors[0] || '#8B5CF6' }}>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {step === "initializing" && "Inicializando..."}
              {step === "client-ready" && "Cliente listo"}
              {step === "testing-three" && "Cargando Three.js + HDR"}
              {step === "three-loaded" && "Preparando entorno 3D"}
              {step === "scene-created" && "Cargando SmolModel + texturas..."}
              {step === "animated" && "¡SmolModel cargado!"}
              {step === "error" && "Error - Ver consola"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestCanvas;
