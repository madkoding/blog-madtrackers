import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingData } from './types';

/**
 * Busca un tracking por tracking ID
 */
export async function findTrackingByTrackingId(trackingId: string): Promise<TrackingData | null> {
  try {
    console.log('🎯 [PAYPAL STATUS] Searching by tracking ID:', trackingId);
    return await FirebaseTrackingService.getTrackingByUserHash(trackingId);
  } catch (error) {
    console.error('❌ [PAYPAL STATUS] Error finding tracking by tracking ID:', error);
    return null;
  }
}

/**
 * Busca un tracking por transaction ID de PayPal
 */
export async function findTrackingByTransactionId(transactionId: string): Promise<TrackingData | null> {
  try {
    console.log('💳 [PAYPAL STATUS] Searching by transaction ID:', transactionId);
    const allTrackings = await FirebaseTrackingService.getAllTrackings();
    return allTrackings.find(t => 
      t.paymentTransactionId === transactionId && 
      t.paymentMethod === 'PayPal'
    ) || null;
  } catch (error) {
    console.error('❌ [PAYPAL STATUS] Error finding tracking by transaction ID:', error);
    return null;
  }
}

/**
 * Busca un tracking usando múltiples criterios
 */
export async function findPayPalTracking(
  transactionId?: string | null,
  trackingId?: string | null
): Promise<TrackingData | null> {
  console.log('🔍 [PAYPAL STATUS] Searching for PayPal tracking...');

  let tracking: TrackingData | null = null;

  // Buscar por tracking ID si se proporciona
  if (trackingId) {
    tracking = await findTrackingByTrackingId(trackingId);
  }

  // Si no se encuentra por tracking ID, buscar por transaction ID
  if (!tracking && transactionId) {
    tracking = await findTrackingByTransactionId(transactionId);
  }

  if (tracking) {
    console.log('✅ [PAYPAL STATUS] Found PayPal tracking:', {
      id: tracking.id,
      userHash: tracking.userHash,
      paymentMethod: tracking.paymentMethod,
      paymentStatus: tracking.paymentStatus,
      estadoPedido: tracking.estadoPedido
    });
  } else {
    console.log('⚠️ [PAYPAL STATUS] No tracking found for PayPal payment');
  }

  return tracking;
}
