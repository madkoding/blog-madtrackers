import { NextRequest, NextResponse } from 'next/server';
import { countries } from '../../../constants/countries.constants';
import { calculateDockCost } from '../../../constants/product.constants';

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

const USB_RECEIVER_ADDITIONAL_COSTS = {
  usb_3m: 0,
  usb_6m: 30,
};

const STRAP_ADDITIONAL_COSTS = {
  velcro: 0,
  anchor: 10,
};

interface PriceCalculationRequest {
  sensorId: string;
  trackerId: string;
  quantity: number;
  countryCode: string;
  usbReceiverId?: string;
  strapId?: string;
  chargingDockId?: string;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  try {
    console.log(`💰 [PRICING ${requestId}] Starting price calculation...`);
    
    const body: PriceCalculationRequest = await request.json();
    const { sensorId, trackerId, quantity, countryCode, usbReceiverId, strapId, chargingDockId } = body;
    
    console.log(`📊 [PRICING ${requestId}] Request parameters:`, {
      sensorId,
      trackerId,
      quantity,
      countryCode,
      usbReceiverId,
      strapId,
      chargingDockId
    });

    // Validar datos de entrada
    if (!sensorId || !trackerId || !quantity || !countryCode) {
      console.error(`❌ [PRICING ${requestId}] Missing required parameters:`, {
        sensorId: !!sensorId,
        trackerId: !!trackerId,
        quantity: !!quantity,
        countryCode: !!countryCode
      });
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Validar que existan los precios
    const sensorPrice = SENSOR_PRICES[sensorId as keyof typeof SENSOR_PRICES];
    const trackerPrice = TRACKER_PRICES[trackerId as keyof typeof TRACKER_PRICES];
    
    console.log(`🔍 [PRICING ${requestId}] Price lookup:`, {
      sensorId,
      sensorPrice,
      trackerId,
      trackerPrice,
      availableSensors: Object.keys(SENSOR_PRICES),
      availableTrackers: Object.keys(TRACKER_PRICES)
    });

    if (!sensorPrice || !trackerPrice) {
      console.error(`❌ [PRICING ${requestId}] Product not found:`, {
        sensorId,
        sensorPrice,
        trackerId,
        trackerPrice
      });
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Obtener costos adicionales (por defecto 0 si no se especifica)
    const usbReceiverCost = usbReceiverId ? 
      (USB_RECEIVER_ADDITIONAL_COSTS[usbReceiverId as keyof typeof USB_RECEIVER_ADDITIONAL_COSTS] || 0) : 0;
    const strapCost = strapId ? 
      (STRAP_ADDITIONAL_COSTS[strapId as keyof typeof STRAP_ADDITIONAL_COSTS] || 0) : 0;
    
    // Calcular costo del dock dinámicamente
    let chargingDockCost = 0;
    if (chargingDockId === "dock_dynamic") {
      chargingDockCost = calculateDockCost(quantity);
    }
    
    console.log(`💲 [PRICING ${requestId}] Additional costs:`, {
      usbReceiverId,
      usbReceiverCost,
      strapId,
      strapCost,
      chargingDockId,
      chargingDockCost
    });

    // Obtener configuración del país
    const countryConfig = countries[countryCode] || countries.US;
    
    console.log(`🌍 [PRICING ${requestId}] Country config:`, {
      countryCode,
      currency: countryConfig.currency,
      exchangeRate: countryConfig.exchangeRate,
      shippingCostUsd: countryConfig.shippingCostUsd
    });

    // Calcular precios base en USD
    const basePrice = (trackerPrice * sensorPrice * quantity) + usbReceiverCost + strapCost + chargingDockCost;
    const shippingUsd = countryConfig.shippingCostUsd;
    
    console.log(`🧮 [PRICING ${requestId}] Base calculation:`, {
      trackerPrice,
      sensorPrice,
      quantity,
      baseCalculation: `(${trackerPrice} * ${sensorPrice} * ${quantity}) + ${usbReceiverCost} + ${strapCost} + ${chargingDockCost}`,
      basePrice,
      shippingUsd
    });
    
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
    
    console.log(`💳 [PRICING ${requestId}] PayPal markup calculation:`, {
      countryCode,
      basePrice,
      basePriceWithMarkup,
      totalUsd,
      paypalFeeApplied: countryCode !== 'CL'
    });

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
    
    console.log(`💱 [PRICING ${requestId}] Exchange rate:`, {
      countryCode,
      realExchangeRate
    });
    
    const basePriceLocal = Math.round(basePriceWithMarkup * realExchangeRate);
    const shippingLocal = Math.round(shippingUsd * realExchangeRate);
    const totalLocal = Math.round(totalUsd * realExchangeRate); // Total sin envío
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ [PRICING ${requestId}] Calculation completed (${processingTime}ms):`, {
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
    const processingTime = Date.now() - startTime;
    console.error(`❌ [PRICING ${requestId}] Error en cálculo de precios (${processingTime}ms):`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
