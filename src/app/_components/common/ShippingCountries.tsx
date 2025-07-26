"use client";

import { useLang } from "../../lang-context";

const ShippingCountries = () => {
  const { lang } = useLang();

  const countries = [
    // Chile - envío gratis
    { name: "Chile", flag: "🇨🇱", shipping: "free" },
    // Países hispanohablantes
    { name: "España", flag: "🇪🇸", shipping: "ups" },
    { name: "México", flag: "🇲🇽", shipping: "ups" },
    { name: "Argentina", flag: "🇦🇷", shipping: "ups" },
    { name: "Colombia", flag: "🇨🇴", shipping: "ups" },
    { name: "Perú", flag: "🇵🇪", shipping: "ups" },
    { name: "Venezuela", flag: "🇻🇪", shipping: "ups" },
    { name: "Ecuador", flag: "🇪🇨", shipping: "ups" },
    { name: "Guatemala", flag: "🇬🇹", shipping: "ups" },
    { name: "Cuba", flag: "🇨🇺", shipping: "ups" },
    { name: "Bolivia", flag: "🇧🇴", shipping: "ups" },
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
    <div className="bg-gray-50 py-8">
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
          <div className="relative overflow-hidden rounded-lg">
            <div className="flex animate-scroll">
              {/* Primera copia de países */}
              {countries.map((country) => (
                <div
                  key={`first-${country.name}`}
                  className={`flex flex-col items-center rounded-lg transition-all duration-300 hover:scale-105 mx-3 min-w-[160px] ${
                    country.shipping === "free" 
                      ? "bg-green-50" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className="text-8xl mb-2">
                    {country.flag}
                  </div>
                  <p className="text-sm text-center font-medium text-gray-700 whitespace-nowrap">
                    {country.name}
                  </p>
                  {country.shipping === "free" && (
                    <span className="text-sm text-green-600 font-bold mt-2">
                      {lang === 'es' ? 'GRATIS' : 'FREE'}
                    </span>
                  )}
                </div>
              ))}
              {/* Segunda copia para efecto infinito */}
              {countries.map((country) => (
                <div
                  key={`second-${country.name}`}
                  className={`flex flex-col items-center rounded-lg transition-all duration-300 hover:scale-105 mx-3 min-w-[160px] ${
                    country.shipping === "free" 
                      ? "bg-green-50" 
                      : "bg-gray-50"
                  }`}
                >
                  <div className="text-8xl mb-2">
                    {country.flag}
                  </div>
                  <p className="text-sm text-center font-medium text-gray-700 whitespace-nowrap">
                    {country.name}
                  </p>
                  {country.shipping === "free" && (
                    <span className="text-sm text-green-600 font-bold mt-2">
                      {lang === 'es' ? 'GRATIS' : 'FREE'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ShippingCountries;
