import { PayPalPaymentStatus } from './types';

/**
 * Mapea el estado del tracking a un formato de estado de PayPal
 */
export function getPayPalStatus(): PayPalPaymentStatus {
  // Para PayPal, si existe el tracking significa que el pago fue exitoso
  return {
    status: 1, // Siempre exitoso si existe el tracking
    statusText: 'Pagado',
    isPaymentSuccessful: true
  };
}
