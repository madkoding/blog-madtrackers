import { NextRequest } from 'next/server';

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
 * Headers CORS para API
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
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
