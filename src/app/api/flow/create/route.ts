import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

// Importar utils específicos para mejor trazabilidad
import { validateFlowCreateParams, normalizeAmount } from './utils/flowValidation';
import { 
  createFlowLogContext, 
  logFlowEndpointStart, 
  logFlowParameters, 
  logFlowValidationError,
  logFlowSuccess,
  logFlowError,
  logFlowEndpointEnd
} from './utils/flowLogging';
import { generateCommerceOrder } from './utils/flowOrderGenerator';
import { getFlowConfig, buildFlowUrls, buildFlowPaymentParams, formatConfigForLogging } from './utils/flowConfig';
import { buildSuccessResponse, validatePaymentData } from './utils/flowUrlBuilder';
import { createFlowErrorResponse, createValidationErrorResponse } from './utils/flowErrorHandler';

/**
 * API endpoint para crear un pago con Flow
 */
export async function POST(request: NextRequest) {
  const logContext = createFlowLogContext('CREATE', request);
  logFlowEndpointStart(logContext);
  
  try {
    console.log('🏁 [FLOW CREATE] Starting payment creation process...');
    
    const body = await request.json();
    console.log('📄 [FLOW CREATE] Request body:', body);
    
    const { amount, description, email } = body;
    logFlowParameters('CREATE', { amount, description, email });

    // Validar parámetros usando el util de validación
    const validation = validateFlowCreateParams({ amount, description, email });
    if (!validation.isValid) {
      logFlowValidationError('CREATE', validation.errors, validation.missingFields);
      return createValidationErrorResponse(validation.errors);
    }

    // Generar ID único para la orden usando el util
    const commerceOrder = generateCommerceOrder();
    console.log('🆔 [FLOW CREATE] Generated commerce order ID:', commerceOrder);
    
    // Obtener configuración y URLs usando utils
    const config = getFlowConfig();
    const urls = buildFlowUrls(request);
    
    console.log('🌐 [FLOW CREATE] Base URL:', urls.baseUrl);
    console.log('🔧 [FLOW CREATE] Initializing FlowService...');
    console.log('🔑 [FLOW CREATE] Environment variables:');
    
    const configForLogging = formatConfigForLogging(config);
    logFlowParameters('CONFIG', configForLogging);

    // Configurar el servicio Flow
    const flowService = getFlowService();

    // Preparar datos del pago usando el util de configuración
    const paymentParams = buildFlowPaymentParams(
      commerceOrder,
      description,
      normalizeAmount(amount, config.currency),
      email,
      urls,
      config
    );

    console.log('📋 [FLOW CREATE] Payment parameters prepared:', {
      ...paymentParams,
      optional: 'JSON_STRING' // No mostrar el JSON completo en el log
    });

    console.log('📞 [FLOW CREATE] Calling Flow API to create payment...');

    // Crear el pago en Flow
    const paymentData = await flowService.createPayment(paymentParams);

    // Validar datos de respuesta usando el util
    if (!validatePaymentData(paymentData)) {
      throw new Error('Invalid payment data received from Flow API');
    }

    logFlowSuccess('CREATE', {
      paymentUrl: paymentData.url,
      token: paymentData.token,
      flowOrder: paymentData.flowOrder
    });

    // Construir respuesta usando el util
    const responseData = buildSuccessResponse(paymentData, commerceOrder);

    console.log('📤 [FLOW CREATE] Sending success response:', responseData);
    console.log('✅ [FLOW CREATE] Payment creation completed successfully');

    return NextResponse.json(responseData);

  } catch (error) {
    logFlowError('CREATE', error);
    return createFlowErrorResponse(error);
  } finally {
    logFlowEndpointEnd('CREATE');
  }
}
