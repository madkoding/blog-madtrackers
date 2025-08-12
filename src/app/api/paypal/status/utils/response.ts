import { TrackingData, PayPalPaymentStatus, PayPalStatusResponse } from './types';

/**
 * Formatea la respuesta de éxito para el endpoint de status
 */
export function formatSuccessResponse(
  tracking: TrackingData,
  paypalStatus: PayPalPaymentStatus
): PayPalStatusResponse {
  const responseData: PayPalStatusResponse = {
    success: true,
    payment: {
      transactionId: tracking.paymentTransactionId || '',
      status: paypalStatus.status,
      statusText: paypalStatus.statusText,
      isPaymentSuccessful: paypalStatus.isPaymentSuccessful,
      amount: tracking.abonadoUsd?.toString() || tracking.totalUsd?.toString() || '0',
      currency: tracking.paymentCurrency || 'USD',
      payer: tracking.contacto || '',
      paymentMethod: 'PayPal',
      trackingId: tracking.userHash || '', // Este es el tracking ID que necesita la página
      username: tracking.nombreUsuario || '',
      orderDate: tracking.createdAt || ''
    },
    timestamp: new Date().toISOString()
  };

  console.log('📤 [PAYPAL STATUS] Preparing response...');
  console.log('📊 [PAYPAL STATUS] Response data:', JSON.stringify(responseData, null, 2));

  return responseData;
}

/**
 * Formatea la respuesta de error cuando no se encuentra el tracking
 */
export function formatNotFoundResponse(): PayPalStatusResponse {
  return {
    success: false,
    error: 'No tracking found for this PayPal payment',
    timestamp: new Date().toISOString()
  };
}

/**
 * Formatea la respuesta de error interno del servidor
 */
export function formatErrorResponse(error: unknown): PayPalStatusResponse {
  let errorMessage = 'Error interno del servidor';
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  };
}
