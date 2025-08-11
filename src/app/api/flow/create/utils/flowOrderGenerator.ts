/**
 * Utilidades para generación de órdenes de Flow
 */

/**
 * Genera un ID único para una orden de comercio
 */
export function generateCommerceOrder(prefix?: string): string {
  const orderPrefix = prefix || process.env.FLOW_ORDER_PREFIX || 'MT';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 11);
  
  return `${orderPrefix}_${timestamp}_${randomSuffix}`;
}

/**
 * Valida el formato de un ID de orden de comercio
 */
export function isValidCommerceOrder(commerceOrder: string): boolean {
  // Formato esperado: PREFIX_TIMESTAMP_RANDOM
  const pattern = /^[A-Z0-9]+_\d{13}_[a-z0-9]{9}$/;
  return pattern.test(commerceOrder);
}

/**
 * Extrae información de un ID de orden de comercio
 */
export function parseCommerceOrder(commerceOrder: string): {
  prefix: string;
  timestamp: number;
  randomSuffix: string;
  date: Date;
} | null {
  if (!isValidCommerceOrder(commerceOrder)) {
    return null;
  }

  const parts = commerceOrder.split('_');
  const prefix = parts[0];
  const timestamp = parseInt(parts[1]);
  const randomSuffix = parts[2];
  const date = new Date(timestamp);

  return {
    prefix,
    timestamp,
    randomSuffix,
    date
  };
}

/**
 * Genera un identificador único de transacción más simple
 */
export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
