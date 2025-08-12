import { useState, useEffect, useCallback } from 'react';

interface PriceCalculation {
  basePrice: number;
  shippingUsd: number;
  totalUsd: number;
  basePriceLocal: number;
  shippingLocal: number;
  totalLocal: number;
}

interface CurrencyInfo {
  code: string;
  symbol: string;
  exchangeRate: number;
}

interface PriceResponse {
  prices: PriceCalculation;
  currency: CurrencyInfo;
}

interface UsePricingParams {
  sensorId: string;
  trackerId: string;
  quantity: number;
  countryCode: string;
  usbReceiverId?: string;
  strapId?: string;
  chargingDockId?: string;
}

export function usePricing({ sensorId, trackerId, quantity, countryCode, usbReceiverId, strapId, chargingDockId }: UsePricingParams) {
  const [pricing, setPricing] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true); // Empezar en true para evitar flash de contenido
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const scheduleRetry = useCallback(() => {
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 2000);
    }
  }, [retryCount]);

  useEffect(() => {
    const calculatePricing = async () => {
      // Validar que tenemos todos los parámetros necesarios
      if (!sensorId || !trackerId || !quantity || !countryCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      // No limpiar pricing aquí para evitar flash de datos vacíos

      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sensorId,
            trackerId,
            quantity,
            countryCode,
            usbReceiverId,
            strapId,
            chargingDockId,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al calcular precios');
        }

        const data: PriceResponse = await response.json();
        
        // Validar que los datos recibidos son válidos
        if (data?.prices?.totalLocal > 0 && data?.prices?.totalUsd > 0) {
          setPricing(data);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error('Datos de precios inválidos recibidos del servidor');
        }
      } catch (err) {
        console.error('Error calculando precios:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        
        // Retry automático después de 2 segundos, máximo 3 intentos
        scheduleRetry();
        // No limpiar pricing en caso de error para mantener los últimos valores válidos
      } finally {
        setLoading(false);
      }
    };

    calculatePricing();
  }, [sensorId, trackerId, quantity, countryCode, usbReceiverId, strapId, chargingDockId, retryCount, scheduleRetry]);

  return {
    pricing,
    loading,
    error,
    refresh: () => {
      if (sensorId && trackerId && quantity && countryCode) {
        // Forzar recálculo manteniendo el estado de carga
        setLoading(true);
        setError(null);
      }
    }
  };
}
