import { EmailService } from '@/lib/emailService';
import { UserData, ProductData, OrderDetails } from './types';

/**
 * Crea los detalles de la orden para el correo de confirmación
 */
export function createOrderDetails(
  transactionId: string,
  amount: string,
  currency: string | undefined,
  userData: UserData,
  productData?: ProductData
): OrderDetails {
  return {
    transactionId: transactionId,
    amount: parseFloat(amount),
    currency: currency || 'USD',
    trackers: productData?.numberOfTrackers || 5,
    sensor: productData?.sensor || 'ICM45686 + QMC6309',
    colors: {
      case: productData?.caseColor || 'black',
      tapa: productData?.coverColor || 'black'
    },
    shippingAddress: {
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      estado: userData.estado,
      pais: userData.pais
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
  userData: UserData,
  userHash: string,
  orderDetails: OrderDetails
): Promise<void> {
  console.log('📧 [PAYPAL SUCCESS] Sending purchase confirmation email...');
  
  try {
    const emailSent = await EmailService.sendPurchaseConfirmation(
      userData.email,
      userData.nombreUsuarioVrChat || 'Usuario',
      userHash,
      orderDetails
    );

    if (emailSent) {
      console.log('✅ [PAYPAL SUCCESS] Purchase confirmation email sent successfully');
    } else {
      console.warn('⚠️ [PAYPAL SUCCESS] Failed to send purchase confirmation email');
    }
  } catch (emailError) {
    console.error('❌ [PAYPAL SUCCESS] Error sending purchase confirmation email:', emailError);
  }
}
