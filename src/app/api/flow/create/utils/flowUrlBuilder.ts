/**
 * Utilidades para construcción de URLs de Flow
 */

export interface PaymentUrlData {
  url: string;
  token: string;
  flowOrder: string | number;
}

export interface FlowSuccessResponse {
  success: boolean;
  paymentUrl: string;
  flowOrder: string;
  commerceOrder: string;
  token: string;
  timestamp: string;
}

/**
 * Construye la URL completa de pago con el token
 */
export function buildCompletePaymentUrl(baseUrl: string, token: string): string {
  return `${baseUrl}?token=${token}`;
}

/**
 * Construye la respuesta de éxito para el endpoint de creación
 */
export function buildSuccessResponse(
  paymentData: PaymentUrlData,
  commerceOrder: string
): FlowSuccessResponse {
  const fullPaymentUrl = buildCompletePaymentUrl(paymentData.url, paymentData.token);
  
  return {
    success: true,
    paymentUrl: fullPaymentUrl,
    flowOrder: String(paymentData.flowOrder), // Convertir a string
    commerceOrder,
    token: paymentData.token,
    timestamp: new Date().toISOString()
  };
}

/**
 * Valida que los datos de pago estén completos
 */
export function validatePaymentData(paymentData: unknown): paymentData is PaymentUrlData {
  if (!paymentData || typeof paymentData !== 'object' || paymentData === null) {
    return false;
  }

  const data = paymentData as Record<string, unknown>;
  
  return (
    typeof data.url === 'string' &&
    typeof data.token === 'string' &&
    (typeof data.flowOrder === 'string' || typeof data.flowOrder === 'number')
  );
}

/**
 * Extrae el dominio base de una URL
 */
export function extractBaseDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch {
    return url;
  }
}

/**
 * Valida que una URL sea válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Construye URLs de callback con parámetros opcionales
 */
export function buildCallbackUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  const url = `${baseUrl}${path}`;
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}
