import { NextRequest } from 'next/server';
import { JWTAuthService } from './jwtAuthService';

/**
 * Middleware para validar API Key en requests
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_SECRET_KEY;
  
  if (!validApiKey) {
    console.error('API_SECRET_KEY not configured');
    return false;
  }
  
  return apiKey === validApiKey;
}

/**
 * Middleware para validar permisos de escritura (puede expandirse)
 */
export function validateWritePermissions(request: NextRequest): boolean {
  // Por ahora, mismo nivel de acceso para lectura y escritura
  // En el futuro se puede separar con diferentes API keys
  return validateApiKey(request);
}

/**
 * Headers CORS para API (actualizado para incluir Authorization)
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, Authorization',
};

/**
 * Respuesta de error de autenticación
 */
export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized',
      message: 'Valid API key required. Include "x-api-key" header.' 
    }), 
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Middleware para validar JWT en requests
 */
export function validateJWT(request: NextRequest, requiredType?: 'user' | 'admin'): { 
  valid: boolean; 
  user?: any; 
  message: string 
} {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      valid: false,
      message: 'JWT token requerido en el header Authorization'
    };
  }
  
  const token = authHeader.substring(7); // Remover "Bearer "
  const verification = JWTAuthService.verifyJWT(token);
  
  if (!verification.valid || !verification.payload) {
    return {
      valid: false,
      message: verification.message
    };
  }
  
  if (requiredType && verification.payload.type !== requiredType) {
    return {
      valid: false,
      message: `Acceso requerido: ${requiredType}`
    };
  }
  
  return {
    valid: true,
    user: verification.payload,
    message: 'Token válido'
  };
}

/**
 * Middleware combinado para validar API Key o JWT
 */
export function validateApiKeyOrJWT(request: NextRequest, requiredType?: 'user' | 'admin'): {
  valid: boolean;
  user?: any;
  message: string;
  authType: 'apikey' | 'jwt' | 'none';
} {
  // Primero intentar API Key
  if (validateApiKey(request)) {
    return {
      valid: true,
      message: 'API Key válida',
      authType: 'apikey'
    };
  }
  
  // Si no hay API Key, intentar JWT
  const jwtValidation = validateJWT(request, requiredType);
  
  return {
    ...jwtValidation,
    authType: jwtValidation.valid ? 'jwt' : 'none'
  };
}

/**
 * Respuesta de error de autenticación JWT
 */
export function jwtUnauthorizedResponse(message: string = 'JWT token inválido') {
  return new Response(
    JSON.stringify({ 
      error: 'Unauthorized',
      message 
    }), 
    { 
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
