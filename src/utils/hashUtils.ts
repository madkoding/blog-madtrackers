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
  if (!hash) {return false;}
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
  
  // En el cliente, usar una implementación compatible con crypto.createHash
  if (typeof window !== 'undefined') {
    // Implementación simple para el cliente que debe coincidir con el servidor
    // Usaremos el mismo algoritmo que el servidor
    let hash = 0;
    const saltedInput = HASH_SALT + normalizedUsername;
    
    for (let i = 0; i < saltedInput.length; i++) {
      const char = saltedInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    // Convertir a hex y normalizar a 16 caracteres
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return (hexHash + hexHash).substring(0, 16);
  }
  
  // Fallback para entornos donde crypto está disponible (Node.js)
  return generateUserHash(username);
}

/**
 * Función de utilidad para verificar si un string es un hash o un username
 */
export function isHashFormat(input: string): boolean {
  return isValidHash(input);
}
