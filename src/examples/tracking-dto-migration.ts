/**
 * EJEMPLO: Migración del endpoint PayPal para usar DTOs consolidados
 * Este archivo muestra cómo migrar de la estructura actual a los DTOs
 */

import { TrackingService } from '@/lib/trackingService';
import { ProductDataDTO, UserDataDTO } from '@/interfaces/tracking';

/**
 * ANTES: createPendingTracking (función actual)
 * DESPUÉS: Usar TrackingService.createPayPalPendingTracking
 */

// ========== EJEMPLO DE MIGRACIÓN ==========

export async function createPendingTrackingMigrationExample(
  transactionId: string, 
  email: string, 
  amount: number, 
  userData: Record<string, unknown>,  // Los datos actuales que llegan
  productData?: Record<string, unknown>  // Los datos actuales del producto
): Promise<string> {

  // ANTES (código actual):
  // const trackingData = TrackingManager.generateUserTracking({...});
  // const enhancedTrackingData = { ...trackingData, ... };
  // return await FirebaseTrackingService.createTracking(enhancedTrackingData);

  // DESPUÉS (usando DTOs):
  
  // 1. Convertir los datos actuales a DTOs tipados
  const productDataDTO: Partial<ProductDataDTO> = {
    totalUsd: (productData?.totalUsd as number) || amount,
    numberOfTrackers: (productData?.numberOfTrackers as number) || 6,
    sensor: (productData?.sensor as string) || "ICM45686 + QMC6309",
    magnetometer: (productData?.magnetometer as boolean) ?? true,
    caseColor: (productData?.caseColor as string) || 'white',
    coverColor: (productData?.coverColor as string) || 'white',
    usbReceiverId: (productData?.usbReceiverId as string) || 'usb_3m',
    usbReceiverCost: (productData?.usbReceiverCost as number) || 0,
    strapId: (productData?.strapId as string) || 'velcro',
    strapCost: (productData?.strapCost as number) || 0,
    chargingDockId: (productData?.chargingDockId as string) || 'no_dock',
    chargingDockCost: (productData?.chargingDockCost as number) || 0
  };

  const userDataDTO: Partial<UserDataDTO> = {
    email,
    address: userData?.direccion as string,
    cityState: `${userData?.ciudad}, ${userData?.estado}` as string,
    country: (userData?.pais as string) || 'Chile',
    nombreUsuarioVrChat: userData?.nombreUsuarioVrChat as string
  };

  // 2. Usar el servicio consolidado con validación automática
  const result = await TrackingService.createPayPalPendingTracking(
    transactionId,
    email,
    amount,
    productDataDTO,
    userDataDTO
  );

  // 3. Manejar el resultado de manera consistente
  if (!result.success) {
    throw new Error(`Failed to create tracking: ${result.error}`);
  }

  console.log('✅ Tracking created with DTO validation:', {
    trackingId: result.trackingId,
    userHash: result.userHash
  });

  return result.trackingId;
}

/**
 * EJEMPLO: Migrar el endpoint de completar pago de PayPal
 */
export async function completePayPalPaymentMigrationExample(
  trackingId: string,
  paypalTransactionId: string,
  amount: number
): Promise<void> {

  // ANTES (código actual):
  // const existingTracking = await FirebaseTrackingService.getTrackingById(trackingId);
  // const updatedData = { ...existingTracking, paymentStatus: 'COMPLETED', ... };
  // await FirebaseTrackingService.updateTracking(trackingId, updatedData);

  // DESPUÉS (usando DTOs):
  const result = await TrackingService.completePayment(trackingId, {
    paypalTransactionId,
    amount,
    status: 'COMPLETED'
  });

  if (!result.success) {
    throw new Error(`Failed to complete payment: ${result.error}`);
  }

  console.log('✅ Payment completed with DTO validation:', result.trackingId);
}

/**
 * EJEMPLO: Migrar el endpoint de Flow
 */
export async function createFlowPendingTrackingMigrationExample(
  commerceOrder: string,
  email: string,
  amount: number,
  userData: Record<string, unknown>,
  productData?: Record<string, unknown>
): Promise<string> {

  // Convertir a DTOs (similar a PayPal pero con Flow)
  const productDataDTO: Partial<ProductDataDTO> = {
    totalUsd: (productData?.totalUsd as number) || Math.round(amount / 920), // Conversión CLP to USD
    numberOfTrackers: (productData?.numberOfTrackers as number) || 6,
    sensor: (productData?.sensor as string) || "ICM45686 + QMC6309",
    magnetometer: (productData?.magnetometer as boolean) ?? true,
    caseColor: (productData?.caseColor as string) || 'white',
    coverColor: (productData?.coverColor as string) || 'white',
    usbReceiverId: (productData?.usbReceiverId as string) || 'usb_3m',
    usbReceiverCost: (productData?.usbReceiverCost as number) || 0,
    strapId: (productData?.strapId as string) || 'velcro',
    strapCost: (productData?.strapCost as number) || 0,
    chargingDockId: (productData?.chargingDockId as string) || 'no_dock',
    chargingDockCost: (productData?.chargingDockCost as number) || 0
  };

  const userDataDTO: Partial<UserDataDTO> = {
    email,
    address: userData?.direccion as string,
    cityState: `${userData?.ciudad}, ${userData?.estado}` as string,
    country: (userData?.pais as string) || 'Chile',
    nombreUsuarioVrChat: userData?.nombreUsuarioVrChat as string
  };

  const result = await TrackingService.createFlowPendingTracking(
    commerceOrder,
    email,
    amount,
    productDataDTO,
    userDataDTO
  );

  if (!result.success) {
    throw new Error(`Failed to create Flow tracking: ${result.error}`);
  }

  return result.trackingId;
}

// ========== VENTAJAS DE LA MIGRACIÓN ==========

/*
VENTAJAS DE USAR DTOs:

1. VALIDACIÓN AUTOMÁTICA:
   - Los DTOs validan automáticamente la estructura antes de guardar
   - Se evitan campos faltantes o tipos incorrectos
   - Errores claros si falta información requerida

2. CONSISTENCIA GARANTIZADA:
   - Todos los trackings tendrán la misma estructura
   - No importa si vienen de PayPal, Flow u otro método de pago
   - Los campos se mapean de manera consistente

3. MANTENIBILIDAD:
   - Un solo lugar para cambiar la lógica de tracking
   - Fácil agregar nuevos métodos de pago
   - Cambios centralizados en lugar de dispersos

4. DEBUGGING MEJORADO:
   - Logs consistentes con el mismo formato
   - Errores más claros y específicos
   - Trazabilidad completa del flujo de datos

5. TESTING SIMPLIFICADO:
   - DTOs son fáciles de mockear y testear
   - Validaciones unitarias independientes
   - Tests consistentes para todos los flujos

MIGRACIÓN RECOMENDADA:
1. Reemplazar createPendingTracking en paypal/create/utils/tracking.ts
2. Reemplazar la lógica en flow/create/route.ts
3. Actualizar flow/success/route.ts para usar completePayment
4. Actualizar cualquier otro endpoint que manipule tracking

COMPATIBILIDAD:
- Los DTOs son completamente compatibles con UserTracking existente
- No requiere cambios en Firestore
- Funciona con todos los trackings existentes
*/
