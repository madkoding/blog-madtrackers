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
  optional?: Record<string, unknown>;
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
  private signParams(params: Record<string, unknown>): string {
    console.log('🔐 [FLOW SERVICE] Signing parameters...');
    console.log('📋 [FLOW SERVICE] Parameters to sign:', params);
    
    // Excluir el parámetro 's' si existe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { s, ...paramsToSign } = params;
    
    console.log('📋 [FLOW SERVICE] Parameters after excluding signature:', paramsToSign);
    
    // Ordenar parámetros alfabéticamente
    const keys = Object.keys(paramsToSign).sort((a, b) => a.localeCompare(b));
    console.log('🔤 [FLOW SERVICE] Sorted parameter keys:', keys);
    
    // Concatenar parámetros: nombre_parametro + valor
    const stringToSign = keys.map(key => key + paramsToSign[key]).join('');
    console.log('📝 [FLOW SERVICE] String to sign:', stringToSign);
    
    // Firmar con HMAC-SHA256
    const signature = crypto.createHmac('sha256', this.config.secretKey).update(stringToSign).digest('hex');
    console.log('✅ [FLOW SERVICE] Generated signature:', signature);
    
    return signature;
  }

  /**
   * Realiza una petición GET a la API de Flow
   */
  private async makeGetRequest(endpoint: string, params: Record<string, unknown>): Promise<FlowPaymentStatusResponse> {
    console.log('🌐 [FLOW SERVICE GET] ===============================================');
    console.log('🌐 [FLOW SERVICE GET] MAKING GET REQUEST TO FLOW API');
    console.log('🌐 [FLOW SERVICE GET] ===============================================');
    console.log('🔗 [FLOW SERVICE GET] Endpoint:', endpoint);
    console.log('📋 [FLOW SERVICE GET] Original params:', params);
    console.log('🌐 [FLOW SERVICE GET] Base URL:', this.config.baseUrl);
    
    const paramsWithAuth: Record<string, unknown> = {
      ...params,
      apiKey: this.config.apiKey,
    };
    
    console.log('🔑 [FLOW SERVICE GET] Params with API key added:', paramsWithAuth);

    // Firmar parámetros
    console.log('🔐 [FLOW SERVICE GET] Signing parameters...');
    const signature = this.signParams(paramsWithAuth);
    paramsWithAuth.s = signature;
    
    console.log('✅ [FLOW SERVICE GET] Final params with signature:', paramsWithAuth);

    // Construir URL
    const url = new URL(`https://${this.config.baseUrl}/api${endpoint}`);
    console.log('🔗 [FLOW SERVICE GET] Base API URL:', url.toString());
    
    Object.keys(paramsWithAuth).forEach(key => {
      const value = String(paramsWithAuth[key]);
      url.searchParams.append(key, value);
      console.log(`   Adding param: ${key} = ${key === 's' ? '[SIGNATURE]' : value}`);
    });
    
    console.log('🎯 [FLOW SERVICE GET] Final request URL:', url.toString());

    console.log('📞 [FLOW SERVICE GET] Making HTTP GET request...');
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 [FLOW SERVICE GET] Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💥 [FLOW SERVICE GET] HTTP error response:');
      console.error('   Status:', response.status);
      console.error('   Status Text:', response.statusText);
      console.error('   Body:', errorText);
      
      throw new Error(`Flow API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('✅ [FLOW SERVICE GET] Request successful, parsing JSON...');
    const jsonResponse = await response.json();
    console.log('📋 [FLOW SERVICE GET] Response data:', JSON.stringify(jsonResponse, null, 2));
    
    console.log('🏁 [FLOW SERVICE GET] GET request completed successfully');
    return jsonResponse;
  }

  /**
   * Realiza una petición POST a la API de Flow
   */
  private async makePostRequest(endpoint: string, params: Record<string, unknown>): Promise<FlowPaymentCreateResponse> {
    console.log('🌐 [FLOW SERVICE POST] ===============================================');
    console.log('🌐 [FLOW SERVICE POST] MAKING POST REQUEST TO FLOW API');
    console.log('🌐 [FLOW SERVICE POST] ===============================================');
    console.log('🔗 [FLOW SERVICE POST] Endpoint:', endpoint);
    console.log('📋 [FLOW SERVICE POST] Original params:', params);
    console.log('🌐 [FLOW SERVICE POST] Base URL:', this.config.baseUrl);
    
    const paramsWithAuth: Record<string, unknown> = {
      ...params,
      apiKey: this.config.apiKey,
    };
    
    console.log('🔑 [FLOW SERVICE POST] Params with API key added:', paramsWithAuth);

    // Firmar parámetros
    console.log('🔐 [FLOW SERVICE POST] Signing parameters...');
    const signature = this.signParams(paramsWithAuth);
    paramsWithAuth.s = signature;
    
    console.log('✅ [FLOW SERVICE POST] Final params with signature:', paramsWithAuth);

    // Construir form data
    console.log('📝 [FLOW SERVICE POST] Building form data...');
    const formData = new URLSearchParams();
    Object.keys(paramsWithAuth).forEach(key => {
      const value = String(paramsWithAuth[key]);
      formData.append(key, value);
      console.log(`   Adding form field: ${key} = ${key === 's' ? '[SIGNATURE]' : value}`);
    });
    
    const url = `https://${this.config.baseUrl}/api${endpoint}`;
    console.log('🎯 [FLOW SERVICE POST] Request URL:', url);
    console.log('📄 [FLOW SERVICE POST] Form data body:', formData.toString());

    console.log('📞 [FLOW SERVICE POST] Making HTTP POST request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('📥 [FLOW SERVICE POST] Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💥 [FLOW SERVICE POST] HTTP error response:');
      console.error('   Status:', response.status);
      console.error('   Status Text:', response.statusText);
      console.error('   Body:', errorText);
      
      throw new Error(`Flow API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('✅ [FLOW SERVICE POST] Request successful, parsing JSON...');
    const jsonResponse = await response.json();
    console.log('📋 [FLOW SERVICE POST] Response data:', JSON.stringify(jsonResponse, null, 2));
    
    console.log('🏁 [FLOW SERVICE POST] POST request completed successfully');
    return jsonResponse;
  }

  /**
   * Crea una orden de pago en Flow
   */
  async createPayment(params: FlowPaymentCreateParams): Promise<FlowPaymentCreateResponse> {
    console.log('💳 [FLOW SERVICE] ===============================================');
    console.log('💳 [FLOW SERVICE] CREATING PAYMENT IN FLOW');
    console.log('💳 [FLOW SERVICE] ===============================================');
    console.log('📋 [FLOW SERVICE] Payment parameters:', params);
    
    const result = await this.makePostRequest('/payment/create', params as unknown as Record<string, unknown>);
    
    console.log('✅ [FLOW SERVICE] Payment created successfully:', result);
    return result;
  }

  /**
   * Obtiene el estado de un pago en Flow
   */
  async getPaymentStatus(params: FlowPaymentStatusParams): Promise<FlowPaymentStatusResponse> {
    console.log('📊 [FLOW SERVICE] ===============================================');
    console.log('📊 [FLOW SERVICE] GETTING PAYMENT STATUS FROM FLOW');
    console.log('📊 [FLOW SERVICE] ===============================================');
    console.log('🎫 [FLOW SERVICE] Status request parameters:', params);
    
    const result = await this.makeGetRequest('/payment/getStatus', params as unknown as Record<string, unknown>);
    
    console.log('✅ [FLOW SERVICE] Payment status retrieved successfully:', result);
    return result;
  }

  /**
   * Valida la firma de una notificación de Flow
   */
  validateNotification(params: Record<string, unknown>): boolean {
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
  console.log('🔧 [FLOW SERVICE] ===============================================');
  console.log('🔧 [FLOW SERVICE] INITIALIZING FLOW SERVICE');
  console.log('🔧 [FLOW SERVICE] ===============================================');
  
  const config: FlowConfig = {
    apiKey: process.env.FLOW_API_KEY || '',
    secretKey: process.env.FLOW_SECRET_KEY || '',
    baseUrl: process.env.FLOW_BASE_URL || 'sandbox.flow.cl', // Por defecto usar sandbox
  };

  console.log('🔑 [FLOW SERVICE] Configuration:');
  console.log('   API Key:', config.apiKey ? 'SET' : 'NOT_SET');
  console.log('   Secret Key:', config.secretKey ? 'SET' : 'NOT_SET');
  console.log('   Base URL:', config.baseUrl);

  if (!config.apiKey || !config.secretKey) {
    console.error('💥 [FLOW SERVICE] Flow API credentials not configured!');
    console.error('💥 [FLOW SERVICE] Missing environment variables:');
    console.error('   FLOW_API_KEY:', config.apiKey ? 'SET' : 'NOT_SET');
    console.error('   FLOW_SECRET_KEY:', config.secretKey ? 'SET' : 'NOT_SET');
    
    throw new Error('Flow API credentials not configured. Please set FLOW_API_KEY and FLOW_SECRET_KEY environment variables.');
  }

  console.log('✅ [FLOW SERVICE] FlowService initialized successfully');
  return new FlowService(config);
};
