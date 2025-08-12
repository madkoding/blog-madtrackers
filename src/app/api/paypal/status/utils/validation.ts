import { PayPalStatusRequest } from './types';

/**
 * Valida los parámetros de entrada para el endpoint de status
 */
export function validateStatusRequest(params: PayPalStatusRequest): { isValid: boolean; error?: string } {
  const { transactionId, trackingId } = params;

  if (!transactionId && !trackingId) {
    return {
      isValid: false,
      error: 'Transaction ID or Tracking ID required'
    };
  }

  return { isValid: true };
}
