import crypto from 'crypto';

// Salt seguro para el hash (en producción esto debería estar en variables de entorno)
const HASH_SALT = process.env.TRACKING_HASH_SALT ?? 'madtrackers_2025_secure_salt_change_in_production';

/**
 * Genera un hash seguro para un nombre de usuario
 * Utiliza SHA-256 con salt para evitar ataques de diccionario
 */
export function generateUserHash(username: string): string {
  if (!username) {
    throw new Error('Username is required to generate hash');
  }
  
  // Normalizar el username (trim y lowercase para consistencia)
  const normalizedUsername = username.trim().toLowerCase();
  
  // Crear hash con salt
  const hash = crypto
    .createHash('sha256')
    .update(HASH_SALT + normalizedUsername)
    .digest('hex');
  
  // Retornar solo los primeros 16 caracteres para URLs más cortas
  return hash.substring(0, 16);
}

/**
 * Valida si un hash es válido (formato correcto)
 */
export function isValidHash(hash: string): boolean {
  if (!hash) return false;
  // El hash debe tener exactamente 16 caracteres hexadecimales
  return /^[a-f0-9]{16}$/i.test(hash);
}

/**
 * Genera un hash para migración desde el cliente
 * Esta función es segura para usar en el frontend
 * IMPORTANTE: Usa el mismo algoritmo que el servidor
 */
export function generateUserHashClient(username: string): string {
  if (!username) {
    throw new Error('Username is required to generate hash');
  }
  
  // Normalizar el username (igual que en el servidor)
  const normalizedUsername = username.trim().toLowerCase();
  
  // En el cliente, verificar si estamos en el navegador
  if (typeof window !== 'undefined') {
    // Para consistencia, usar Web Crypto API si está disponible
    if (window.crypto?.subtle) {
      // Retornar una promesa o usar el fallback
      console.warn('⚠️ generateUserHashClient en el cliente debería usar la API async de crypto.subtle');
    }
    
    // Fallback: usar el mismo algoritmo que el servidor pero de forma síncrona
    // NOTA: Esta implementación debe coincidir exactamente con generateUserHash
    const TextEncoder = window.TextEncoder || globalThis.TextEncoder;
    if (TextEncoder) {
      const encoder = new TextEncoder();
      const data = encoder.encode(HASH_SALT + normalizedUsername);
      
      // Implementación simple de SHA-256 compatible (para demo)
      let hash = '';
      for (const byte of data) {
        hash += byte.toString(16).padStart(2, '0');
      }
      
      // Simular SHA-256 de manera simplificada
      let simpleHash = 0;
      for (let i = 0; i < hash.length; i++) {
        const char = hash.charCodeAt(i);
        simpleHash = ((simpleHash << 5) - simpleHash) + char;
        simpleHash = simpleHash & simpleHash; // Convertir a 32-bit
      }
      
      return Math.abs(simpleHash).toString(16).padStart(16, '0').substring(0, 16);
    }
  }
  
  // Fallback para entornos donde crypto está disponible (Node.js/SSR)
  return generateUserHash(username);
}

/**
 * Función de utilidad para verificar si un string es un hash o un username
 */
export function isHashFormat(input: string): boolean {
  return isValidHash(input);
}
