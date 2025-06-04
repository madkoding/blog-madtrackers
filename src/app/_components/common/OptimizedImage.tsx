'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useWebPSupport, getOptimizedImageSrc, preloadImage } from '../../../hooks/useWebPSupport';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  fill = false,
  quality = 85,
}: Readonly<OptimizedImageProps>) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isWebPSupported = useWebPSupport();

  useEffect(() => {
    if (isWebPSupported === null) return;

    const optimizedSrc = getOptimizedImageSrc(src, isWebPSupported);
    
    // If we're trying WebP, check if it exists first
    if (isWebPSupported && optimizedSrc !== src) {
      preloadImage(optimizedSrc)
        .then(() => {
          setImageSrc(optimizedSrc);
          setImageLoaded(true);
        })
        .catch(() => {
          setImageSrc(src);
          setImageLoaded(true);
        });
    } else {
      setImageSrc(src);
      setImageLoaded(true);
    }
  }, [src, isWebPSupported]);

  // Show loading placeholder
  if (!imageLoaded || isWebPSupported === null) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
    );
  }

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    priority,
    quality,
    ...(fill && { fill: true }),
    ...(sizes && { sizes }),
    ...(!fill && width && height && { width, height }),
  };

  return <Image {...imageProps} alt={alt} />;
}
