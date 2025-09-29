"use client";

import { useEffect, useRef } from "react";

const SkyDomeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelRatioStateRef = useRef({
    base: 0.5,
    current: 0.5,
    min: 0.25,
    max: 0.5,
    lastAdjust: 0
  });

  useEffect(() => {
    let mounted = true;
    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let wireframe: import("three").LineSegments<import("three").WireframeGeometry, import("three").LineBasicMaterial> | null = null;
    let glowSphere: import("three").Mesh<import("three").SphereGeometry, import("three").MeshBasicMaterial> | null = null;
    let starField: import("three").Points<import("three").BufferGeometry, import("three").PointsMaterial> | null = null;
    const frameSamples: number[] = [];
    const sampleSize = 60;
    let lastFrameTime = typeof performance !== "undefined" ? performance.now() : Date.now();

    const cleanup = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.parentNode?.removeChild(renderer.domElement);
      }
      if (wireframe) {
        wireframe.geometry.dispose();
        wireframe.material.dispose();
      }
      if (glowSphere) {
        glowSphere.geometry.dispose();
        glowSphere.material.dispose();
      }
      if (starField) {
        starField.geometry.dispose();
        starField.material.dispose();
      }
    };

    function applyRendererPixelRatio(
      instance: import("three").WebGLRenderer,
      ratio: number,
      options?: { width?: number; height?: number }
    ) {
      const safeRatio = Math.max(ratio, 0.1);
      instance.setPixelRatio(safeRatio);
      const container = containerRef.current;
      const canvas = instance.domElement;
      let targetWidth = options?.width;
      let targetHeight = options?.height;

      if (!targetWidth || !targetHeight) {
        if (container) {
          targetWidth = targetWidth || container.clientWidth || container.offsetWidth || canvas.clientWidth || canvas.width;
          targetHeight = targetHeight || container.clientHeight || container.offsetHeight || canvas.clientHeight || canvas.height;
        }
      }

      if (!targetWidth || !targetHeight) {
        targetWidth = targetWidth || canvas.clientWidth || canvas.width || 1;
        targetHeight = targetHeight || canvas.clientHeight || canvas.height || 1;
      }

      instance.setSize(targetWidth, targetHeight, false);
      instance.domElement.style.width = "100%";
      instance.domElement.style.height = "100%";
    }

    function updateRendererPixelRatio(
      instance: import("three").WebGLRenderer,
      ratio: number,
      options?: { width?: number; height?: number; force?: boolean }
    ) {
      const state = pixelRatioStateRef.current;
      const clampedRatio = Math.min(state.max, Math.max(state.min, ratio));
      const shouldSkip = !options?.force && Math.abs(clampedRatio - state.current) < 0.02;
      if (shouldSkip) {
        return;
      }
      applyRendererPixelRatio(instance, clampedRatio, options);
      state.current = clampedRatio;
      state.lastAdjust = typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    function evaluateFramePerformance(delta: number, instance: import("three").WebGLRenderer) {
      if (!Number.isFinite(delta) || delta <= 0) {
        return;
      }

      const fps = 1000 / delta;
      const state = pixelRatioStateRef.current;
      if (frameSamples.length >= sampleSize) {
        frameSamples.shift();
      }
      frameSamples.push(fps);

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (frameSamples.length < sampleSize || now - state.lastAdjust <= 1000) {
        return;
      }

      const averageFps = frameSamples.reduce((acc, value) => acc + value, 0) / frameSamples.length;
      const lowFpsFrames = frameSamples.filter((value) => value < 30).length;
      const highFpsFrames = frameSamples.filter((value) => value > 55).length;

      if ((averageFps < 30 || lowFpsFrames > sampleSize * 0.3) && state.current - state.min > 0.01) {
        const reductionStep = Math.max(state.current * 0.15, 0.05);
        updateRendererPixelRatio(instance, state.current - reductionStep);
        frameSamples.length = 0;
      } else if (averageFps > 45 && highFpsFrames > sampleSize * 0.6 && state.current < state.max - 0.01) {
        const increaseStep = Math.max(state.current * 0.1, 0.05);
        updateRendererPixelRatio(instance, state.current + increaseStep);
        frameSamples.length = 0;
      }
    }

    const init = async () => {
      if (!containerRef.current) return;

      const THREE = await import("three");
      if (!mounted || !containerRef.current) return;

      const container = containerRef.current;
      const { clientWidth: width, clientHeight: height } = container;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, width / height || 1, 0.1, 200);
      camera.position.set(0, 0, 28);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      const deviceRatio = Math.max(window.devicePixelRatio, 1);
      const state = pixelRatioStateRef.current;
      state.base = deviceRatio;
      state.max = deviceRatio;
      state.min = Math.max(deviceRatio * 0.4, 0.2);
      state.current = deviceRatio;
      state.lastAdjust = typeof performance !== "undefined" ? performance.now() : Date.now();
      updateRendererPixelRatio(renderer, deviceRatio, { width, height, force: true });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0";
      renderer.domElement.style.left = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.pointerEvents = "none";

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const clock = new THREE.Clock();

      // Dome wireframe
      const sphereGeometry = new THREE.SphereGeometry(30, 64, 64);
      const wireframeGeometry = new THREE.WireframeGeometry(sphereGeometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("#3bf0ff"),
        transparent: true,
        opacity: 0.25
      });
      wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      wireframe.rotation.x = -0.2;
      scene.add(wireframe);

      // Inner glow sphere
      const glowGeometry = new THREE.SphereGeometry(18, 48, 48);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0b1120"),
        transparent: true,
        opacity: 0.08
      });
      glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowSphere);

      // Star field / particles
      const starCount = 600;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const radius = 10 + Math.random() * 16;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = radius * Math.cos(phi);
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: new THREE.Color("#38bdf8"),
        size: 0.25,
        transparent: true,
        opacity: 0.45
      });
      starField = new THREE.Points(starGeometry, starMaterial);
      scene.add(starField);

      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const { clientWidth, clientHeight } = containerRef.current;
        updateRendererPixelRatio(renderer, pixelRatioStateRef.current.current, {
          width: clientWidth,
          height: clientHeight,
          force: true
        });
        camera.aspect = (clientWidth || 1) / (clientHeight || 1);
        camera.updateProjectionMatrix();
      };

      if ("ResizeObserver" in window) {
        resizeObserver = new window.ResizeObserver(handleResize);
        resizeObserver.observe(container);
      }

      const animate = () => {
        if (!mounted || !renderer || !scene || !camera) return;
        const currentTime = typeof performance !== "undefined" ? performance.now() : Date.now();
        const delta = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        evaluateFramePerformance(delta, renderer);
        const elapsed = clock.getElapsedTime();

        if (wireframe) {
          wireframe.rotation.y = elapsed * 0.12;
          wireframe.rotation.x = -0.2 + Math.sin(elapsed * 0.2) * 0.05;
        }

        if (glowSphere) {
          const scale = 1 + Math.sin(elapsed * 0.45) * 0.06;
          glowSphere.scale.setScalar(scale);
          glowSphere.material.opacity = 0.06 + 0.04 * (1 + Math.sin(elapsed * 0.6)) * 0.5;
        }

        if (starField) {
          starField.rotation.y = elapsed * 0.05;
          starField.rotation.x = Math.sin(elapsed * 0.15) * 0.08;
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      handleResize();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    init();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 opacity-100"
      style={{ filter: "saturate(120%)" }}
      aria-hidden="true"
    />
  );
};

export default SkyDomeBackground;
