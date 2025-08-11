import { NextRequest } from 'next/server';
import { ReturnRedirectInfo } from './types';
import { ReturnLogger } from './requestLogger';

/**
 * Constructor de URLs de redirección para Flow return
 */
export class RedirectUrlBuilder {
  /**
   * Construye la información completa de redirección
   */
  static buildRedirectInfo(
    request: NextRequest,
    redirectPath: string,
    token: string | null,
    method: 'POST' | 'GET'
  ): ReturnRedirectInfo {
    // Obtener la URL base del sitio (usar variable de entorno si está disponible)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    
    // Construir URL de redirección con los parámetros necesarios
    const redirectUrl = new URL(redirectPath, baseUrl);
    redirectUrl.searchParams.set('flow', 'true');
    
    // Solo agregar token si existe y es válido
    const validToken = this.isValidToken(token);
    if (validToken) {
      redirectUrl.searchParams.set('token', token!);
    }
    
    const redirectInfo: ReturnRedirectInfo = {
      redirectPath,
      redirectUrl: redirectUrl.toString(),
      token: validToken ? token : null,
      baseUrl
    };
    
    ReturnLogger.logRedirectInfo(method, redirectInfo);
    
    return redirectInfo;
  }

  /**
   * Construye una URL de redirección de fallback para errores
   */
  static buildFallbackRedirectInfo(request: NextRequest, method: 'POST' | 'GET'): ReturnRedirectInfo {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const redirectUrl = new URL('/payment-success', baseUrl);
    redirectUrl.searchParams.set('flow', 'true');
    
    const redirectInfo: ReturnRedirectInfo = {
      redirectPath: '/payment-success',
      redirectUrl: redirectUrl.toString(),
      token: null,
      baseUrl
    };
    
    ReturnLogger.logFallbackRedirect(method, redirectInfo.redirectUrl);
    
    return redirectInfo;
  }

  /**
   * Valida si un token es válido para incluir en la URL
   */
  private static isValidToken(token: string | null): boolean {
    return !!(token && token !== 'null' && token !== 'undefined');
  }
}
