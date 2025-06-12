'use client';

import { useState, useEffect } from 'react';

let webpSupportCache: boolean | null = null;
let webpSupportPromise: Promise<boolean> | null = null;

function detectWebPSupport(): Promise<boolean> {
  if (webpSupportCache !== null) {
    return Promise.resolve(webpSupportCache);
  }

  if (webpSupportPromise) {
    return webpSupportPromise;
  }

  webpSupportPromise = new Promise((resolve) => {
    const webp = new Image();
    webp.onload = webp.onerror = () => {
      const isSupported = webp.height === 2;
      webpSupportCache = isSupported;
      resolve(isSupported);
    };
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });

  return webpSupportPromise;
}

export function useWebPSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(webpSupportCache);

  useEffect(() => {
    if (typeof window === 'undefined') {return;}

    detectWebPSupport().then(setIsSupported);
  }, []);

  return isSupported;
}

export function getOptimizedImageSrc(originalSrc: string, webpSupported: boolean): string {
  if (!webpSupported) {return originalSrc;}
  
  // Convert common image extensions to webp
  return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}
