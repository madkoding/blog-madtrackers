import React, { useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";

export interface Point {
  x: number;
  y: number;
}

export interface ImageWithPointsProps {
  selectedQuantity: number;
  points?: { [key: number]: Point[] };
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
}

const ImageWithPoints: React.FC<ImageWithPointsProps> = React.memo(({
  selectedQuantity,
  points = {},
  imageUrl = "/assets/human_body_female.svg",
  imageAlt = "Body",
  imageWidth = 500,
  imageHeight = 200,
  className = ""
}) => {
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const selectedPoints = useMemo(() => points[selectedQuantity] ?? [], [selectedQuantity, points]);

  // Escala los puntos según el tamaño actual de la imagen
  const scalePoints = useCallback((point: Point) => {
    const scaledX = (point.x / imageWidth) * imageSize.width;
    const scaledY = (point.y / imageHeight) * imageSize.height;
    return { scaledX, scaledY };
  }, [imageSize.width, imageSize.height, imageWidth, imageHeight]);

  // Recalcular el tamaño de la imagen cuando se redimensione
  const updateImageSize = useCallback(() => {
    if (imgRef.current) {
      const imgWidth = imgRef.current.clientWidth;
      const imgHeight = imgRef.current.clientHeight;
      setImageSize({ width: imgWidth, height: imgHeight });
    }
  }, []);

  const scaledPoints = useMemo(() => 
    selectedPoints.map((point, index) => {
      const { scaledX, scaledY } = scalePoints(point);
      return { scaledX, scaledY, index };
    }), [selectedPoints, scalePoints]);

  useLayoutEffect(() => {
    // Inicializamos el tamaño de la imagen cuando se carga
    updateImageSize();

    // Configuramos el evento resize para ajustar los puntos si la ventana cambia
    window.addEventListener("resize", updateImageSize);

    // Limpiamos el evento cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", updateImageSize);
    };
  }, [updateImageSize]);

  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      <Image
        ref={imgRef}
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-auto"
        onLoad={updateImageSize}
        width={imageWidth}
        height={imageHeight}
        priority
      />

      {/* Puntos sobre la imagen */}
      <svg className="absolute top-0 left-0 w-full h-full">
        {scaledPoints.map(({ scaledX, scaledY, index }) => (
          <circle
            key={`points-${  index}`}
            cx={scaledX}
            cy={scaledY}
            r="7"
            fill="white"
            stroke="orange"
            strokeWidth="3"
          />
        ))}
      </svg>
    </div>
  );
});

ImageWithPoints.displayName = 'ImageWithPoints';

export { ImageWithPoints };
