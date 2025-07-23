import { NextRequest, NextResponse } from 'next/server';
import { countries } from '../../../constants/countries.constants';

// Datos de precios - Solo accesibles desde el servidor
const SENSOR_PRICES = {
  // sensor1: 1,
  // sensor2: 1.25,
  // sensor3: 1.375,
  sensor4: 1.5,
};

const TRACKER_PRICES = {
  rf: 40,
  // wifi: 40, // Para futuro uso
};

interface PriceCalculationRequest {
  sensorId: string;
  trackerId: string;
  quantity: number;
  countryCode: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceCalculationRequest = await request.json();
    const { sensorId, trackerId, quantity, countryCode } = body;

    // Validar datos de entrada
    if (!sensorId || !trackerId || !quantity || !countryCode) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Validar que existan los precios
    const sensorPrice = SENSOR_PRICES[sensorId as keyof typeof SENSOR_PRICES];
    const trackerPrice = TRACKER_PRICES[trackerId as keyof typeof TRACKER_PRICES];

    if (!sensorPrice || !trackerPrice) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Obtener configuración del país
    const countryConfig = countries[countryCode] || countries.US;

    // Calcular precios
    const basePrice = trackerPrice * sensorPrice * quantity;
    const shippingUsd = countryConfig.shippingCostUsd;
    const totalUsd = basePrice + shippingUsd;

    // Convertir a moneda local
    const basePriceLocal = Math.round(basePrice * countryConfig.exchangeRate);
    const shippingLocal = Math.round(shippingUsd * countryConfig.exchangeRate);
    const totalLocal = Math.round(totalUsd * countryConfig.exchangeRate);

    return NextResponse.json({
      prices: {
        basePrice,
        shippingUsd,
        totalUsd,
        basePriceLocal,
        shippingLocal,
        totalLocal,
      },
      currency: {
        code: countryConfig.currency,
        symbol: countryConfig.currencySymbol,
        exchangeRate: countryConfig.exchangeRate,
      }
    });

  } catch (error) {
    console.error('Error en cálculo de precios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
