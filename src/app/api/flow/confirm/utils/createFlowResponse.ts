import { NextResponse } from 'next/server';
import { FlowPaymentStatusResponse } from '@/lib/flowService';

/**
 * Crea la respuesta para Flow
 * IMPORTANTE: Flow siempre espera status 200 para confirmar recepción
 */
export function createFlowResponse(
  isSuccess: boolean, 
  message: string, 
  paymentStatus: FlowPaymentStatusResponse
) {
  console.log('📤 [FLOW CONFIRM] Creating response for Flow...');
  console.log('📊 [FLOW CONFIRM] Response data:', {
    isSuccess,
    message,
    flowOrder: paymentStatus.flowOrder,
    commerceOrder: paymentStatus.commerceOrder,
    paymentStatus: paymentStatus.status
  });
  
  const response = NextResponse.json({
    status: isSuccess ? 'success' : 'error',
    message,
    flowOrder: paymentStatus.flowOrder,
    commerceOrder: paymentStatus.commerceOrder,
    paymentStatus: paymentStatus.status
  }, { 
    status: 200, // SIEMPRE 200 para Flow
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
  
  console.log('✅ [FLOW CONFIRM] Response created with status 200');
  return response;
}
