import { NextRequest, NextResponse } from 'next/server';
import { ReturnProcessingResult } from './types';
import { ReturnLogger } from './requestLogger';
import { RequestBodyParser } from './requestBodyParser';
import { RequestDataExtractor } from './requestDataExtractor';
import { PaymentStatusService } from './paymentStatusService';
import { RedirectUrlBuilder } from './redirectUrlBuilder';

/**
 * Manejador principal para el procesamiento de peticiones de retorno de Flow
 */
export class ReturnRequestProcessor {
  /**
   * Procesa una petición POST de retorno
   */
  static async processPostRequest(request: NextRequest): Promise<NextResponse> {
    ReturnLogger.logRequestStart('POST', request);
    ReturnLogger.logRequestHeaders('POST', request.headers);
    
    try {
      console.log('🏁 [FLOW RETURN POST] Starting return process...');
      
      const result = await this.processRequest(request, 'POST');
      
      if (result.success) {
        ReturnLogger.logRedirectResponse('POST');
        return NextResponse.redirect(result.redirectInfo.redirectUrl, 302);
      } else {
        throw new Error(result.error || 'Unknown processing error');
      }
    } catch (error) {
      ReturnLogger.logError('POST', error);
      const fallbackRedirect = RedirectUrlBuilder.buildFallbackRedirectInfo(request, 'POST');
      return NextResponse.redirect(fallbackRedirect.redirectUrl, 302);
    } finally {
      ReturnLogger.logProcessingEnd('POST');
    }
  }

  /**
   * Procesa una petición GET de retorno
   */
  static async processGetRequest(request: NextRequest): Promise<NextResponse> {
    ReturnLogger.logRequestStart('GET', request);
    
    try {
      const result = await this.processRequest(request, 'GET');
      
      if (result.success) {
        ReturnLogger.logRedirectResponse('GET');
        console.log('🏁 [FLOW RETURN GET] GET request processing completed');
        return NextResponse.redirect(result.redirectInfo.redirectUrl, 302);
      } else {
        throw new Error(result.error || 'Unknown processing error');
      }
    } catch (error) {
      ReturnLogger.logError('GET', error);
      const fallbackRedirect = RedirectUrlBuilder.buildFallbackRedirectInfo(request, 'GET');
      return NextResponse.redirect(fallbackRedirect.redirectUrl, 302);
    }
  }

  /**
   * Lógica común de procesamiento para GET y POST
   */
  private static async processRequest(request: NextRequest, method: 'POST' | 'GET'): Promise<ReturnProcessingResult> {
    // Parsear el cuerpo de la petición (vacío para GET)
    const body = method === 'POST' 
      ? await RequestBodyParser.parseBody(request, method)
      : {};
    
    // Extraer datos de la petición
    const requestData = RequestDataExtractor.extractRequestData(request, body, method);
    
    // Determinar ruta de redirección basada en el estado del pago
    let redirectPath = '/payment-success'; // Default
    
    if (RequestDataExtractor.isValidToken(requestData.token)) {
      const statusInfo = await PaymentStatusService.verifyPaymentStatus(requestData.token!, method);
      redirectPath = statusInfo.redirectPath;
    } else {
      ReturnLogger.logNoToken(method);
    }
    
    // Construir información de redirección
    const redirectInfo = RedirectUrlBuilder.buildRedirectInfo(
      request,
      redirectPath,
      requestData.token,
      method
    );
    
    return {
      success: true,
      redirectInfo
    };
  }
}
