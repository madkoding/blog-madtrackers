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

    // Calcular precios base en USD
    const basePrice = trackerPrice * sensorPrice * quantity;
    const shippingUsd = countryConfig.shippingCostUsd;
    
    // Para países que no son Chile, aplicar markup para cubrir comisiones de PayPal (~3.5% + $0.5)
    let basePriceWithMarkup: number;
    if (countryCode === 'CL') {
      basePriceWithMarkup = basePrice;
    } else {
      // Calcular comisión de PayPal: 3.49% + $0.49 (solo sobre el precio base, no el envío)
      const paypalFee = basePrice * 0.0349 + 0.49;
      basePriceWithMarkup = basePrice + paypalFee;
    }
    const totalUsd = basePriceWithMarkup; // El envío no se suma al total

    // Obtener la tasa de cambio real (sin markup adicional)
    let realExchangeRate: number;
    switch (countryCode) {
      case 'CL':
        realExchangeRate = 1000;
        break;
      case 'PE':
        realExchangeRate = 4.56;
        break;
      case 'AR':
        realExchangeRate = 1404;
        break;
      case 'MX':
        realExchangeRate = 24;
        break;
      default:
        realExchangeRate = 1;
    }
    
    const basePriceLocal = Math.round(basePriceWithMarkup * realExchangeRate);
    const shippingLocal = Math.round(shippingUsd * realExchangeRate);
    const totalLocal = Math.round(totalUsd * realExchangeRate); // Total sin envío

    return NextResponse.json({
      prices: {
        basePrice: basePriceWithMarkup,
        shippingUsd,
        totalUsd,
        basePriceLocal,
        shippingLocal,
        totalLocal,
      },
      currency: {
        code: countryConfig.currency,
        symbol: countryConfig.currencySymbol,
        exchangeRate: realExchangeRate,
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
