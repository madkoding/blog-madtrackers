'use client';

import OptimizedImage from './OptimizedImage';

interface BlogImageProps {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  readonly priority?: boolean;
  readonly caption?: string;
}

export default function BlogImage({
  src,
  alt,
  width = 800,
  height = 450,
  className = '',
  priority = false,
  caption,
}: BlogImageProps) {
  return (
    <figure className={`my-6 ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg shadow-lg w-full h-auto"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        quality={90}
      />
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
