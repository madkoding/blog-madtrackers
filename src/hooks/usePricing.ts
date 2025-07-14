import { useState, useEffect } from 'react';

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
}

export function usePricing({ sensorId, trackerId, quantity, countryCode }: UsePricingParams) {
  const [pricing, setPricing] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculatePricing = async () => {
      if (!sensorId || !trackerId || !quantity || !countryCode) {
        return;
      }

      setLoading(true);
      setError(null);

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
          }),
        });

        if (!response.ok) {
          throw new Error('Error al calcular precios');
        }

        const data: PriceResponse = await response.json();
        setPricing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };

    calculatePricing();
  }, [sensorId, trackerId, quantity, countryCode]);

  return {
    pricing,
    loading,
    error,
    refresh: () => {
      if (sensorId && trackerId && quantity && countryCode) {
        // Trigger recalculation
        setPricing(null);
      }
    }
  };
}
