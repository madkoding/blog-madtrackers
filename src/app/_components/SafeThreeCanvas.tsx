"use client";

import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

interface SafeThreeCanvasProps {
  colors: string[];
}

interface ThreeCanvasProps {
  colors: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Canvas: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Environment: React.ComponentType<any>;
  ExhibitionLights: React.ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FBXModel: React.ComponentType<any>;
}

// Función para verificar soporte WebGL
function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (error) {
    console.warn('WebGL not available:', error);
    return false;
  }
}

// Componente Three.js separado
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ colors, Canvas, Environment, ExhibitionLights, FBXModel }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-square">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        className="!w-full !h-full"
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        onCreated={() => setIsLoading(false)}
      >
        <React.Suspense fallback={null}>
          <ExhibitionLights />
          <Environment files="/assets/env_256x128.hdr" background={false} />
          <FBXModel 
            modelPath="/models/SmolModel.fbx"
            colors={colors}
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

// Componente que garantiza carga segura de Three.js
const SafeThreeCanvas: React.FC<SafeThreeCanvasProps> = ({ colors }) => {
  const [threeComponents, setThreeComponents] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Canvas: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Environment: React.ComponentType<any>;
    ExhibitionLights: React.ComponentType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FBXModel: React.ComponentType<any>;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Esperar múltiples eventos para asegurar hidratación completa
    let hydrationTimer: NodeJS.Timeout;
    
    const checkHydration = () => {
      // Verificar múltiples condiciones para asegurar que estamos del lado del cliente
      if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        document.readyState === 'complete' &&
        typeof window.requestAnimationFrame === 'function' &&
        window.navigator &&
        mountedRef.current
      ) {
        setIsHydrated(true);
      } else {
        // Reintentar después de un breve delay
        hydrationTimer = setTimeout(checkHydration, 50);
      }
    };

    // Esperar al siguiente tick y luego verificar
    const readyTimer = setTimeout(checkHydration, 200);

    return () => {
      clearTimeout(hydrationTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  // Función auxiliar para esperar a que el documento esté listo
  const waitForDocumentReady = (): Promise<void> => {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(void 0);
      } else {
        const handleLoad = () => {
          document.removeEventListener('readystatechange', handleLoad);
          resolve(void 0);
        };
        document.addEventListener('readystatechange', handleLoad);
      }
    });
  };

  // Función auxiliar para cargar los componentes de Three.js
  const loadThreeComponents = async () => {
    const [
      { Canvas },
      { Environment },
      ExhibitionLightsModule,
      FBXModelModule
    ] = await Promise.all([
      import("@react-three/fiber"),
      import("@react-three/drei"),
      import("./RotatingFBXModel/ExhibitionLights"),
      import("./RotatingFBXModel/FBXModel")
    ]);

    if (!mountedRef.current) return null;

    return {
      Canvas,
      Environment,
      ExhibitionLights: ExhibitionLightsModule.default,
      FBXModel: FBXModelModule.default
    };
  };

  // Función auxiliar para programar la carga de componentes
  const scheduleComponentLoad = (loadFunction: () => Promise<void>) => {
    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback(loadFunction, { timeout: 2000 });
    } else {
      setTimeout(loadFunction, 100);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    const initializeThreeJS = async () => {
      // Verificaciones adicionales de seguridad
      if (
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        !document.body ||
        !mountedRef.current
      ) {
        setError("Entorno no compatible");
        return;
      }

      // Verificar soporte WebGL
      if (!hasWebGLSupport()) {
        setError("WebGL no está disponible en este navegador");
        return;
      }

      // Esperar a que cualquier proceso de hidratación pendiente termine
      await waitForDocumentReady();

      // Verificar nuevamente que estamos montados después de la espera
      if (!mountedRef.current) return;

      try {
        const loadComponentsWithErrorHandling = async () => {
          const components = await loadThreeComponents();
          
          if (components && mountedRef.current) {
            setThreeComponents(components);
            setIsReady(true);
          }
        };

        scheduleComponentLoad(loadComponentsWithErrorHandling);
      } catch (error) {
        console.error("Error loading Three.js components:", error);
        if (mountedRef.current) {
          setError("Error al cargar el modelo 3D");
        }
      }
    };

    // Delay mínimo para asegurar que React ha terminado completamente
    const timer = setTimeout(() => {
      initializeThreeJS();
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [isHydrated]);

  // Estado de error
  if (error) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-600">
          <div className="text-sm">Vista previa no disponible</div>
          <div className="text-xs mt-1">Modelo 3D</div>
        </div>
      </div>
    );
  }

  // Mientras no esté listo
  if (!isReady || !threeComponents) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Cargando modelo 3D...</span>
      </div>
    );
  }

  // Renderizar el componente Three.js
  return (
    <ThreeCanvas 
      colors={colors} 
      Canvas={threeComponents.Canvas}
      Environment={threeComponents.Environment}
      ExhibitionLights={threeComponents.ExhibitionLights}
      FBXModel={threeComponents.FBXModel}
    />
  );
};

export default SafeThreeCanvas;
