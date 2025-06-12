import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  useWebPSupport?: boolean;
  getOptimizedImageSrc?: (src: string, isWebPSupported: boolean) => string;
  preloadImage?: (src: string) => Promise<void>;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  fill = false,
  quality = 85,
  useWebPSupport = null,
  getOptimizedImageSrc,
  preloadImage
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (useWebPSupport === null || !getOptimizedImageSrc || !preloadImage) {
      setImageSrc(src);
      setImageLoaded(true);
      return;
    }

    const optimizedSrc = getOptimizedImageSrc(src, useWebPSupport);
    
    // If we're trying WebP, check if it exists first
    if (useWebPSupport && optimizedSrc !== src) {
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
  }, [src, useWebPSupport, getOptimizedImageSrc, preloadImage]);

  // Show loading placeholder
  if (!imageLoaded) {
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
};

export { OptimizedImage };
