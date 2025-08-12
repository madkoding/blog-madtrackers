import { PayPalCustomData } from './types';

/**
 * Parsea los datos personalizados del campo 'custom' de PayPal
 */
export function parseCustomData(customField: string): PayPalCustomData | null {
  try {
    console.log('📋 [PAYPAL IPN] Processing custom data:', customField);
    const customData = JSON.parse(customField);
    
    if (!customData.txnId) {
      console.error('⚠️ [PAYPAL IPN] No transaction ID found in custom field');
      return null;
    }
    
    return customData;
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error parsing custom data:', error);
    return null;
  }
}

/**
 * Valida si el pago está completado
 */
export function isPaymentCompleted(paymentStatus: string | null): boolean {
  return paymentStatus === 'Completed';
}
