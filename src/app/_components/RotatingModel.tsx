"use client";

import React, { useEffect, useRef } from "react";
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
import LoadingSpinner from "./LoadingSpinner";

interface RotatingModelProps {
  colors: string[];
}

const RotatingModel: React.FC<RotatingModelProps> = ({ colors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalTextureRef = useRef<any>(null);
  const rendererRef = useRef<any>(null); // Referencia al renderer
  const cameraRef = useRef<any>(null); // Referencia a la cámara
  const [loading, setLoading] = React.useState(true);

  // ResizeObserver para ajustar el renderer y la cámara
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        rendererRef.current.setSize(width, height, false);
        rendererRef.current.domElement.style.width = '100%';
        rendererRef.current.domElement.style.height = '100%';
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    // Llamar al menos una vez al montar
    handleResize();
    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      testThreeJS();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modelRef.current && normalTextureRef.current) {
      updateModelColors(modelRef.current, normalTextureRef.current, colors);
    }
  }, [colors]);

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
      createBasicScene(THREE, FBXLoader, RGBELoader);
    } catch {
      // error silencioso
    }
  };

  // Función auxiliar para inicializar el renderer
  function setupRenderer(THREE: any, container: HTMLDivElement, width: number, height: number) {
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
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    return renderer;
  }

  // Función auxiliar para cargar el entorno HDR
  function loadEnvironment(RGBELoader: any, THREE: any, scene: any) {
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/assets/env.hdr', (texture: any) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.backgroundIntensity = 0;
      scene.environmentIntensity = 1.5;
    });
  }

  // Función auxiliar para añadir luces
  function addLights(THREE: any, scene: any) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 2, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
  }

  // Función auxiliar para cargar la textura normal
  function loadNormalTexture(THREE: any, normalTextureRef: any) {
    const textureLoader = new THREE.TextureLoader();
    const normalTexture = textureLoader.load('/assets/noise-normal.webp');
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
    normalTexture.flipY = false;
    normalTextureRef.current = normalTexture;
    return normalTexture;
  }

  // Función auxiliar para centrar y escalar el modelo
  function centerAndScaleModel(THREE: any, fbx: any) {
    const box = new THREE.Box3().setFromObject(fbx);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    fbx.scale.setScalar(scale);
    fbx.traverse((child: any) => {
      if (child.isMesh || child.isObject3D) {
        child.position.sub(center);
      }
    });
    fbx.position.set(0, 0, 0);
    fbx.castShadow = true;
    fbx.receiveShadow = true;
  }

  // Refactorización de applyMaterials para reducir complejidad
  function applyMaterials(THREE: any, fbx: any, normalTexture: any, colors: string[]) {
    let materialIndex = 0;
    fbx.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat: any, index: number) => {
              return createMaterialFrom(mat, THREE, normalTexture, colors, materialIndex + index);
            });
            materialIndex += child.material.length;
          } else {
            child.material = createMaterialFrom(child.material, THREE, normalTexture, colors, materialIndex);
            materialIndex++;
          }
        }
      }
    });
  }

  function createMaterialFrom(mat: any, THREE: any, normalTexture: any, colors: string[], colorIndex: number) {
    const colorToUse = colors[colorIndex] || colors[colorIndex % colors.length] || '#8B5CF6';
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
  }

  // Función auxiliar para animar el modelo
  function animateModel(fbx: any, renderer: any, scene: any, camera: any) {
    const animate = () => {
      requestAnimationFrame(animate);
      fbx.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
      fbx.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
      fbx.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
      renderer.render(scene, camera);
    };
    animate();
  }

  // Refactorización de createBasicScene
  const createBasicScene = (THREE: any, FBXLoader: any, RGBELoader: any) => {
    try {
      if (!containerRef.current) return;
      const containerSize = containerRef.current.getBoundingClientRect();
      const width = containerSize.width || 300;
      const height = containerSize.height || 300;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      cameraRef.current = camera; // Guardar referencia a la cámara
      const renderer = setupRenderer(THREE, containerRef.current, width, height);
      rendererRef.current = renderer; // Guardar referencia al renderer
      camera.position.set(0, 0, 2.5);
      camera.lookAt(0, 0, 0);
      loadEnvironment(RGBELoader, THREE, scene);
      addLights(THREE, scene);
      const normalTexture = loadNormalTexture(THREE, normalTextureRef);
      const loader = new FBXLoader();
      loader.load(
        '/models/SmolModel.fbx',
        (fbx: any) => {
          centerAndScaleModel(THREE, fbx);
          applyMaterials(THREE, fbx, normalTexture, colors);
          scene.add(fbx);
          modelRef.current = fbx;
          animateModel(fbx, renderer, scene, camera);
          setLoading(false);
        },
        undefined,
        () => {
          setLoading(false);
        }
      );
    } catch {
      setLoading(false);
    }
  };

  return (
    <div 
      className="three-canvas-container relative aspect-square flex items-center justify-center w-full h-full" 
      style={{ 
        backgroundColor: "transparent",
        background: "transparent",
        backgroundImage: "none",
        backgroundClip: "border-box",
        backgroundOrigin: "border-box"
      }}
    >
      {loading && (
        <div className="absolute z-10 flex items-center justify-center w-full h-full bg-transparent">
          <LoadingSpinner />
        </div>
      )}
      <div 
        ref={containerRef} 
        className="three-canvas-container w-full h-full absolute inset-0"
        style={{ 
          width: "100%",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          backgroundColor: "transparent",
          background: "transparent",
          backgroundImage: "none",
          overflow: "hidden"
        }}
      ></div>
    </div>
  );
};

export default RotatingModel;