/**
 * Utilitario para verificar el modo de mantenimiento
 */

/**
 * Verifica si la aplicación está en modo de mantenimiento
 * @returns {boolean} true si está en modo mantenimiento, false en caso contrario
 */
export function isMaintenanceMode(): boolean {
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
}

/**
 * Crea una respuesta de error estándar para cuando está en modo mantenimiento
 * @returns {object} Objeto con la respuesta de error de mantenimiento
 */
export function createMaintenanceResponse() {
  return {
    success: false,
    error: 'El sistema de pagos está temporalmente deshabilitado por mantenimiento. Por favor, intenta más tarde.',
    errorCode: 'MAINTENANCE_MODE',
    timestamp: new Date().toISOString()
  };
}

/**
 * Middleware para verificar el modo de mantenimiento en APIs de pago
 * @returns {object | null} Respuesta de mantenimiento si está activo, null si no
 */
export function checkMaintenanceMode() {
  if (isMaintenanceMode()) {
    console.log('🚧 [MAINTENANCE] Payment request blocked - maintenance mode is enabled');
    return createMaintenanceResponse();
  }
  return null;
}
