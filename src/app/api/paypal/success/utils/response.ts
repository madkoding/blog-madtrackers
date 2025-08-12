import { PayPalSuccessResponse } from './types';

/**
 * Formatea la respuesta de éxito
 */
export function formatSuccessResponse(
  userHash: string,
  username: string
): PayPalSuccessResponse {
  return {
    success: true,
    trackingId: userHash,
    username: username,
    userHash: userHash,
    message: 'Payment processed and tracking created successfully'
  };
}

/**
 * Formatea la respuesta de error
 */
export function formatErrorResponse(error: unknown): PayPalSuccessResponse {
  return {
    success: false,
    error: 'Internal server error',
    details: error instanceof Error ? error.message : 'Unknown error'
  };
}
