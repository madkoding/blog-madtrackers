"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
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

const isMobile = () => typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const getOptimalPixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  const mobile = isMobile();
  const deviceRatio = window.devicePixelRatio || 1;
  // Valores razonables: 1 para móviles, 1.5 para desktop (balance calidad/rendimiento)
  return mobile ? Math.min(deviceRatio, 1) : Math.min(deviceRatio, 1.5);
};

const RotatingModel: React.FC<RotatingModelProps> = ({ colors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneDataRef = useRef<{
    model: import('three').Group | null;
    renderer: import('three').WebGLRenderer | null;
    camera: import('three').PerspectiveCamera | null;
    controls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls | null;
    scene: import('three').Scene | null;
    normalTexture: import('three').Texture | null;
    animationId: number | null;
  }>({
    model: null,
    renderer: null,
    camera: null,
    controls: null,
    scene: null,
    normalTexture: null,
    animationId: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isUserInteractingRef = useRef(false);
  
  // Ref para almacenar THREE.js una vez cargado
  const threeRef = useRef<typeof import('three') | null>(null);
  
  // Ref para los colores actuales (para acceder desde closures)
  const colorsRef = useRef(colors);
  
  // Actualizar ref cuando cambien los colores
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const updateModelColors = useCallback((newColors: string[], THREE: typeof import('three')) => {
    const { model } = sceneDataRef.current;
    if (!model || !THREE) return;

    let materialIndex = 0;
    model.traverse((child) => {
      const mesh = child as import('three').Mesh;
      if (mesh.isMesh && mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        materials.forEach((mat, idx) => {
          const material = mat as import('three').MeshStandardMaterial;
          const colorIdx = materialIndex + idx;
          const colorToUse = newColors[colorIdx % newColors.length] || '#8B5CF6';
          
          material.color = new THREE.Color(colorToUse);
          material.metalness = FBX_MODEL_METALNESS_MAIN;
          material.roughness = FBX_MODEL_ROUGHNESS_MAIN;
          material.envMapIntensity = FBX_MODEL_ENV_INTENSITY;
          material.needsUpdate = true;
        });
        
        materialIndex += materials.length;
      }
    });
  }, []);

  const handleResize = useCallback(() => {
    const { renderer, camera } = sceneDataRef.current;
    const container = containerRef.current;

    if (!renderer || !camera || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }, []);

  useEffect(() => {
    return () => {
      const { renderer, controls, scene, normalTexture, animationId } = sceneDataRef.current;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      if (controls) {
        controls.dispose();
      }

      if (scene) {
        scene.traverse((child) => {
          const mesh = child as import('three').Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => mat.dispose());
          }
        });
      }

      if (normalTexture) {
        normalTexture.dispose();
      }

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Actualizar colores cuando cambien (sin recargar toda la escena)
  useEffect(() => {
    if (threeRef.current && sceneDataRef.current.model) {
      updateModelColors(colors, threeRef.current);
    }
  }, [colors, updateModelColors]);

  // Cargar escena SOLO UNA VEZ (sin dependencias de colors)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevenir múltiples cargas
    if (sceneDataRef.current.scene) {
      // Si la escena ya existe y el modelo está cargado, asegurar estados correctos
      if (sceneDataRef.current.model) {
        setLoading(false);
        setError(false);
      }
      return;
    }

    let mounted = true;
    const loadTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Timeout: El modelo tardó demasiado en cargar');
        setLoading(false);
        setError(true);
      }
    }, 15000);

    const testWebGL = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
                canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: false });
      return gl !== null;
    };

    if (!testWebGL()) {
      console.warn('WebGL no está disponible en este dispositivo');
      setLoading(false);
      setError(true);
      return;
    }

    const loadScene = async () => {
      try {
        const [THREE, { FBXLoader }, { RGBELoader }, { OrbitControls }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/FBXLoader.js'),
          import('three/examples/jsm/loaders/RGBELoader.js'),
          import('three/examples/jsm/controls/OrbitControls.js')
        ]);

        // Guardar referencia a THREE para reutilización
        threeRef.current = THREE;

        if (!mounted || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.offsetWidth || 300;
        const height = container.offsetHeight || 300;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 2.5);

        const mobile = isMobile();
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: !mobile,
          powerPreference: mobile ? 'low-power' : 'high-performance',
          failIfMajorPerformanceCaveat: false
        });

        renderer.setSize(width, height, false);
        renderer.setPixelRatio(getOptimalPixelRatio());
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = false;

        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        renderer.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          console.warn('Contexto WebGL perdido');
          if (mounted) setError(true);
        }, false);

        const rgbeLoader = new RGBELoader();
        rgbeLoader.load('/assets/env_64x32.hdr', (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture;
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(2, 2, 2);
        scene.add(directionalLight);

        const textureLoader = new THREE.TextureLoader();
        const normalTexture = textureLoader.load('/assets/noise-normal.webp');
        normalTexture.wrapS = THREE.RepeatWrapping;
        normalTexture.wrapT = THREE.RepeatWrapping;
        normalTexture.repeat.set(FBX_MODEL_NORMAL_REPEAT, FBX_MODEL_NORMAL_REPEAT);
        normalTexture.flipY = false;
        
        if (renderer.capabilities?.getMaxAnisotropy) {
          const maxAniso = renderer.capabilities.getMaxAnisotropy();
          normalTexture.anisotropy = Math.min(maxAniso, mobile ? 2 : 4);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.minDistance = 1.5;
        controls.maxDistance = 5;

        controls.addEventListener('start', () => {
          isUserInteractingRef.current = true;
        });

        controls.addEventListener('end', () => {
          isUserInteractingRef.current = false;
        });

        sceneDataRef.current.scene = scene;
        sceneDataRef.current.camera = camera;
        sceneDataRef.current.renderer = renderer;
        sceneDataRef.current.controls = controls;
        sceneDataRef.current.normalTexture = normalTexture;

        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          '/models/SmolModel.fbx',
          (fbx) => {
            if (!mounted) return;

            // Primero calculamos el bounding box del modelo original
            const box = new THREE.Box3().setFromObject(fbx);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = (2 / maxDim);

            // Escalamos el modelo
            fbx.scale.setScalar(scale);
            
            // Combinar centrado y aplicación de materiales en un solo traverse
            let materialIndex = 0;
            fbx.traverse((child) => {
              // Centrar todos los objetos respecto al centro geométrico
              // Esto asegura que el modelo rote sobre su propio centro
              if (child.isObject3D) {
                child.position.sub(center);
              }
              
              // Aplicar materiales a los meshes
              const mesh = child as import('three').Mesh;
              if (mesh.isMesh && mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                const currentColors = colorsRef.current;
                
                const newMaterials = materials.map((mat, idx) => {
                  const colorIdx = materialIndex + idx;
                  const colorToUse = currentColors[colorIdx % currentColors.length] || '#8B5CF6';
                  
                  return new THREE.MeshStandardMaterial({
                    color: new THREE.Color(colorToUse),
                    metalness: FBX_MODEL_METALNESS_MAIN,
                    roughness: FBX_MODEL_ROUGHNESS_MAIN,
                    normalMap: normalTexture,
                    normalScale: FBX_MODEL_NORMAL_SCALE,
                    envMapIntensity: FBX_MODEL_ENV_INTENSITY,
                    side: THREE.DoubleSide
                  });
                });

                mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
                materialIndex += materials.length;
              }
            });
            
            // Posicionamos el grupo completo en el origen
            fbx.position.set(0, 0, 0);
            
            // Rotar 90 grados a la derecha (en el eje Z)
            // 90 grados = Math.PI / 2 radianes
            fbx.rotation.z = (Math.PI / 2) * -1;

            scene.add(fbx);
            sceneDataRef.current.model = fbx;

            const animate = () => {
              const animationId = requestAnimationFrame(animate);
              sceneDataRef.current.animationId = animationId;

              if (!isUserInteractingRef.current && fbx) {
                fbx.rotation.x += FBX_MODEL_ROTATION_SPEED_X;
                fbx.rotation.y += FBX_MODEL_ROTATION_SPEED_Y;
                fbx.rotation.z += FBX_MODEL_ROTATION_SPEED_Z;
              }

              controls.update();
              renderer.render(scene, camera);
            };
            animate();

            setLoading(false);
            setError(false); // Asegurar que error sea false
          },
          undefined,
          (error) => {
            console.error('Error cargando modelo FBX:', error);
            if (mounted) {
              setLoading(false);
              setError(true);
            }
          }
        );
      } catch (error) {
        console.error('Error inicializando Three.js:', error);
        if (mounted) {
          setLoading(false);
          setError(true);
        }
      }
    };

    loadScene();

    return () => {
      mounted = false;
      clearTimeout(loadTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // SOLO cargar UNA VEZ, no depender de colors

  return (
    <div
      className="three-canvas-container relative aspect-square flex items-center justify-center w-full h-full"
      style={{
        backgroundColor: "transparent",
        background: "transparent"
      }}
    >
      {loading && !error && !sceneDataRef.current.model && (
        <div className="absolute z-10 flex items-center justify-center w-full h-full bg-transparent">
          <LoadingSpinner />
        </div>
      )}
      {error && !sceneDataRef.current.model && (
        <div className="absolute z-10 flex items-center justify-center w-full h-full bg-transparent px-4">
          <div className="text-center">
            <div className="text-4xl mb-3">🎮</div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Modelo 3D no disponible en este dispositivo
            </p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="three-canvas-container w-full h-full absolute inset-0"
        style={{
          backgroundColor: "transparent",
          overflow: "hidden"
        }}
      />
    </div>
  );
};

export default RotatingModel;
