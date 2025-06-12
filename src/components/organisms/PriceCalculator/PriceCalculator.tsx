import React, { useState, useMemo, useCallback } from "react";

export interface PriceCalculatorProps {
  className?: string;
  trackers?: Array<{
    id: string;
    label: string;
    price: number;
    description: string;
  }>;
  sensors?: Array<{
    id: string;
    label: string;
    price: number;
    description: string;
    available?: string[];
  }>;
  quantities?: number[];
  availableCountries?: Array<{
    code: string;
    name: string;
  }>;
  countries?: {
    [key: string]: {
      currencySymbol: string;
      currency: string;
      exchangeRate: number;
      shippingCostUsd: number;
    };
  };
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  className = "",
  trackers = [],
  sensors = [],
  quantities = [1, 2, 3, 4, 5],
  availableCountries = [],
  countries = {}
}) => {
  // Estados para las selecciones
  const [selectedTracker, setSelectedTracker] = useState(trackers[0]);
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(quantities[0] || 1);
  const [selectedCountry, setSelectedCountry] = useState<string>("CL");

  // Obtener configuración del país seleccionado
  const countryConfig = useMemo(() => 
    countries[selectedCountry] || {
      currencySymbol: '$',
      currency: 'USD',
      exchangeRate: 1,
      shippingCostUsd: 0
    }, 
    [selectedCountry, countries]
  );

  // Calcular precios
  const calculations = useMemo(() => {
    if (!selectedTracker || !selectedSensor) {
      return {
        basePrice: 0,
        shippingUsd: 0,
        totalUsd: 0,
        basePriceLocal: 0,
        shippingLocal: 0,
        totalLocal: 0,
      };
    }

    // Precio base en USD
    const basePrice = selectedTracker.price * selectedSensor.price * selectedQuantity;
    const shippingUsd = countryConfig.shippingCostUsd;
    const totalUsd = basePrice + shippingUsd;

    // Convertir a moneda local
    const basePriceLocal = basePrice * countryConfig.exchangeRate;
    const shippingLocal = shippingUsd * countryConfig.exchangeRate;
    const totalLocal = totalUsd * countryConfig.exchangeRate;

    return {
      basePrice,
      shippingUsd,
      totalUsd,
      basePriceLocal: Math.round(basePriceLocal),
      shippingLocal: Math.round(shippingLocal),
      totalLocal: Math.round(totalLocal),
    };
  }, [selectedTracker, selectedSensor, selectedQuantity, countryConfig]);

  // Formatear números
  const formatNumber = useCallback((num: number) => 
    new Intl.NumberFormat("es-ES").format(num), []);

  const formatUsd = useCallback((num: number) => 
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num), []);

  // Filtrar sensores disponibles para el tracker seleccionado
  const availableSensors = useMemo(() =>
    sensors.filter(sensor => 
      sensor.available?.includes(selectedTracker?.id) ?? false
    ), [selectedTracker?.id, sensors]);

  // Actualizar sensor si no está disponible para el tracker seleccionado
  React.useEffect(() => {
    if (selectedTracker && selectedSensor && !selectedSensor.available?.includes(selectedTracker.id)) {
      setSelectedSensor(availableSensors[0] || sensors[0]);
    }
  }, [selectedTracker, selectedSensor, availableSensors, sensors]);

  if (!trackers.length || !sensors.length) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No hay datos de productos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">💰</span>
        <h2 className="text-xl font-bold text-gray-800">Cotizador de Precios</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Selector de Tracker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Tracker
          </label>
          <select
            value={selectedTracker?.id || ''}
            onChange={(e) => {
              const tracker = trackers.find(t => t.id === e.target.value);
              if (tracker) {setSelectedTracker(tracker);}
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {trackers.map((tracker) => (
              <option key={tracker.id} value={tracker.id}>
                {tracker.label} - ${tracker.price}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{selectedTracker?.description}</p>
        </div>

        {/* Selector de Sensor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Sensor
          </label>
          <select
            value={selectedSensor?.id || ''}
            onChange={(e) => {
              const sensor = availableSensors.find(s => s.id === e.target.value);
              if (sensor) {setSelectedSensor(sensor);}
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {availableSensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.label} - ${sensor.price}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{selectedSensor?.description}</p>
        </div>

        {/* Selector de Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <select
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {quantities.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity} tracker{quantity > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País de Envío
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {availableCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {countryConfig.currencySymbol} {countryConfig.currency} • Tasa: {countryConfig.exchangeRate}
          </p>
        </div>
      </div>

      {/* Resumen de Precios */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Precios en USD */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">🇺🇸</span>
              Precios en USD
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Trackers ({selectedQuantity}x):</span>
                <span className="font-medium text-gray-800">{formatUsd(calculations.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium text-gray-800">{formatUsd(calculations.shippingUsd)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-blue-800">Total:</span>
                <span className="font-bold text-blue-800">{formatUsd(calculations.totalUsd)}</span>
              </div>
            </div>
          </div>

          {/* Precios en Moneda Local */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="mr-2">💵</span>
              Precios en {countryConfig.currency}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Trackers ({selectedQuantity}x):</span>
                <span className="font-medium text-gray-800">
                  {countryConfig.currencySymbol}{formatNumber(calculations.basePriceLocal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium text-gray-800">
                  {countryConfig.currencySymbol}{formatNumber(calculations.shippingLocal)}
                </span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between">
                <span className="font-semibold text-green-800">Total:</span>
                <span className="font-bold text-green-800">
                  {countryConfig.currencySymbol}{formatNumber(calculations.totalLocal)} {countryConfig.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Precio por tracker:</span>
              <div className="text-gray-700">
                {formatUsd(calculations.basePrice / selectedQuantity)} / 
                {countryConfig.currencySymbol}{formatNumber(calculations.basePriceLocal / selectedQuantity)}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Anticipo (25%):</span>
              <div className="text-gray-700">
                {formatUsd(calculations.totalUsd / 4)} / 
                {countryConfig.currencySymbol}{formatNumber(calculations.totalLocal / 4)}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Saldo (75%):</span>
              <div className="text-gray-700">
                {formatUsd(calculations.totalUsd * 0.75)} / 
                {countryConfig.currencySymbol}{formatNumber(calculations.totalLocal * 0.75)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PriceCalculator };
