import { NextRequest, NextResponse } from 'next/server';
import {
  validatePayPalCreateRequest,
  validatePayPalBusinessEmail,
  createPendingTracking,
  getPayPalConfiguration,
  getPayPalReturnUrls,
  createPayPalCustomData,
  buildPayPalUrl
} from './utils';
import { checkMaintenanceMode } from '@/utils/maintenanceMode';

/**
 * API endpoint para crear un tracking antes del pago PayPal
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar si está en modo mantenimiento
    const maintenanceCheck = checkMaintenanceMode();
    if (maintenanceCheck) {
      return NextResponse.json(maintenanceCheck, { status: 503 });
    }

    const body = await request.json();
    const { amount, description, email, userData, productData, transactionId } = body;

    console.log('🚀 [PAYPAL CREATE] Creating PayPal payment with data:', {
      amount,
      description,
      email,
      userData,
      productData,
      transactionId
    });

    // Validar datos de entrada
    const validation = validatePayPalCreateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Crear tracking pendiente
    const trackingId = await createPendingTracking(
      transactionId,
      email,
      amount,
      userData,
      productData
    );

    console.log('✅ [PAYPAL CREATE] Tracking created successfully:', trackingId);

    // Obtener configuración de PayPal
    const config = getPayPalConfiguration();
    
    // Validar configuración de PayPal
    const businessEmailValidation = validatePayPalBusinessEmail(config.paypalBusinessEmail);
    if (!businessEmailValidation.isValid) {
      return NextResponse.json(
        { error: businessEmailValidation.error },
        { status: 500 }
      );
    }

    // Obtener URLs de retorno
    const urls = getPayPalReturnUrls(transactionId);

    // Crear datos personalizados para PayPal
    const customData = createPayPalCustomData(
      transactionId,
      email,
      userData,
      productData,
      amount
    );

    // Construir URL de PayPal
    const paymentUrl = buildPayPalUrl(
      config.baseUrl,
      config.paypalBusinessEmail,
      description,
      amount,
      customData,
      urls
    );

    return NextResponse.json({
      success: true,
      paymentUrl,
      trackingId,
      transactionId,
      environment: config.isProduction ? 'live' : 'sandbox'
    });

  } catch (error) {
    console.error('❌ [PAYPAL CREATE] Error creating PayPal payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
