"use client";

import { useState } from 'react';
import { CountrySelectorProps } from '../../../types/admin';
import { availableCountries } from '../../constants';

export default function CountrySelector({ selectedCountry, onUpdate }: Readonly<CountrySelectorProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCountryObj = availableCountries.find(country => country.code === selectedCountry) || 
                            { code: selectedCountry, name: selectedCountry };

  // Debug: mostrar información en consola
  console.log('CountrySelector - selectedCountry:', selectedCountry);
  console.log('CountrySelector - availableCountries length:', availableCountries.length);
  console.log('CountrySelector - selectedCountryObj:', selectedCountryObj);

  // Filtrar países según término de búsqueda
  const filteredCountries = availableCountries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? 
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors w-full text-gray-900 bg-white"
      >
        <span className="text-sm flex-1 text-left text-gray-800">
          {selectedCountryObj?.name ?? selectedCountry}
        </span>
        <span className="text-xs text-gray-400">{selectedCountry}</span>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-2">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    if (country.code !== selectedCountry) {
                      onUpdate('paisEnvio', country.code);
                    }
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-800 w-full text-left ${
                    selectedCountry === country.code ? 'bg-blue-50 border border-blue-300' : 'border border-transparent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.code}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No se encontraron países</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
