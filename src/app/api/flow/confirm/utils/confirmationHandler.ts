import { NextRequest, NextResponse } from 'next/server';
import { logRequestInfo, createErrorResponse } from './requestLogger';
import { processFlowRequest, validateToken } from './requestProcessor';
import { processPaymentVerification, logSuccessfulPayment, logFailedPayment, logFinalResponse } from './paymentProcessor';
import { logVerificationError, logCriticalError, logEndpointCompletion } from './errorHandler';
import { createFlowResponse } from './createFlowResponse';

/**
 * Maneja la confirmación POST de Flow de manera completamente desacoplada
 */
export async function handlePostConfirmation(request: NextRequest): Promise<NextResponse> {
  logRequestInfo(request);
  
  try {
    console.log('🏁 [FLOW CONFIRM] Starting confirmation process...');
    
    // 1. Procesar request y extraer información
    const context = await processFlowRequest(request);
    
    // 2. Validar token
    if (!validateToken(context.token)) {
      return createErrorResponse(
        'No token provided',
        undefined,
        {
          requestDetails: {
            body: context.body,
            searchParams: Object.fromEntries(context.searchParams.entries()),
            headers: context.headers
          }
        }
      );
    }

    // 3. Verificar pago con Flow
    try {
      const { paymentStatus, analysis } = await processPaymentVerification(context.token!);
      
      // 4. Registrar resultado según el estado
      if (analysis.isSuccess) {
        logSuccessfulPayment(paymentStatus);
      } else {
        logFailedPayment(paymentStatus, analysis.message);
      }

      // 5. Crear y enviar respuesta
      logFinalResponse(analysis.isSuccess);
      return createFlowResponse(analysis.isSuccess, analysis.message, paymentStatus);

    } catch (verificationError) {
      // 6. Manejar errores de verificación
      logVerificationError(verificationError, context.token!);
      
      return createErrorResponse(
        'Error verifying payment status',
        verificationError instanceof Error ? verificationError.message : 'Unknown error',
        { token: context.token }
      );
    }

  } catch (error) {
    // 7. Manejar errores críticos
    logCriticalError(error);
    
    return createErrorResponse(
      'Internal server error',
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    // 8. Registrar finalización
    logEndpointCompletion();
  }
}
