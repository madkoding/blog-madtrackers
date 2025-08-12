import { UserTracking, OrderStatus } from '../interfaces/tracking';
import { countries, type CountryConfig } from '../app/constants';
import { generateUserHash } from '../utils/hashUtils';

/**
 * Utilidad para crear y gestionar archivos de seguimiento
 */
export class TrackingManager {
  
  /**
   * Genera un nuevo archivo JSON de seguimiento de usuario
   */
  static generateUserTracking({
    nombreUsuario,
    contacto,
    fechaLimite,
    totalUsd,
    abonadoUsd = 0,
    envioPagado = false,
    numeroTrackers,
    sensor,
    magneto = false,
    colorCase = 'black',
    colorTapa = 'black',
    paisEnvio = 'Chile',
    porcentajes = {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    },
    estadoPedido = OrderStatus.WAITING
  }: Partial<UserTracking> & {
    nombreUsuario: string;
    contacto: string;
    fechaLimite: string;
    totalUsd: number;
    numeroTrackers: number;
    sensor: string;
  }): UserTracking {
    const userHash = generateUserHash(nombreUsuario);
    
    return {
      nombreUsuario,
      userHash,
      contacto,
      fechaEntrega: fechaLimite, // Usar fechaLimite como fechaEntrega por compatibilidad
      fechaLimite,
      totalUsd,
      abonadoUsd,
      envioPagado,
      numeroTrackers,
      sensor,
      magneto,
      porcentajes,
      colorCase,
      colorTapa,
      paisEnvio,
      estadoPedido
    };
  }

  /**
   * Valida los datos de seguimiento
   */
  static validateTracking(tracking: UserTracking): boolean {
    // Obtener valores de total (con compatibilidad hacia atrás)
    const totalValue = tracking.totalUsd ?? tracking.total ?? 0;
    
    return !!(
      tracking.nombreUsuario &&
      tracking.contacto &&
      tracking.fechaLimite &&
      totalValue > 0 &&
      tracking.numeroTrackers > 0 &&
      tracking.sensor &&
      tracking.porcentajes &&
      tracking.colorCase &&
      tracking.colorTapa &&
      tracking.paisEnvio
    );
  }

  /**
   * Calcula el progreso general del pedido
   */
  static calculateOverallProgress(tracking: UserTracking): number {
    const { placa, straps, cases, baterias } = tracking.porcentajes;
    return Math.round((placa + straps + cases + baterias) / 4);
  }

  /**
   * Calcula el progreso de pago
   */
  static calculatePaymentProgress(tracking: UserTracking): number {
    const totalValue = tracking.totalUsd ?? tracking.total ?? 0;
    const abonadoValue = tracking.abonadoUsd ?? tracking.abonado ?? 0;
    return totalValue > 0 ? Math.round((abonadoValue / totalValue) * 100) : 0;
  }

  /**
   * Determina si el pedido está completo
   */
  static isOrderComplete(tracking: UserTracking): boolean {
    const progress = this.calculateOverallProgress(tracking);
    const totalValue = tracking.totalUsd ?? tracking.total ?? 0;
    const abonadoValue = tracking.abonadoUsd ?? tracking.abonado ?? 0;
    return progress === 100 && abonadoValue >= totalValue;
  }

  /**
   * Genera el JSON string formateado
   */
  static toJSONString(tracking: UserTracking): string {
    return JSON.stringify(tracking, null, 2);
  }

  /**
   * Obtiene la configuración del país basada en el código de país
   */
  static getCountryConfig(paisEnvio: string): CountryConfig | null {
    const countryCode = this.getCountryCode(paisEnvio);
    return countries[countryCode] ?? null;
  }

  /**
   * Convierte el nombre del país a código de país
   */
  static getCountryCode(paisEnvio: string): string {
    const countryMap: Record<string, string> = {
      'Chile': 'CL',
      'Perú': 'PE', 
      'Peru': 'PE',
      'Argentina': 'AR',
      'México': 'MX',
      'Mexico': 'MX',
      'Estados Unidos': 'US',
      'United States': 'US',
      'USA': 'US'
    };
    return countryMap[paisEnvio] || 'CL'; // Default to Chile
  }

  /**
   * Convierte USD a moneda local
   */
  static convertUsdToLocal(usdAmount: number, paisEnvio: string): number {
    const config = this.getCountryConfig(paisEnvio);
    return config ? Math.round(usdAmount * config.exchangeRate) : usdAmount;
  }

  /**
   * Obtiene el símbolo de moneda del país
   */
  static getCurrencySymbol(paisEnvio: string): string {
    const config = this.getCountryConfig(paisEnvio);
    return config ? config.currencySymbol : '$';
  }

  /**
   * Obtiene el código de moneda del país
   */
  static getCurrencyCode(paisEnvio: string): string {
    const config = this.getCountryConfig(paisEnvio);
    return config ? config.currency : 'CLP';
  }

  /**
   * Formatea un monto en USD con su equivalente local
   */
  static formatCurrencyWithLocal(usdAmount: number, paisEnvio: string): {
    usd: string;
    local: string;
    localAmount: number;
    currencyCode: string;
    currencySymbol: string;
  } {
    const localAmount = this.convertUsdToLocal(usdAmount, paisEnvio);
    const currencySymbol = this.getCurrencySymbol(paisEnvio);
    const currencyCode = this.getCurrencyCode(paisEnvio);
    
    return {
      usd: `US$${usdAmount.toLocaleString()}`,
      local: `${currencySymbol}${localAmount.toLocaleString()}`,
      localAmount,
      currencyCode,
      currencySymbol
    };
  }

  /**
   * Genera un template de ejemplo para un nuevo usuario
   */
  static getTemplate(nombreUsuario: string): UserTracking {
    return this.generateUserTracking({
      nombreUsuario,
      contacto: "email@ejemplo.com",
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
      totalUsd: 350, // $350 USD
      numeroTrackers: 5,
      sensor: "ICM45686 + QMC6309"
    });
  }
}
