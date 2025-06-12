"use client";

import React, { useRef, useEffect, useState } from "react";
import LoadingSpinner from "./RotatingFBXModel/LoadingSpinner";

interface VanillaThreeCanvasProps {
  colors: string[];
}

// Componente de fallback
const FallbackCanvas: React.FC<{ colors: string[] }> = ({ colors }) => {
  return (
    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Modelo 3D</h3>
        <p className="text-sm text-gray-500 mb-4">Vista previa del tracker</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {colors.slice(0, 5).map((color, index) => (
            <div
              key={`color-${color}-${index}`}
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={`Color ${index + 1}: ${color}`}
            />
          ))}
          {colors.length > 5 && (
            <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xs text-gray-600">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VanillaThreeCanvas: React.FC<VanillaThreeCanvasProps> = ({ colors }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log("VanillaThreeCanvas useEffect called", { isClient: typeof window !== 'undefined' });
    
    if (typeof window !== 'undefined') {
      setIsClient(true);
      
      const timer = setTimeout(() => {
        console.log("Setting isReady to true, calling initThreeJS");
        setIsReady(true);
      }, 2000);
      
      return () => {
        console.log("Cleanup timer");
        clearTimeout(timer);
      };
    }
  }, []);

  useEffect(() => {
    if (isReady && isClient) {
      console.log("Ready to init Three.js");
      initThreeJS();
    }
  }, [isReady, isClient]);

  const initThreeJS = async () => {
    console.log("initThreeJS called", { hasMount: !!mountRef.current, hasError });
    
    if (!mountRef.current || hasError) {
      console.log("Early return from initThreeJS", { hasMount: !!mountRef.current, hasError });
      return;
    }

    try {
      console.log("Loading Three.js...");
      
      // Cargar Three.js vanilla dinámicamente
      const THREE = await import('three');
      console.log("Three.js loaded successfully");

      // Crear escena
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
      });

      console.log("Three.js objects created");

      // Configurar renderer
      const containerRect = mountRef.current.getBoundingClientRect();
      const size = Math.min(containerRect.width || 400, containerRect.height || 400, 400);
      
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      
      console.log("Appending renderer to DOM", { size });
      mountRef.current.appendChild(renderer.domElement);

      // Configurar cámara
      camera.position.set(0, 2, 5);
      camera.lookAt(0, 0, 0);

      // Añadir luces básicas
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // Crear un cubo simple en lugar del modelo FBX por ahora
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ 
        color: colors[0] || '#8B5CF6' 
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      console.log("Scene setup complete, starting animation");

      // Animación
      const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);
      console.log("Three.js initialization complete");

      // Cleanup
      return () => {
        console.log("Cleaning up Three.js");
        if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };

    } catch (error) {
      console.error("Error initializing Three.js:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Loading inicial
  if (!isClient || !isReady) {
    return (
      <div className="relative aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <LoadingSpinner />
        <span className="sr-only">Preparando modelo 3D...</span>
      </div>
    );
  }

  // Si hubo error, mostrar fallback
  if (hasError) {
    return <FallbackCanvas colors={colors} />;
  }

  return (
    <div className="relative aspect-square">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default VanillaThreeCanvas;
