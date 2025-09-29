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
  const controlsRef = useRef<import('three/examples/jsm/controls/OrbitControls.js').OrbitControls | null>(null);
  const [loading, setLoading] = React.useState(true);
  const isUserInteractingRef = useRef(false);
  const pixelRatioStateRef = useRef({
    base: 0.5,
    current: 0.5,
    min: 0.25,
    max: 0.5,
    lastAdjust: 0
  });

  const applyRendererPixelRatio = React.useCallback((
    renderer: import('three').WebGLRenderer,
    ratio: number,
    options?: { width?: number; height?: number }
  ) => {
    const safeRatio = Math.max(ratio, 0.1);
    renderer.setPixelRatio(safeRatio);
    const container = containerRef.current;
    const canvas = renderer.domElement;
    let targetWidth = options?.width;
    let targetHeight = options?.height;

    if (!targetWidth || !targetHeight) {
      if (container) {
        targetWidth = targetWidth || container.offsetWidth || container.clientWidth;
        targetHeight = targetHeight || container.offsetHeight || container.clientHeight;
      }
    }

    if (!targetWidth || !targetHeight) {
      targetWidth = targetWidth || canvas.clientWidth || canvas.width || 1;
      targetHeight = targetHeight || canvas.clientHeight || canvas.height || 1;
    }

    renderer.setSize(targetWidth, targetHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
  }, []);

  const updateRendererPixelRatio = React.useCallback((
    renderer: import('three').WebGLRenderer,
    ratio: number,
    options?: { width?: number; height?: number; force?: boolean }
  ) => {
    const state = pixelRatioStateRef.current;
    const clampedRatio = Math.min(state.max, Math.max(state.min, ratio));
    const shouldSkip = !options?.force && Math.abs(clampedRatio - state.current) < 0.02;
    if (shouldSkip) {
      return;
    }
    applyRendererPixelRatio(renderer, clampedRatio, options);
    state.current = clampedRatio;
    state.lastAdjust = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }, [applyRendererPixelRatio]);

  // ResizeObserver para ajustar el renderer y la cámara
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        rendererRef.current.setSize(width, height, false);
        const deviceRatio = Math.max(window.devicePixelRatio * 0.35, 0.35);
        const state = pixelRatioStateRef.current;
        if (Math.abs(deviceRatio - state.base) > 0.05) {
          state.base = deviceRatio;
          state.max = deviceRatio;
          state.min = Math.max(deviceRatio * 0.4, 0.25);
          if (state.current > state.max) {
            state.current = state.max;
          }
        }
        const targetRatio = Math.min(state.max, Math.max(state.min, state.current));
        updateRendererPixelRatio(rendererRef.current, targetRatio, { width, height, force: true });
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    // Llamar al menos una vez al montar
    handleResize();
    const resizeObserver = new window.ResizeObserver(handleResize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateRendererPixelRatio]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      testThreeJS();
    }
    
    // Cleanup function para limpiar los controles al desmontar
    return () => {
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
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
      const [THREE, { FBXLoader }, { RGBELoader }, { OrbitControls }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/FBXLoader.js'),
        import('three/examples/jsm/loaders/RGBELoader.js'),
        import('three/examples/jsm/controls/OrbitControls.js')
      ]);
      createBasicScene(THREE, FBXLoader, RGBELoader, OrbitControls);
    } catch {
      // error silencioso
    }
  };

  function evaluateFramePerformance(
    delta: number,
    renderer: import('three').WebGLRenderer,
    frameSamples: number[],
    sampleSize: number
  ) {
    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }

    const fps = 1000 / delta;
    const state = pixelRatioStateRef.current;
    if (frameSamples.length >= sampleSize) {
      frameSamples.shift();
    }
    frameSamples.push(fps);

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (frameSamples.length < sampleSize || now - state.lastAdjust <= 1000) {
      return;
    }

    const averageFps = frameSamples.reduce((acc, value) => acc + value, 0) / frameSamples.length;
    const lowFpsFrames = frameSamples.filter((value) => value < 30).length;
    const highFpsFrames = frameSamples.filter((value) => value > 55).length;

    if ((averageFps < 30 || lowFpsFrames > sampleSize * 0.3) && state.current - state.min > 0.01) {
      const reductionStep = Math.max(state.current * 0.15, 0.05);
      updateRendererPixelRatio(renderer, state.current - reductionStep);
      frameSamples.length = 0;
    } else if (averageFps > 45 && highFpsFrames > sampleSize * 0.6 && state.current < state.max - 0.01) {
      const increaseStep = Math.max(state.current * 0.1, 0.05);
      updateRendererPixelRatio(renderer, state.current + increaseStep);
      frameSamples.length = 0;
    }
  }

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
    const deviceRatio = Math.max(window.devicePixelRatio, 1);
    const state = pixelRatioStateRef.current;
    state.base = deviceRatio;
    state.max = deviceRatio;
    state.min = Math.max(deviceRatio * 0.4, 0.25);
    state.current = deviceRatio;
    state.lastAdjust = typeof performance !== 'undefined' ? performance.now() : Date.now();
    updateRendererPixelRatio(renderer, deviceRatio, { width, height, force: true });
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
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
    directionalLight.castShadow = false;
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

  // Función auxiliar para configurar los controles de órbita
  function setupOrbitControls(
    OrbitControls: new (camera: import('three').Camera, domElement: HTMLElement) => import('three/examples/jsm/controls/OrbitControls.js').OrbitControls,
    camera: import('three').PerspectiveCamera,
    renderer: import('three').WebGLRenderer
  ): import('three/examples/jsm/controls/OrbitControls.js').OrbitControls {
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Configuración de los controles
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    
    // Eventos para detectar cuando el usuario está interactuando
    controls.addEventListener('start', () => {
      isUserInteractingRef.current = true;
    });
    
    controls.addEventListener('end', () => {
      isUserInteractingRef.current = false;
    });
    
    return controls;
  }

  // Función auxiliar para animar el modelo
  function animateModel(
    fbx: import('three').Group,
    renderer: import('three').WebGLRenderer,
    scene: import('three').Scene,
    camera: import('three').PerspectiveCamera,
    isUserInteractingRef: React.MutableRefObject<boolean>,
    controls?: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
  ) {
    let lastFrameTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const frameSamples: number[] = [];
    const sampleSize = 60;

    const animate = () => {
      requestAnimationFrame(animate);
      const currentTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const delta = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      evaluateFramePerformance(delta, renderer, frameSamples, sampleSize);
      
      // Solo rotar automáticamente si el usuario no está interactuando
      if (!isUserInteractingRef.current) {
        fbx.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
        fbx.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
        fbx.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
      }
      
      // Actualizar controles si existen
      if (controls) {
        controls.update();
      }
      
      renderer.render(scene, camera);
    };
    animate();
  }

  // Refactorización de createBasicScene
  const createBasicScene = (
    THREE: typeof import('three'),
    FBXLoader: new () => { load: (url: string, onLoad: (fbx: import('three').Group) => void, onProgress?: (event: ProgressEvent<EventTarget>) => void, onError?: (event: unknown) => void) => void },
    RGBELoader: new () => { load: (url: string, onLoad: (texture: import('three').Texture) => void) => void },
    OrbitControls: new (camera: import('three').Camera, domElement: HTMLElement) => import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
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
      
      // Configurar controles de órbita
      const controls = setupOrbitControls(OrbitControls, camera, renderer);
      controlsRef.current = controls;
      
      const loader = new FBXLoader();
      loader.load(
        '/models/SmolModel.fbx',
        (fbx: import('three').Group) => {
          centerAndScaleModel(THREE, fbx);
          applyMaterials(THREE, fbx, normalTexture, colors);
          scene.add(fbx);
          modelRef.current = fbx;
          animateModel(fbx, renderer, scene, camera, isUserInteractingRef, controls);
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