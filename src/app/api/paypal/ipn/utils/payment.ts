import { PayPalIPNData } from './types';
import { parseCustomData } from './parser';
import { updateTrackingFromPayment } from './tracking';
import { createOrderDetails, sendPurchaseConfirmationEmail } from './email';

/**
 * Procesa un pago completado de PayPal
 */
export async function processCompletedPayment(ipnData: PayPalIPNData): Promise<boolean> {
  try {
    console.log('🎉 [PAYPAL IPN] Payment completed successfully! Transaction ID:', ipnData.txn_id);
    
    // Verificar si hay datos personalizados
    if (!ipnData.custom) {
      console.log('⚠️ [PAYPAL IPN] No custom data received');
      return false;
    }
    
    // Parsear los datos del campo custom
    const customData = parseCustomData(ipnData.custom);
    if (!customData) {
      return false;
    }
    
    // Actualizar el tracking
    const existingTracking = await updateTrackingFromPayment(customData, ipnData);
    if (!existingTracking) {
      return false;
    }
    
    // Crear detalles de la orden y enviar correo de confirmación
    const orderDetails = createOrderDetails(existingTracking, customData, ipnData);
    await sendPurchaseConfirmationEmail(existingTracking, orderDetails);
    
    return true;
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error processing completed payment:', error);
    return false;
  }
}
