import { NextRequest, NextResponse } from 'next/server';
import {
  validateStatusRequest,
  findPayPalTracking,
  getPayPalStatus,
  formatSuccessResponse,
  formatNotFoundResponse,
  formatErrorResponse,
  logEndpointStart,
  logSearchParams,
  logError,
  logEndpointEnd,
  logSuccessResponse,
  logErrorResponse
} from './utils';

/**
 * API endpoint para verificar el estado de un pago PayPal usando el tracking ID
 */
export async function GET(request: NextRequest) {
  logEndpointStart(request);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    const trackingId = searchParams.get('trackingId');
    
    logSearchParams(searchParams, transactionId, trackingId);

    // Validar parámetros de entrada
    const validation = validateStatusRequest({ transactionId, trackingId });
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: validation.error,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Buscar el tracking de PayPal
    const tracking = await findPayPalTracking(transactionId, trackingId);
    
    if (!tracking) {
      return NextResponse.json(formatNotFoundResponse(), { status: 404 });
    }

    // Obtener el estado de PayPal y formatear la respuesta
    const paypalStatus = getPayPalStatus();
    const responseData = formatSuccessResponse(tracking, paypalStatus);
    
    logSuccessResponse();
    return NextResponse.json(responseData);

  } catch (error) {
    logError(error);
    
    const errorResponse = formatErrorResponse(error);
    logErrorResponse();
    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    logEndpointEnd();
  }
}
