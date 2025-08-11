import { NextRequest } from 'next/server';
import { ReturnRequestData } from './types';
import { ReturnLogger } from './requestLogger';

/**
 * Extrae y procesa datos de la petición de retorno
 */
export class RequestDataExtractor {
  /**
   * Extrae todos los datos relevantes de la petición
   */
  static extractRequestData(
    request: NextRequest, 
    body: Record<string, unknown>, 
    method: 'POST' | 'GET'
  ): ReturnRequestData {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const searchParamsObj = Object.fromEntries(searchParams.entries());
    console.log(`🔗 [FLOW RETURN ${method}] URL search params:`, searchParamsObj);
    
    // Extraer token de ambas fuentes
    const bodyToken = body.token;
    const urlToken = searchParams.get('token');
    const token = this.extractToken(bodyToken, urlToken, method);
    
    const requestData: ReturnRequestData = {
      body,
      searchParams: searchParamsObj,
      token
    };
    
    ReturnLogger.logRequestData(method, requestData);
    
    return requestData;
  }

  /**
   * Extrae el token de diferentes fuentes con prioridad
   */
  private static extractToken(bodyToken: unknown, urlToken: string | null, method: 'POST' | 'GET'): string | null {
    const finalToken = urlToken || (typeof bodyToken === 'string' ? bodyToken : null);
    
    ReturnLogger.logTokenExtraction(method, bodyToken, urlToken, finalToken);
    
    return finalToken;
  }

  /**
   * Valida si un token es válido
   */
  static isValidToken(token: string | null): boolean {
    return !!(token && token !== 'null' && token !== 'undefined');
  }
}
