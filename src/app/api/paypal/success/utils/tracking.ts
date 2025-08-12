import { TrackingManager } from '@/lib/trackingManager';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus, UserTracking } from '@/interfaces/tracking';
import { UserData, ProductData } from './types';

/**
 * Crea los datos de tracking para PayPal
 */
export function createTrackingData(
  username: string,
  userData: UserData,
  amount: string,
  productData?: ProductData
): UserTracking {
  return TrackingManager.generateUserTracking({
    nombreUsuario: username,
    contacto: userData.email,
    fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
    totalUsd: parseFloat(amount),
    abonadoUsd: parseFloat(amount), // PayPal pago completo
    envioPagado: false, // El envío se paga por separado normalmente
    numeroTrackers: productData?.numberOfTrackers || 5,
    sensor: productData?.sensor || "ICM45686 + QMC6309",
    magneto: productData?.magnetometer || false,
    colorCase: productData?.caseColor || 'black',
    colorTapa: productData?.coverColor || 'black',
    paisEnvio: userData.pais,
    estadoPedido: OrderStatus.WAITING,
    porcentajes: {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    }
  });
}

/**
 * Crea los datos de tracking mejorados con información de PayPal
 */
export function createEnhancedTrackingData(
  trackingData: UserTracking,
  transactionId: string,
  paypalTransactionId: string | undefined,
  amount: string,
  currency: string | undefined,
  userData: UserData
): UserTracking {
  return {
    ...trackingData,
    paymentMethod: 'PayPal',
    paymentTransactionId: transactionId, // Nuestro ID personalizado
    paypalTransactionId: paypalTransactionId, // ID real de PayPal
    paymentAmount: parseFloat(amount),
    paymentCurrency: currency || 'USD',
    shippingAddress: {
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      estado: userData.estado,
      pais: userData.pais
    },
    vrchatUsername: userData.nombreUsuarioVrChat
  };
}

/**
 * Crea el tracking en Firebase y retorna el ID
 */
export async function createTrackingInFirebase(enhancedTrackingData: UserTracking): Promise<string> {
  return await FirebaseTrackingService.createTracking(enhancedTrackingData);
}

/**
 * Logs de tracking creado exitosamente
 */
export function logTrackingCreated(
  trackingId: string,
  trackingData: UserTracking,
  transactionId: string
): void {
  console.log('🎯 [PAYPAL SUCCESS] Tracking created successfully:', {
    trackingId,
    username: trackingData.nombreUsuario,
    userHash: trackingData.userHash,
    paymentMethod: 'PayPal',
    transactionId
  });
}
