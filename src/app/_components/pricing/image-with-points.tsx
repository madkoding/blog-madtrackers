import React, { useState, useLayoutEffect, useRef } from "react";

type Point = { x: number; y: number };

type PointsMap = {
  [key: number]: Point[];
};

const points: PointsMap = {
  6: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
  ],
  7: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 250, y: 95 },
  ],
  8: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
  ],
  9: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 250, y: 95 },
  ],
  10: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 200, y: 65 },
    { x: 300, y: 65 },
  ],
  11: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 200, y: 65 },
    { x: 300, y: 65 },
    { x: 250, y: 95 },
  ],
  20: [
    { x: 250, y: 60 },
    { x: 250, y: 80 },
    { x: 225, y: 120 },
    { x: 275, y: 120 },
    { x: 225, y: 170 },
    { x: 275, y: 170 },
    { x: 225, y: 185 },
    { x: 275, y: 185 },
    { x: 200, y: 65 },
    { x: 300, y: 65 },

    { x: 250, y: 15 },
    { x: 250, y: 35 },
    { x: 250, y: 50 },
    { x: 250, y: 95 },
    { x: 215, y: 45 },
    { x: 285, y: 45 },
    { x: 195, y: 85 },
    { x: 305, y: 85 },
    { x: 185, y: 100 },
    { x: 315, y: 100 },
  ],
};

type ImageWithPointsProps = {
  selectedQuantity: number;
};

const ImageWithPoints: React.FC<ImageWithPointsProps> = ({
  selectedQuantity,
}) => {
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    {
      width: 0,
      height: 0,
    }
  );
  const imgRef = useRef<HTMLImageElement | null>(null);

  const selectedPoints = points[selectedQuantity] || [];

  // Escala los puntos según el tamaño actual de la imagen
  const scalePoints = (point: Point) => {
    const scaledX = (point.x / 500) * imageSize.width; // Ajusta el 500 según el ancho original
    const scaledY = (point.y / 200) * imageSize.height; // Ajusta el 200 según el alto original
    return { scaledX, scaledY };
  };

  // Recalcular el tamaño de la imagen cuando se redimensione
  const updateImageSize = () => {
    if (imgRef.current) {
      const imgWidth = imgRef.current.clientWidth;
      const imgHeight = imgRef.current.clientHeight;
      setImageSize({ width: imgWidth, height: imgHeight });
    }
  };

  useLayoutEffect(() => {
    // Inicializamos el tamaño de la imagen cuando se carga
    updateImageSize();

    // Configuramos el evento resize para ajustar los puntos si la ventana cambia
    window.addEventListener("resize", updateImageSize);

    // Limpiamos el evento cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", updateImageSize);
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Imagen SVG de fondo */}
      <img
        ref={imgRef}
        src="/assets/human_body_female.svg"
        alt="Fondo"
        className="w-full h-auto"
        onLoad={updateImageSize}
      />

      {/* Puntos sobre la imagen */}
      <svg className="absolute top-0 left-0 w-full h-full">
        {selectedPoints.map((point, index) => {
          const { scaledX, scaledY } = scalePoints(point);
          return (
            <circle
              key={index}
              cx={scaledX}
              cy={scaledY}
              r="7"
              fill="white"
              stroke="purple"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default ImageWithPoints;
