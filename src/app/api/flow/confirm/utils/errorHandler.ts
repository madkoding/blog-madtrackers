/**
 * Maneja errores de verificación de pagos
 */
export function logVerificationError(verificationError: unknown, token: string): void {
  console.error('💥 [FLOW CONFIRM] ===============================================');
  console.error('💥 [FLOW CONFIRM] ERROR VERIFYING PAYMENT STATUS');
  console.error('💥 [FLOW CONFIRM] ===============================================');
  console.error('💥 [FLOW CONFIRM] Token:', token ? token.substring(0, 10) + '...' : 'No token');
  console.error('💥 [FLOW CONFIRM] Error details:', verificationError);
  console.error('💥 [FLOW CONFIRM] Error type:', typeof verificationError);
  console.error('💥 [FLOW CONFIRM] Error message:', verificationError instanceof Error ? verificationError.message : 'Unknown error');
  console.error('💥 [FLOW CONFIRM] Error stack:', verificationError instanceof Error ? verificationError.stack : 'No stack trace');
  
  if (verificationError instanceof Error && verificationError.message.includes('Flow API error')) {
    console.error('🌐 [FLOW CONFIRM] This appears to be a Flow API communication error');
  }
}

/**
 * Maneja errores críticos del endpoint
 */
export function logCriticalError(error: unknown): void {
  console.error('💥 [FLOW CONFIRM] ===============================================');
  console.error('💥 [FLOW CONFIRM] CRITICAL ERROR IN CONFIRMATION ENDPOINT');
  console.error('💥 [FLOW CONFIRM] ===============================================');
  console.error('💥 [FLOW CONFIRM] Error details:', error);
  console.error('💥 [FLOW CONFIRM] Error type:', typeof error);
  console.error('💥 [FLOW CONFIRM] Error message:', error instanceof Error ? error.message : 'Unknown error');
  console.error('💥 [FLOW CONFIRM] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
}

/**
 * Registra la finalización del endpoint
 */
export function logEndpointCompletion(): void {
  console.log('🏁 [FLOW CONFIRM] ===============================================');
  console.log('🏁 [FLOW CONFIRM] CONFIRMATION ENDPOINT EXECUTION COMPLETED');
  console.log('🏁 [FLOW CONFIRM] ===============================================');
}
