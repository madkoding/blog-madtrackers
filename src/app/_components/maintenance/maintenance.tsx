"use client";

import React from 'react';

const MaintenanceComponent: React.FC = () => {
  return (
    <div className="w-full bg-white py-16">
      <div className="text-center mx-auto max-w-4xl px-4">
        {/* Título principal */}
        {/* <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          🚧 En Mantenimiento 🚧
        </h2> */}

        {/* Mensaje descriptivo */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700 font-medium">Renovando stock...</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Volveremos en Agosto 2025
          </p>
        </div>

        {/* Información adicional */}
				<div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3 text-center">¿Tienes alguna pregunta? Contáctanos mientras tanto.</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => {
                const phoneNumber = "56975746099"; // +56 9 7574 6099 sin espacios ni símbolos
                const message = "Hola, tengo una consulta sobre los trackers.";
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span className="text-lg">📱</span>
              <span>Contactar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceComponent;
