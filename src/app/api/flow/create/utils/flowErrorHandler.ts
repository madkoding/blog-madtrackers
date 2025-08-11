/**
 * Utilidades para manejo de errores de Flow
 */

import { NextResponse } from 'next/server';

export interface FlowErrorResponse {
  error: string;
  timestamp: string;
  code?: string;
  details?: any;
}

export interface ErrorInfo {
  message: string;
  isFlowApiError: boolean;
  statusCode: number;
  originalError: unknown;
}

/**
 * Analiza un error y extrae información útil
 */
export function analyzeFlowError(error: unknown): ErrorInfo {
  let message = 'Error interno del servidor';
  let isFlowApiError = false;
  let statusCode = 500;

  if (error instanceof Error) {
    message = error.message;
    
    if (error.message.includes('Flow API error')) {
      isFlowApiError = true;
      statusCode = 502; // Bad Gateway
    } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      statusCode = 504; // Gateway Timeout
    } else if (error.message.includes('unauthorized') || error.message.includes('UNAUTHORIZED')) {
      statusCode = 401; // Unauthorized
    } else if (error.message.includes('forbidden') || error.message.includes('FORBIDDEN')) {
      statusCode = 403; // Forbidden
    } else if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      statusCode = 404; // Not Found
    }
  }

  return {
    message,
    isFlowApiError,
    statusCode,
    originalError: error
  };
}

/**
 * Crea una respuesta de error estándar para Flow
 */
export function createFlowErrorResponse(
  error: unknown,
  customMessage?: string,
  customStatusCode?: number
): NextResponse {
  const errorInfo = analyzeFlowError(error);
  
  const errorResponse: FlowErrorResponse = {
    error: customMessage || errorInfo.message,
    timestamp: new Date().toISOString()
  };

  // Agregar código de error si es disponible
  if (errorInfo.isFlowApiError) {
    errorResponse.code = 'FLOW_API_ERROR';
  }

  const statusCode = customStatusCode || errorInfo.statusCode;

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Crea una respuesta de error de validación
 */
export function createValidationErrorResponse(errors: string[]): NextResponse {
  const errorResponse: FlowErrorResponse = {
    error: 'Errores de validación',
    timestamp: new Date().toISOString(),
    details: errors
  };

  return NextResponse.json(errorResponse, { status: 400 });
}

/**
 * Determina si un error es recuperable
 */
export function isRecoverableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const recoverablePatterns = [
    'timeout',
    'network',
    'connection',
    'temporary',
    'retry'
  ];

  const errorMessage = error.message.toLowerCase();
  return recoverablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * Extrae detalles del error para logging
 */
export function extractErrorDetails(error: unknown): Record<string, any> {
  const details: Record<string, any> = {
    type: typeof error,
    timestamp: new Date().toISOString()
  };

  if (error instanceof Error) {
    details.name = error.name;
    details.message = error.message;
    details.stack = error.stack;
    
    // Agregar propiedades específicas del error si existen
    if ('code' in error) {
      details.code = error.code;
    }
    if ('status' in error) {
      details.status = error.status;
    }
    if ('response' in error) {
      details.response = error.response;
    }
  } else {
    details.value = String(error);
  }

  return details;
}

/**
 * Sanitiza un error para logging público (remueve información sensible)
 */
export function sanitizeErrorForLogging(error: unknown): Record<string, any> {
  const details = extractErrorDetails(error);
  
  // Remover información potencialmente sensible
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  
  function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return sanitizeObject(details);
}
