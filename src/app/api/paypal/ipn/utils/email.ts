import { EmailService } from '@/lib/emailService';
import { PayPalCustomData, PayPalIPNData, OrderDetails } from './types';

/**
 * Crea los detalles de la orden para el correo de confirmación
 */
export function createOrderDetails(
  existingTracking: any,
  customData: PayPalCustomData,
  ipnData: PayPalIPNData
): OrderDetails {
  return {
    transactionId: customData.txnId,
    amount: customData.amount || parseFloat(ipnData.mc_gross || '0'),
    currency: ipnData.mc_currency || 'USD',
    trackers: existingTracking.numeroTrackers,
    sensor: existingTracking.sensor,
    colors: {
      case: existingTracking.colorCase,
      tapa: existingTracking.colorTapa
    },
    shippingAddress: {
      direccion: existingTracking.shippingAddress?.direccion || 'Dirección no disponible',
      ciudad: existingTracking.shippingAddress?.ciudad || 'Ciudad no disponible',
      estado: existingTracking.shippingAddress?.estado || 'Estado no disponible',
      pais: existingTracking.paisEnvio || 'País no disponible'
    },
    paymentMethod: 'PayPal',
    orderDate: new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Envía el correo de confirmación de compra
 */
export async function sendPurchaseConfirmationEmail(
  existingTracking: any,
  orderDetails: OrderDetails
): Promise<boolean> {
  try {
    console.log('📧 [PAYPAL IPN] Sending purchase confirmation email...');
    
    const emailSent = await EmailService.sendPurchaseConfirmation(
      existingTracking.contacto,
      existingTracking.vrchatUsername || 'Usuario',
      existingTracking.userHash,
      orderDetails
    );

    if (emailSent) {
      console.log('✅ [PAYPAL IPN] Purchase confirmation email sent successfully');
      return true;
    } else {
      console.warn('⚠️ [PAYPAL IPN] Failed to send purchase confirmation email');
      return false;
    }
  } catch (emailError) {
    console.error('❌ [PAYPAL IPN] Error sending purchase confirmation email:', emailError);
    return false;
  }
}
