"use client";

import React from 'react';

const MaintenanceComponent: React.FC = () => {
  return (
    <div className="w-full bg-white py-16">
      <div className="text-center mx-auto max-w-4xl px-4">
        {/* Icono de mantenimiento */}
        <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center bg-blue-500 rounded-full">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>

        {/* Título principal */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          🚧 En Mantenimiento 🚧
        </h2>

        {/* Subtítulo */}
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto text-center">
          Estamos trabajando para mejorar esta sección y ofrecerte una mejor experiencia.
        </p>

        {/* Mensaje descriptivo */}
        <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700 font-medium">Actualizando...</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Volveremos pronto con nuevas funcionalidades y mejoras.
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
