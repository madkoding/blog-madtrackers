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
  // Referencias tipadas a Three.js
  const modelRef = useRef<import('three').Group | null>(null);
  const normalTextureRef = useRef<import('three').Texture | null>(null);
  const rendererRef = useRef<import('three').WebGLRenderer | null>(null);
  const cameraRef = useRef<import('three').PerspectiveCamera | null>(null);
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

  // Tipar argumentos y variables en funciones internas
  const updateModelColors = async (
    fbx: import('three').Group,
    normalTexture: import('three').Texture,
    newColors: string[]
  ) => {
    const THREE = await import('three');
    let materialIndex = 0;
    fbx.traverse((child: import('three').Object3D) => {
      if ((child as import('three').Mesh).isMesh && (child as import('three').Mesh).material) {
        const mesh = child as import('three').Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat, index: number) => {
            const material = mat as import('three').MeshStandardMaterial;
            const globalMaterialIndex = materialIndex + index;
            const colorToUse = newColors[globalMaterialIndex] || newColors[globalMaterialIndex % newColors.length] || '#8B5CF6';
            material.color = new THREE.Color(colorToUse);
            material.metalness = FBX_MODEL_METALNESS_MAIN;
            material.roughness = FBX_MODEL_ROUGHNESS_MAIN;
            material.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
            if (material.normalScale) {
              material.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
            }
            material.needsUpdate = true;
          });
          materialIndex += mesh.material.length;
        } else {
          const material = mesh.material as import('three').MeshStandardMaterial;
          const colorToUse = newColors[materialIndex] || newColors[materialIndex % newColors.length] || '#8B5CF6';
          material.color = new THREE.Color(colorToUse);
          material.metalness = FBX_MODEL_METALNESS_MAIN;
          material.roughness = FBX_MODEL_ROUGHNESS_MAIN;
          material.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
          if (material.normalScale) {
            material.normalScale.copy(FBX_MODEL_NORMAL_SCALE);
          }
          material.needsUpdate = true;
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
  function setupRenderer(
    THREE: typeof import('three'),
    container: HTMLDivElement,
    width: number,
    height: number
  ): import('three').WebGLRenderer {
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
    // @ts-expect-error: propiedad experimental en Three.js
    renderer.physicallyCorrectLights = true;
    renderer.domElement.style.backgroundColor = 'transparent';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    return renderer;
  }

  // Función auxiliar para cargar el entorno HDR
  function loadEnvironment(
    RGBELoader: new () => { load: (url: string, onLoad: (texture: import('three').Texture) => void) => void },
    THREE: typeof import('three'),
    scene: import('three').Scene
  ) {
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/assets/env.hdr', (texture: import('three').Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      // Las siguientes líneas pueden eliminarse si las propiedades no existen en la versión actual de Three.js
      // scene.backgroundIntensity = 0;
      // scene.environmentIntensity = 1.5;
    });
  }

  // Función auxiliar para añadir luces
  function addLights(
    THREE: typeof import('three'),
    scene: import('three').Scene
  ) {
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
  function loadNormalTexture(
    THREE: typeof import('three'),
    normalTextureRef: React.MutableRefObject<import('three').Texture | null>
  ): import('three').Texture {
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
  function centerAndScaleModel(
    THREE: typeof import('three'),
    fbx: import('three').Group
  ) {
    const box = new THREE.Box3().setFromObject(fbx);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    fbx.scale.setScalar(scale);
    fbx.traverse((child: import('three').Object3D) => {
      if ((child as import('three').Mesh).isMesh || child.isObject3D) {
        child.position.sub(center);
      }
    });
    fbx.position.set(0, 0, 0);
    fbx.castShadow = true;
    fbx.receiveShadow = true;
  }

  // Refactorización de applyMaterials para reducir complejidad
  function applyMaterials(
    THREE: typeof import('three'),
    fbx: import('three').Group,
    normalTexture: import('three').Texture,
    colors: string[]
  ) {
    let materialIndex = 0;
    fbx.traverse((child: import('three').Object3D) => {
      if ((child as import('three').Mesh).isMesh) {
        const mesh = child as import('three').Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((mat, index: number) => {
              return createMaterialFrom(mat, THREE, normalTexture, colors, materialIndex + index);
            });
            materialIndex += mesh.material.length;
          } else {
            mesh.material = createMaterialFrom(mesh.material, THREE, normalTexture, colors, materialIndex);
            materialIndex++;
          }
        }
      }
    });
  }

  function createMaterialFrom(
    mat: import('three').Material,
    THREE: typeof import('three'),
    normalTexture: import('three').Texture,
    colors: string[],
    colorIndex: number
  ): import('three').MeshStandardMaterial {
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
    const matStd = mat as import('three').MeshStandardMaterial;
    if (matStd.map) newMat.map = matStd.map;
    if (matStd.normalMap) newMat.normalMap = matStd.normalMap;
    if (mat.transparent !== undefined) newMat.transparent = mat.transparent;
    if (mat.opacity !== undefined) newMat.opacity = mat.opacity;
    return newMat;
  }

  // Función auxiliar para animar el modelo
  function animateModel(
    fbx: import('three').Group,
    renderer: import('three').WebGLRenderer,
    scene: import('three').Scene,
    camera: import('three').PerspectiveCamera
  ) {
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
  const createBasicScene = (
    THREE: typeof import('three'),
    FBXLoader: new () => { load: (url: string, onLoad: (fbx: import('three').Group) => void, onProgress?: (event: ProgressEvent<EventTarget>) => void, onError?: (event: unknown) => void) => void },
    RGBELoader: new () => { load: (url: string, onLoad: (texture: import('three').Texture) => void) => void }
  ) => {
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
        (fbx: import('three').Group) => {
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