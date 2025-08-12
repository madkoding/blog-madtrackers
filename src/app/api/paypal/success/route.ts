import { NextRequest, NextResponse } from 'next/server';
import {
  validateSuccessRequest,
  generateUsername,
  logProcessingStart,
  logValidationSuccess,
  createTrackingData,
  createEnhancedTrackingData,
  createTrackingInFirebase,
  logTrackingCreated,
  createOrderDetails,
  sendPurchaseConfirmationEmail,
  formatSuccessResponse,
  formatErrorResponse
} from './utils';

/**
 * API endpoint para procesar pagos exitosos de PayPal y crear tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logProcessingStart(body);
    
    const { 
      transactionId, 
      paypalTransactionId,
      payerEmail, 
      amount, 
      currency, 
      userData,
      productData 
    } = body;

    // Validar parámetros requeridos
    const validation = validateSuccessRequest(body);
    if (!validation.isValid) {
      console.error('❌ [PAYPAL SUCCESS] Missing required parameters');
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    logValidationSuccess(transactionId, payerEmail, amount, userData);

    // Generar nombre de usuario y crear tracking
    const username = generateUsername(userData.email);
    const trackingData = createTrackingData(username, userData, amount, productData);
    
    // Crear datos de tracking mejorados con información de PayPal
    const enhancedTrackingData = createEnhancedTrackingData(
      trackingData,
      transactionId,
      paypalTransactionId,
      amount,
      currency,
      userData
    );

    // Crear el tracking en Firebase
    const trackingId = await createTrackingInFirebase(enhancedTrackingData);
    logTrackingCreated(trackingId, trackingData, transactionId);

    // Crear detalles de la orden y enviar correo de confirmación
    const orderDetails = createOrderDetails(transactionId, amount, currency, userData, productData);
    await sendPurchaseConfirmationEmail(userData, trackingData.userHash || '', orderDetails);

    return NextResponse.json(formatSuccessResponse(trackingData.userHash || '', trackingData.nombreUsuario));

  } catch (error) {
    console.error('❌ [PAYPAL SUCCESS] Error processing PayPal payment:', error);
    return NextResponse.json(formatErrorResponse(error), { status: 500 });
  }
}
