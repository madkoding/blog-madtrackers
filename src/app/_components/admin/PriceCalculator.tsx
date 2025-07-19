"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Sensor, TrackerType } from "../../types";
import { quantities } from "../../constants/product.constants";
import { availableCountries } from "../../constants/countries.constants";

interface PriceCalculatorProps {
  className?: string;
}

// Tipos para la respuesta de precios y moneda
interface ApiPrices {
  basePrice: number;
  shippingUsd: number;
  totalUsd: number;
  basePriceLocal: number;
  shippingLocal: number;
  totalLocal: number;
}

interface ApiCurrency {
  symbol: string;
  code: string;
  exchangeRate: number;
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

  // Estados para la API de precios
  const [apiPrices, setApiPrices] = useState<ApiPrices | null>(null);
  const [apiCurrency, setApiCurrency] = useState<ApiCurrency | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Llamar a la API de precios cada vez que cambie una selección relevante
  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedTracker || !selectedSensor || !selectedQuantity || !selectedCountry) {
        setApiPrices(null);
        setApiCurrency(null);
        return;
      }
      setCalculating(true);
      setApiError(null);
      try {
        const res = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sensorId: selectedSensor.id,
            trackerId: selectedTracker.id,
            quantity: selectedQuantity,
            countryCode: selectedCountry,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al calcular precios');
        setApiPrices(data.prices);
        setApiCurrency(data.currency);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setApiError(err.message || 'Error desconocido');
        } else {
          setApiError('Error desconocido');
        }
        setApiPrices(null);
        setApiCurrency(null);
      } finally {
        setCalculating(false);
      }
    };
    fetchPrices();
  }, [selectedTracker, selectedSensor, selectedQuantity, selectedCountry]);

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
  if (apiError) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-red-600">{apiError}</div>
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
          <label htmlFor="tracker-select" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Tracker
          </label>
          <select
            id="tracker-select"
            value={selectedTracker?.id || ''}
            onChange={(e) => {
              const tracker = trackers.find(t => t.id === e.target.value);
              if (tracker) setSelectedTracker(tracker);
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {trackers.map((tracker) => (
              <option key={tracker.id} value={tracker.id}>
                {tracker.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{selectedTracker?.description || ''}</p>
        </div>

        {/* Selector de Sensor */}
        <div>
          <label htmlFor="sensor-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sensor
          </label>
          <select
            id="sensor-select"
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
          <label htmlFor="quantity-select" className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <select
            id="quantity-select"
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
          <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-2">
            País de Envío
          </label>
          <select
            id="country-select"
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
            {apiCurrency?.symbol || ''} {apiCurrency?.code || ''} • Tasa: {apiCurrency?.exchangeRate || ''}
          </p>
        </div>
      </div>

      {/* Resumen de Precios */}
      <div className="border-t border-gray-200 pt-4">
        {calculating || !apiPrices || !apiCurrency ? (
          <div className="flex items-center justify-center h-24 text-gray-500">Calculando precios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Precios en USD */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">🇺🇸</span>Precios en USD
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trackers ({selectedQuantity}x):</span>
                  <span className="font-medium text-gray-800">{formatUsd(apiPrices.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium text-gray-800">{formatUsd(apiPrices.shippingUsd)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="font-semibold text-blue-800">Total:</span>
                  <span className="font-bold text-blue-800">{formatUsd(apiPrices.totalUsd)}</span>
                </div>
              </div>
            </div>
            {/* Precios en Moneda Local */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">💵</span>Precios en {apiCurrency.code}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trackers ({selectedQuantity}x):</span>
                  <span className="font-medium text-gray-800">
                    {apiCurrency.symbol}{formatNumber(apiPrices.basePriceLocal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium text-gray-800">
                    {apiCurrency.symbol}{formatNumber(apiPrices.shippingLocal)}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between">
                  <span className="font-semibold text-green-800">Total:</span>
                  <span className="font-bold text-green-800">
                    {apiCurrency.symbol}{formatNumber(apiPrices.totalLocal)} {apiCurrency.code}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Información Adicional */}
        {apiPrices && apiCurrency && !calculating && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Precio por tracker:</span>
                <div className="text-gray-700">
                  {formatUsd(apiPrices.basePrice / selectedQuantity)} /
                  {apiCurrency.symbol}{formatNumber(apiPrices.basePriceLocal / selectedQuantity)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Anticipo (25%):</span>
                <div className="text-gray-700">
                  {formatUsd(apiPrices.totalUsd / 4)} /
                  {apiCurrency.symbol}{formatNumber(apiPrices.totalLocal / 4)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Saldo (75%):</span>
                <div className="text-gray-700">
                  {formatUsd(apiPrices.totalUsd * 0.75)} /
                  {apiCurrency.symbol}{formatNumber(apiPrices.totalLocal * 0.75)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;
