import React, { useState, useCallback, useMemo } from 'react';

export interface CountrySelectorProps {
  selectedCountry: string;
  onUpdate: (field: string, value: string) => void;
  id?: string;
  availableCountries?: Array<{
    code: string;
    name: string;
  }>;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = React.memo(({
  selectedCountry,
  onUpdate,
  id,
  availableCountries = [],
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCountryObj = useMemo(() => 
    availableCountries.find(country => country.code === selectedCountry) || 
    { code: selectedCountry, name: selectedCountry },
    [selectedCountry, availableCountries]
  );

  // Filtrar países según término de búsqueda - memoizado para performance
  const filteredCountries = useMemo(() => 
    availableCountries.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm, availableCountries]
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
    <div className={`relative ${className}`}>
      <button
        id={id}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors w-full text-gray-900 bg-white"
      >
        <span className="text-xl">{selectedCountryObj.name.slice(0, 2)}</span>
        <span className="flex-1 text-left">{selectedCountryObj.name}</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar país..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={handleSearchClick}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No se encontraron países</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country.code)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2
                    ${country.code === selectedCountry ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                  `}
                >
                  <span className="text-lg">{country.name.slice(0, 2)}</span>
                  <span>{country.name} ({country.code})</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CountrySelector.displayName = 'CountrySelector';

export { CountrySelector };
