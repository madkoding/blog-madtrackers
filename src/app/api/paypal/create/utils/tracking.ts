import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingManager } from '@/lib/trackingManager';
import { OrderStatus } from '@/interfaces/tracking';
import { PayPalProductData, UserData } from './types';

/**
 * Crea un tracking en estado PENDING antes del pago PayPal
 */
export async function createPendingTracking(
  transactionId: string, 
  email: string, 
  amount: number, 
  userData: UserData,
  productData?: PayPalProductData
): Promise<string> {
  // Generar un nombre de usuario temporal basado en el transactionId
  const username = `paypal_${transactionId}`;

  console.log('📦 [PAYPAL CREATE] Creating pending tracking with product data:', productData);

  // Crear el tracking usando TrackingManager con los datos reales del producto
  const trackingData = TrackingManager.generateUserTracking({
    nombreUsuario: username,
    contacto: email,
    fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
    totalUsd: productData?.totalUsd || amount, // PayPal ya está en USD
    abonadoUsd: 0, // Pendiente de pago
    envioPagado: false,
    numeroTrackers: productData?.numberOfTrackers || 6, // Primera opción por defecto
    sensor: productData?.sensor || "ICM45686 + QMC6309", // Primer sensor disponible
    magneto: productData?.magnetometer || true,
    colorCase: productData?.caseColor || 'white', // Segundo color por defecto
    colorTapa: productData?.coverColor || 'white', // Primer color por defecto
    paisEnvio: userData.pais || 'Chile',
    estadoPedido: OrderStatus.PENDING_PAYMENT, // Estado específico para pago pendiente
    porcentajes: {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    }
  });

  // Agregar información adicional del pago pendiente
  const enhancedTrackingData = {
    ...trackingData,
    paymentMethod: 'PayPal',
    paymentTransactionId: transactionId,
    paymentStatus: 'PENDING',
    paymentAmount: amount,
    paymentCurrency: 'USD',
    shippingAddress: {
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      estado: userData.estado,
      pais: userData.pais
    },
    vrchatUsername: userData.nombreUsuarioVrChat,
    isPendingPayment: true // Flag para identificar pagos pendientes
  };

  // Crear el tracking en Firebase
  return await FirebaseTrackingService.createTracking(enhancedTrackingData);
}
