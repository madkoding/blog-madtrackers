"use client";

import { useLang } from "../../lang-context";
import { useRef, useEffect, useState } from "react";

const ShippingCountries = () => {
  const { lang } = useLang();
  const carouselRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTransform, setCurrentTransform] = useState(0);

  // Auto-scroll animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && carouselRef.current) {
        setCurrentTransform(prev => {
          const newValue = prev - 1;
          const maxScroll = carouselRef.current!.scrollWidth / 2;
          return Math.abs(newValue) >= maxScroll ? 0 : newValue;
        });
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isDragging]);

  // Apply transform
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${currentTransform}px)`;
    }
  }, [currentTransform]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - currentTransform);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - startX;
    setCurrentTransform(newX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - currentTransform);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.touches[0].clientX - startX;
    setCurrentTransform(newX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const countries = [
    // Países hispanohablantes
    { name: "España", flag: "🇪🇸", shipping: "ups" },
    { name: "México", flag: "🇲🇽", shipping: "ups" },
    { name: "Argentina", flag: "🇦🇷", shipping: "ups" },
    { name: "Colombia", flag: "🇨🇴", shipping: "ups" },
    { name: "Perú", flag: "🇵🇪", shipping: "ups" },
    { name: "Venezuela", flag: "🇻🇪", shipping: "ups" },
    { name: "Ecuador", flag: "🇪🇨", shipping: "ups" },
    { name: "Guatemala", flag: "🇬🇹", shipping: "ups" },
    { name: "Bolivia", flag: "🇧🇴", shipping: "ups" },
    // Chile - envío gratis
    { name: "Chile", flag: "🇨🇱", shipping: "free" },
    { name: "República Dominicana", flag: "🇩🇴", shipping: "ups" },
    { name: "Honduras", flag: "🇭🇳", shipping: "ups" },
    { name: "Paraguay", flag: "🇵🇾", shipping: "ups" },
    { name: "Nicaragua", flag: "🇳🇮", shipping: "ups" },
    { name: "El Salvador", flag: "🇸🇻", shipping: "ups" },
    { name: "Costa Rica", flag: "🇨🇷", shipping: "ups" },
    { name: "Panamá", flag: "🇵🇦", shipping: "ups" },
    { name: "Uruguay", flag: "🇺🇾", shipping: "ups" },
    { name: "Guinea Ecuatorial", flag: "🇬🇶", shipping: "ups" },
    // Países adicionales
    { name: "Estados Unidos", flag: "🇺🇸", shipping: "ups" },
    { name: "Francia", flag: "🇫🇷", shipping: "ups" },
    { name: "Italia", flag: "🇮🇹", shipping: "ups" },
    { name: "Canadá", flag: "🇨🇦", shipping: "ups" },
    { name: "Brasil", flag: "🇧🇷", shipping: "ups" },
  ];

  return (
    <div className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Títulos de envío */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
            {/* Envío gratis Chile */}
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <span className="text-green-700 font-semibold">
                {lang === 'es' ? 'Envío GRATIS Chile' : 'FREE Shipping Chile'}
              </span>
            </div>

            {/* Envío internacional */}
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <span className="text-blue-700 font-semibold">
                {lang === 'es' ? 'Internacional vía UPS' : 'International via UPS'}
              </span>
            </div>
          </div>

          {/* Carrusel infinito de banderas */}
          <section 
            className="relative overflow-hidden rounded-lg"
            aria-label={lang === 'es' ? 'Carrusel de países con envío disponible' : 'Carousel of countries with shipping available'}
          >
            <button
              ref={carouselRef}
              className="flex select-none cursor-grab w-full border-0 p-0 bg-transparent"
              aria-label={lang === 'es' ? 'Carrusel interactivo de países. Use las flechas del teclado o arrastre para navegar' : 'Interactive countries carousel. Use arrow keys or drag to navigate'}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  setCurrentTransform(prev => prev + 50);
                } else if (e.key === 'ArrowRight') {
                  setCurrentTransform(prev => prev - 50);
                }
              }}
              style={{ 
                userSelect: 'none',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none' // Previene el scroll nativo en móviles
              }}
            >
              {/* Primera copia de países */}
              {countries.map((country) => (
								<div
									key={`first-${country.name}`}
									className={`flex flex-col items-center rounded-lg mx-2 sm:mx-3 min-w-[120px] sm:min-w-[160px] ${
									country.shipping === "free" 
										? "bg-green-50" 
										: "bg-gray-50"
									}`}
								>
									<div className="text-6xl sm:text-8xl mb-1 sm:mb-2">
									{country.flag}
									</div>
									<p className="text-xs sm:text-sm text-center font-medium text-gray-700 whitespace-nowrap px-1 mb-0">
										{country.name}
									</p>
									{country.shipping === "free" && (
										<span className="text-xs sm:text-sm text-green-600 font-bold mt-0.5 sm:mt-1">
											{lang === 'es' ? 'ENVIO GRATIS' : 'FREE SHIPPING'}
										</span>
									)}
								</div>
              ))}
              {/* Segunda copia para efecto infinito */}
              {countries.map((country) => (
                <div
                  key={`second-${country.name}`}
                  className={`flex flex-col items-center rounded-lg mx-2 sm:mx-3 min-w-[120px] sm:min-w-[160px] ${
                    country.shipping === "free" 
                      ? "bg-green-50" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className="text-6xl sm:text-8xl mb-1 sm:mb-2">
                    {country.flag}
                  </div>
                  <p className="text-xs sm:text-sm text-center font-medium text-gray-700 whitespace-nowrap px-1">
                    {country.name}
                  </p>
                  {country.shipping === "free" && (
                    <span className="text-xs sm:text-sm text-green-600 font-bold mt-1 sm:mt-2">
                      {lang === 'es' ? 'GRATIS' : 'FREE'}
                    </span>
                  )}
                </div>
              ))}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingCountries;
