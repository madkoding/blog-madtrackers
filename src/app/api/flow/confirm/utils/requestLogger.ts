import { NextRequest, NextResponse } from 'next/server';

/**
 * Registra información completa de la request para debugging
 */
export function logRequestInfo(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 ================ FLOW CONFIRMATION ENDPOINT ==================');
  console.log('🚀 =================================================================');
  console.log('⏰ [FLOW CONFIRM] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW CONFIRM] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW CONFIRM] Request URL:', request.url);
  console.log('📍 [FLOW CONFIRM] Request method:', request.method);
  
  // Log todos los headers
  console.log('📋 [FLOW CONFIRM] All headers:');
  const headers = Object.fromEntries(request.headers.entries());
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
}

/**
 * Crea respuesta de error estándar para Flow
 */
export function createErrorResponse(
  message: string, 
  error?: string, 
  additionalData?: Record<string, unknown>
) {
  console.log('💥 [FLOW CONFIRM] Creating error response:', { message, error });
  
  return NextResponse.json({
    status: 'error',
    message,
    error,
    timestamp: new Date().toISOString(),
    ...additionalData
  }, { 
    status: 200 // Siempre 200 para Flow
  });
}

/**
 * Registra análisis completo de la request
 */
export function logCompleteRequestAnalysis(data: {
  body: Record<string, unknown>;
  searchParams: Record<string, string>;
  token: string | null;
  headers: Record<string, string>;
  method: string;
  url: string;
}) {
  console.log('📊 [FLOW CONFIRM] Complete request analysis:', data);
}
