import { UserData } from './types';

/**
 * Genera un nombre de usuario basado en el email para el tracking
 */
export function generateUsername(userData: Pick<UserData, 'nombreUsuarioVrChat'>): string {
  const username = userData.nombreUsuarioVrChat?.trim();

  if (!username) {
    throw new Error('nombreUsuarioVrChat es requerido para generar el nombre de usuario');
  }

  return username;
}

interface RequestBody {
  [key: string]: unknown;
}

/**
 * Logs de inicio del procesamiento
 */
export function logProcessingStart(body: RequestBody): void {
  console.log('🎉 [PAYPAL SUCCESS] Starting PayPal payment processing...');
  console.log('📄 [PAYPAL SUCCESS] Request body:', body);
}

/**
 * Logs de validación exitosa
 */
export function logValidationSuccess(
  transactionId: string,
  payerEmail: string,
  amount: string,
  userData: UserData
): void {
  console.log('✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:', {
    transactionId,
    payerEmail,
    amount,
    userData: {
      email: userData.email,
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      estado: userData.estado,
      pais: userData.pais,
      nombreUsuarioVrChat: userData.nombreUsuarioVrChat
    }
  });
}
