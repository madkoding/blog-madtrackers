"use client";

import { useLang } from "../../lang-context";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";

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
    // Países hispanohablantes con enlaces específicos
    { name: "España", flag: "🇪🇸", shipping: "ups", link: "/trackers-slimevr-espana" },
    { name: "México", flag: "🇲🇽", shipping: "ups", link: "/trackers-slimevr-mexico" },
    { name: "Argentina", flag: "🇦🇷", shipping: "ups", link: "/trackers-slimevr-argentina" },
    { name: "Colombia", flag: "🇨🇴", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Perú", flag: "🇵🇪", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Venezuela", flag: "🇻🇪", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Ecuador", flag: "🇪🇨", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Guatemala", flag: "🇬🇹", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Bolivia", flag: "🇧🇴", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    // Chile - envío gratis
    { name: "Chile", flag: "🇨🇱", shipping: "free", link: "/trackers-slimevr-chile" },
    { name: "República Dominicana", flag: "🇩🇴", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Honduras", flag: "🇭🇳", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Paraguay", flag: "🇵🇾", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Nicaragua", flag: "🇳🇮", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "El Salvador", flag: "🇸🇻", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Costa Rica", flag: "🇨🇷", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Panamá", flag: "🇵🇦", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Uruguay", flag: "🇺🇾", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Guinea Ecuatorial", flag: "🇬🇶", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    // Países adicionales
    { name: "Estados Unidos", flag: "🇺🇸", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Francia", flag: "🇫🇷", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Italia", flag: "🇮🇹", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Canadá", flag: "🇨🇦", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
    { name: "Brasil", flag: "🇧🇷", shipping: "ups", link: "/posts/Envios_Internacionales_Trackers_SlimeVR" },
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
								<Link
                  key={`first-${country.name}`}
                  href={country.link}
                  className={`flex flex-col items-center rounded-lg mx-2 sm:mx-3 min-w-[120px] sm:min-w-[160px] hover:scale-105 transition-transform cursor-pointer ${
									country.shipping === "free" 
										? "bg-green-50 hover:bg-green-100" 
										: "bg-gray-50 hover:bg-gray-100"
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
								</Link>
              ))}
              {/* Segunda copia para efecto infinito */}
              {countries.map((country) => (
                <Link
                  key={`second-${country.name}`}
                  href={country.link}
                  className={`flex flex-col items-center rounded-lg mx-2 sm:mx-3 min-w-[120px] sm:min-w-[160px] hover:scale-105 transition-transform cursor-pointer ${
                    country.shipping === "free" 
                      ? "bg-green-50 hover:bg-green-100" 
                      : "bg-gray-50 hover:bg-gray-100"
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
                </Link>
              ))}
            </button>
          </section>

          {/* Call to action para países hispanos */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4 text-center">
              {lang === 'es' 
                ? 'Descubre información específica de envío, precios y soporte para tu país' 
                : 'Discover specific shipping information, prices and support for your country'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                href="/trackers-slimevr-espana" 
                className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105"
              >
                🇪🇸 España
              </Link>
              <Link 
                href="/trackers-slimevr-mexico" 
                className="bg-gradient-to-r from-green-600 to-red-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                🇲🇽 México
              </Link>
              <Link 
                href="/trackers-slimevr-argentina" 
                className="bg-gradient-to-r from-blue-500 to-white text-gray-900 px-4 py-2 rounded-lg hover:from-blue-600 hover:to-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                🇦🇷 Argentina
              </Link>
              <Link 
                href="/posts/Envios_Internacionales_Trackers_SlimeVR" 
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                🌎 {lang === 'es' ? 'Todos los Países' : 'All Countries'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCountries;
