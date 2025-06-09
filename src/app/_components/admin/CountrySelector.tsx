"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { CountrySelectorProps } from '../../../types/admin';
import { availableCountries } from '../../constants';

const CountrySelector = React.memo<CountrySelectorProps>(({ selectedCountry, onUpdate, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCountryObj = useMemo(() => 
    availableCountries.find(country => country.code === selectedCountry) || 
    { code: selectedCountry, name: selectedCountry },
    [selectedCountry]
  );

  // Filtrar países según término de búsqueda - memoizado para performance
  const filteredCountries = useMemo(() => 
    availableCountries.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]
  );

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleCountrySelect = useCallback((countryCode: string) => {
    if (countryCode !== selectedCountry) {
      onUpdate('paisEnvio', countryCode);
    }
    setIsOpen(false);
    setSearchTerm('');
  }, [selectedCountry, onUpdate]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="relative">
      <button
        id={id}
        onClick={handleToggle}
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
              onChange={handleSearchChange}
              onClick={handleSearchClick}
            />
          </div>
          <div className="p-2">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
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
});

CountrySelector.displayName = 'CountrySelector';

export default CountrySelector;
