"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Sensor, TrackerType } from "../../types";
import { quantities } from "../../constants/product.constants";
import { availableCountries, countries } from "../../constants/countries.constants";

interface PriceCalculatorProps {
  className?: string;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({ className = "" }) => {
  // Estados para los datos con precios (cargados desde la API interna)
  const [sensors, setSensors] = useState<(Sensor & { price: number })[]>([]);
  const [trackers, setTrackers] = useState<(TrackerType & { price: number })[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para las selecciones
  const [selectedTracker, setSelectedTracker] = useState<TrackerType & { price: number }>();
  const [selectedSensor, setSelectedSensor] = useState<Sensor & { price: number }>();
  const [selectedQuantity, setSelectedQuantity] = useState<number>(quantities[0]);
  const [selectedCountry, setSelectedCountry] = useState<string>("CL");

  // Cargar datos con precios para el admin
  useEffect(() => {
    const loadProductsWithPrices = async () => {
      try {
        const response = await fetch('/api/products?includePrices=true');
        const data = await response.json();
        
        setSensors(data.sensors);
        setTrackers(data.trackers);
        
        if (data.sensors.length > 0) setSelectedSensor(data.sensors[0]);
        if (data.trackers.length > 0) setSelectedTracker(data.trackers[0]);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductsWithPrices();
  }, []);

  // Obtener configuración del país seleccionado
  const countryConfig = useMemo(() => 
    countries[selectedCountry] || countries.US, 
    [selectedCountry]
  );

  // Calcular precios (solo si hay datos cargados)
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
      sensor.available?.includes(selectedTracker?.id || '') ?? false
    ), [sensors, selectedTracker?.id]);

  // Actualizar sensor si no está disponible para el tracker seleccionado
  useEffect(() => {
    if (selectedSensor && selectedTracker && !selectedSensor.available?.includes(selectedTracker.id)) {
      setSelectedSensor(availableSensors[0] || sensors[0]);
    }
  }, [selectedTracker?.id, selectedSensor?.available, availableSensors, selectedSensor, selectedTracker, sensors]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Cargando cotizador...</div>
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
              if (tracker) setSelectedTracker(tracker);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {trackers.map((tracker) => (
              <option key={tracker.id} value={tracker.id}>
                {tracker.label} - ${tracker.price}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{selectedTracker?.description || ''}</p>
        </div>

        {/* Selector de Sensor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensor
          </label>
          <select
            value={selectedSensor?.id || ''}
            onChange={(e) => {
              const sensor = availableSensors.find(s => s.id === e.target.value);
              if (sensor) setSelectedSensor(sensor);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {availableSensors.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.label} - ${sensor.price}x
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {selectedSensor?.description || ''} • Drift: {selectedSensor?.drifting || ''}
          </p>
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
            {quantities.map((qty) => (
              <option key={qty} value={qty}>
                {qty} trackers
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

export default PriceCalculator;
