import crypto from 'crypto';

/**
 * Interfaz para la configuración de Flow
 */
export interface FlowConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string; // sandbox.flow.cl para pruebas, www.flow.cl para producción
}

/**
 * Interfaz para crear un pago en Flow
 */
export interface FlowPaymentCreateParams {
  commerceOrder: string;
  subject: string;
  currency: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  paymentMethod?: number;
  optional?: string;
  timeout?: number;
}

/**
 * Interfaz para la respuesta de crear pago en Flow
 */
export interface FlowPaymentCreateResponse {
  url: string;
  token: string;
  flowOrder: number;
}

/**
 * Interfaz para obtener estado de pago en Flow
 */
export interface FlowPaymentStatusParams {
  token: string;
}

/**
 * Interfaz para la respuesta del estado de pago
 */
export interface FlowPaymentStatusResponse {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number;
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: Record<string, any>;
  pending_info?: {
    media: string;
    date: string;
  };
  paymentData?: {
    date: string;
    media: string;
    conversionDate: string;
    conversionRate: number;
    amount: number;
    currency: string;
    fee: number;
    balance: number;
    transferDate: string;
  };
  merchantId?: string;
}

/**
 * Servicio para interactuar con la API de Flow
 */
export class FlowService {
  private readonly config: FlowConfig;

  constructor(config: FlowConfig) {
    this.config = config;
  }

  /**
   * Firma los parámetros con la secretKey usando HMAC-SHA256
   */
  private signParams(params: Record<string, any>): string {
    // Excluir el parámetro 's' si existe
    const { s, ...paramsToSign } = params;
    
    // Ordenar parámetros alfabéticamente
    const keys = Object.keys(paramsToSign).sort((a, b) => a.localeCompare(b));
    
    // Concatenar parámetros: nombre_parametro + valor
    const stringToSign = keys.map(key => key + paramsToSign[key]).join('');
    
    // Firmar con HMAC-SHA256
    return crypto.createHmac('sha256', this.config.secretKey).update(stringToSign).digest('hex');
  }

  /**
   * Realiza una petición GET a la API de Flow
   */
  private async makeGetRequest(endpoint: string, params: Record<string, any>): Promise<any> {
    const paramsWithAuth: Record<string, any> = {
      ...params,
      apiKey: this.config.apiKey,
    };

    // Firmar parámetros
    const signature = this.signParams(paramsWithAuth);
    paramsWithAuth.s = signature;

    // Construir URL
    const url = new URL(`https://${this.config.baseUrl}/api${endpoint}`);
    Object.keys(paramsWithAuth).forEach(key => {
      url.searchParams.append(key, String(paramsWithAuth[key]));
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Flow API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Realiza una petición POST a la API de Flow
   */
  private async makePostRequest(endpoint: string, params: Record<string, any>): Promise<any> {
    const paramsWithAuth: Record<string, any> = {
      ...params,
      apiKey: this.config.apiKey,
    };

    // Firmar parámetros
    const signature = this.signParams(paramsWithAuth);
    paramsWithAuth.s = signature;

    // Construir form data
    const formData = new URLSearchParams();
    Object.keys(paramsWithAuth).forEach(key => {
      formData.append(key, String(paramsWithAuth[key]));
    });

    const response = await fetch(`https://${this.config.baseUrl}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Flow API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crea una orden de pago en Flow
   */
  async createPayment(params: FlowPaymentCreateParams): Promise<FlowPaymentCreateResponse> {
    return this.makePostRequest('/payment/create', params);
  }

  /**
   * Obtiene el estado de un pago en Flow
   */
  async getPaymentStatus(params: FlowPaymentStatusParams): Promise<FlowPaymentStatusResponse> {
    return this.makeGetRequest('/payment/getStatus', params);
  }

  /**
   * Valida la firma de una notificación de Flow
   */
  validateNotification(params: Record<string, any>): boolean {
    if (!params.s) {
      return false;
    }

    const receivedSignature = params.s;
    const expectedSignature = this.signParams(params);
    
    return receivedSignature === expectedSignature;
  }
}

/**
 * Instancia del servicio Flow para uso global
 */
export const getFlowService = (): FlowService => {
  const config: FlowConfig = {
    apiKey: process.env.FLOW_API_KEY || '',
    secretKey: process.env.FLOW_SECRET_KEY || '',
    baseUrl: process.env.FLOW_BASE_URL || 'sandbox.flow.cl', // Por defecto usar sandbox
  };

  if (!config.apiKey || !config.secretKey) {
    throw new Error('Flow API credentials not configured. Please set FLOW_API_KEY and FLOW_SECRET_KEY environment variables.');
  }

  return new FlowService(config);
};
