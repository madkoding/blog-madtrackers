import { NextRequest } from 'next/server';

/**
 * Logs de inicio del endpoint
 */
export function logEndpointStart(request: NextRequest): void {
  console.log('🚀 =================================================================');
  console.log('🚀 =================== PAYPAL STATUS ENDPOINT ===================');
  console.log('🚀 =================================================================');
  console.log('⏰ [PAYPAL STATUS] Timestamp:', new Date().toISOString());
  console.log('🌐 [PAYPAL STATUS] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [PAYPAL STATUS] Request URL:', request.url);
}

/**
 * Logs de parámetros de búsqueda
 */
export function logSearchParams(searchParams: URLSearchParams, transactionId?: string | null, trackingId?: string | null): void {
  console.log('📋 [PAYPAL STATUS] Search params:', Object.fromEntries(searchParams.entries()));
  console.log('🎫 [PAYPAL STATUS] Transaction ID:', transactionId || 'NO_TRANSACTION_ID');
  console.log('🎯 [PAYPAL STATUS] Tracking ID:', trackingId || 'NO_TRACKING_ID');
}

/**
 * Logs de error detallados
 */
export function logError(error: unknown): void {
  console.error('💥 [PAYPAL STATUS] ===============================================');
  console.error('💥 [PAYPAL STATUS] ERROR CHECKING PAYPAL PAYMENT STATUS');
  console.error('💥 [PAYPAL STATUS] ===============================================');
  console.error('💥 [PAYPAL STATUS] Error details:', error);
  console.error('💥 [PAYPAL STATUS] Error type:', typeof error);
  console.error('💥 [PAYPAL STATUS] Error message:', error instanceof Error ? error.message : 'Unknown error');
  console.error('💥 [PAYPAL STATUS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
}

/**
 * Logs de finalización del endpoint
 */
export function logEndpointEnd(): void {
  console.log('🏁 [PAYPAL STATUS] ===============================================');
  console.log('🏁 [PAYPAL STATUS] STATUS ENDPOINT EXECUTION COMPLETED');
  console.log('🏁 [PAYPAL STATUS] ===============================================');
}

/**
 * Log de respuesta exitosa
 */
export function logSuccessResponse(): void {
  console.log('✅ [PAYPAL STATUS] Successfully sending PayPal status response');
}

/**
 * Log de respuesta de error
 */
export function logErrorResponse(): void {
  console.log('📤 [PAYPAL STATUS] Sending error response');
}
