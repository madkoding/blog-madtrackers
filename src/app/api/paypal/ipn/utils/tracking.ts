import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus } from '@/interfaces/tracking';
import { PayPalCustomData, PayPalIPNData } from './types';

/**
 * Actualiza el tracking existente con los datos del pago completado
 */
export async function updateTrackingFromPayment(
  customData: PayPalCustomData,
  ipnData: PayPalIPNData
): Promise<any> {
  try {
    console.log('📝 [PAYPAL IPN] Transaction ID found, updating existing tracking...');
    
    // Buscar el tracking pendiente por transactionId
    const existingTracking = await FirebaseTrackingService.getTrackingByPaymentTransactionId(customData.txnId);
    
    if (!existingTracking) {
      console.error('❌ [PAYPAL IPN] No pending tracking found for transaction ID:', customData.txnId);
      return null;
    }
    
    console.log('✅ [PAYPAL IPN] Found existing tracking:', existingTracking.id);
    
    // Actualizar el tracking a estado MANUFACTURING (pago completado)
    const updatedTrackingData = {
      ...existingTracking,
      estadoPedido: OrderStatus.MANUFACTURING,
      abonadoUsd: customData.amount || parseFloat(ipnData.mc_gross || '0'),
      paymentStatus: 'COMPLETED',
      paypalTransactionId: ipnData.txn_id,
      paymentDate: new Date().toISOString()
    };
    
    // Actualizar en Firebase
    if (existingTracking.id) {
      await FirebaseTrackingService.updateTracking(existingTracking.id, updatedTrackingData);
      console.log('🎯 [PAYPAL IPN] Tracking updated successfully to MANUFACTURING status');
      return existingTracking;
    } else {
      console.error('❌ [PAYPAL IPN] Tracking ID is undefined');
      return null;
    }
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error updating tracking:', error);
    return null;
  }
}
