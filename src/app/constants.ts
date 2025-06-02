// Archivo principal de constantes - Re-exporta todas las constantes desde módulos específicos
// Para mantener compatibilidad con importaciones existentes

// Re-exportar todas las constantes desde los módulos específicos
export * from './constants/';

// También exportar las interfaces que están en otros módulos
export type { CountryOption, CountryConfig } from './constants/countries.constants';

export const ORDER_STATUS_DELIVERED = "DELIVERED";