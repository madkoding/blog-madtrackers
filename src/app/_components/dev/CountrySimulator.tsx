"use client";

import React, { useState, useEffect } from 'react';
import { countries, availableCountries } from '../../constants/countries.constants';

interface CountrySimulatorProps {
  onCountryChange?: (countryCode: string) => void;
}

/**
 * Componente para simular la visualización desde diferentes países
 * Solo para desarrollo/testing
 */
const CountrySimulator: React.FC<CountrySimulatorProps> = ({ onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<string>('CL');

  useEffect(() => {
    // Obtener el país actual desde localStorage si existe
    const stored = localStorage.getItem("currency");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setCurrentCountry(data.countryCode || 'CL');
      } catch {
        setCurrentCountry('CL');
      }
    }
  }, []);

  const handleCountryChange = (countryCode: string) => {
    const config = countries[countryCode];
    if (config) {
      // Actualizar localStorage como si el usuario estuviera en ese país
      localStorage.setItem(
        "currency",
        JSON.stringify({
          currency: config.currency,
          currencySymbol: config.currencySymbol,
          countryCode: countryCode,
          cachedAt: Date.now()
        })
      );

      setCurrentCountry(countryCode);
      
      // Notificar al componente padre si es necesario
      if (onCountryChange) {
        onCountryChange(countryCode);
      }

      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  };

  const getCountryName = (countryCode: string) => {
    const country = availableCountries.find(c => c.code === countryCode);
    return country?.name || countryCode;
  };

  const getCurrentConfig = () => {
    return countries[currentCountry] || countries.US;
  };

  const config = getCurrentConfig();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
      >
        🌍 {getCountryName(currentCountry)}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Simular País</h3>
            <p className="text-xs text-gray-600 mb-3">
              Cambia el país para ver cómo se ven los precios desde diferentes ubicaciones.
            </p>
            
            <div className="bg-gray-50 p-3 rounded mb-3 text-xs">
              <div><strong>País actual:</strong> {getCountryName(currentCountry)}</div>
              <div><strong>Moneda:</strong> {config.currency}</div>
              <div><strong>Símbolo:</strong> {config.currencySymbol}</div>
              <div><strong>Tasa cambio:</strong> {config.exchangeRate}</div>
              <div><strong>Envío USD:</strong> ${config.shippingCostUsd}</div>
            </div>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {/* Países principales primero */}
            {['CL', 'PE', 'AR', 'MX', 'US'].map(countryCode => {
              const country = availableCountries.find(c => c.code === countryCode);
              const countryConfig = countries[countryCode];
              if (!country || !countryConfig) return null;

              return (
                <button
                  key={countryCode}
                  onClick={() => handleCountryChange(countryCode)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors ${
                    currentCountry === countryCode ? 'bg-purple-100 text-purple-800 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-500">
                      {countryConfig.currencySymbol} {countryConfig.currency}
                    </span>
                  </div>
                </button>
              );
            })}

            <hr className="my-2" />

            {/* Otros países */}
            {availableCountries
              .filter(country => !['CL', 'PE', 'AR', 'MX', 'US'].includes(country.code))
              .map(country => {
                // Para países no configurados, usar configuración de US
                const countryConfig = countries[country.code] || countries.US;
                
                return (
                  <button
                    key={country.code}
                    onClick={() => handleCountryChange(country.code)}
                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors ${
                      currentCountry === country.code ? 'bg-purple-100 text-purple-800 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{country.name}</span>
                      <span className="text-xs text-gray-500">
                        {countryConfig.currencySymbol} {countryConfig.currency}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySimulator;
