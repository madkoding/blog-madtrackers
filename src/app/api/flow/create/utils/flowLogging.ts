/**
 * Utilidades para logging estructurado de Flow
 */

export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

export interface FlowLogContext {
  endpoint: string;
  timestamp: string;
  ip?: string;
  url?: string;
  orderId?: string;
  token?: string;
  flowOrder?: string;
}

/**
 * Crea un contexto base para los logs de Flow
 */
export function createFlowLogContext(
  endpoint: string,
  request?: { headers: { get: (key: string) => string | null }; url?: string }
): FlowLogContext {
  return {
    endpoint,
    timestamp: new Date().toISOString(),
    ip: request?.headers?.get('x-forwarded-for') || 'localhost',
    url: request?.url
  };
}

/**
 * Log de inicio de endpoint
 */
export function logFlowEndpointStart(context: FlowLogContext): void {
  console.log('🚀 =================================================================');
  console.log(`🚀 ==================== FLOW ${context.endpoint.toUpperCase()} ENDPOINT ====================`);
  console.log('🚀 =================================================================');
  console.log(`⏰ [FLOW ${context.endpoint.toUpperCase()}] Timestamp:`, context.timestamp);
  if (context.ip) {
    console.log(`🌐 [FLOW ${context.endpoint.toUpperCase()}] Request from IP:`, context.ip);
  }
  if (context.url) {
    console.log(`🔗 [FLOW ${context.endpoint.toUpperCase()}] Request URL:`, context.url);
  }
}

/**
 * Log de parámetros extraídos
 */
export function logFlowParameters(endpoint: string, params: Record<string, unknown>): void {
  console.log(`📊 [FLOW ${endpoint.toUpperCase()}] Extracted parameters:`);
  Object.entries(params).forEach(([key, value]) => {
    const icon = getParameterIcon(key);
    console.log(`   ${icon} ${key}:`, value);
  });
}

/**
 * Log de validación fallida
 */
export function logFlowValidationError(endpoint: string, errors: string[], missingFields: string[]): void {
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] Missing required parameters`);
  missingFields.forEach(field => {
    console.error(`   ${field}:`, 'MISSING');
  });
  errors.forEach(error => {
    console.error(`   ❌ ${error}`);
  });
}

/**
 * Log de respuesta exitosa
 */
export function logFlowSuccess(endpoint: string, data: Record<string, unknown>): void {
  console.log(`📥 [FLOW ${endpoint.toUpperCase()}] Operation completed successfully!`);
  Object.entries(data).forEach(([key, value]) => {
    const icon = getParameterIcon(key);
    console.log(`   ${icon} ${key}:`, value);
  });
}

/**
 * Log de error detallado
 */
export function logFlowError(endpoint: string, error: unknown): void {
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] ===============================================`);
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] ERROR IN FLOW OPERATION`);
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] ===============================================`);
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] Error details:`, error);
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] Error type:`, typeof error);
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] Error message:`, error instanceof Error ? error.message : 'Unknown error');
  console.error(`💥 [FLOW ${endpoint.toUpperCase()}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
  
  if (error instanceof Error && error.message.includes('Flow API error')) {
    console.error(`🌐 [FLOW ${endpoint.toUpperCase()}] This appears to be a Flow API communication error`);
  }
}

/**
 * Log de finalización de endpoint
 */
export function logFlowEndpointEnd(endpoint: string): void {
  console.log(`🏁 [FLOW ${endpoint.toUpperCase()}] ===============================================`);
  console.log(`🏁 [FLOW ${endpoint.toUpperCase()}] ${endpoint.toUpperCase()} ENDPOINT EXECUTION COMPLETED`);
  console.log(`🏁 [FLOW ${endpoint.toUpperCase()}] ===============================================`);
}

/**
 * Obtiene el icono apropiado para un parámetro
 */
function getParameterIcon(paramName: string): string {
  const iconMap: Record<string, string> = {
    amount: '💰',
    description: '📝',
    email: '📧',
    commerceOrder: '🆔',
    orderId: '🆔',
    token: '🎫',
    url: '🔗',
    paymentUrl: '🎯',
    flowOrder: '🆔',
    baseUrl: '🌐',
    currency: '💱',
    timeout: '⏰',
    paymentMethod: '💳'
  };
  
  return iconMap[paramName] || '📋';
}
