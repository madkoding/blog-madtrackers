import { NextRequest, NextResponse } from 'next/server';
import { initializeFlowService, verifyPaymentWithFlow } from './flowService';

/**
 * Maneja requests GET para confirmación de Flow
 */
export async function handleGetConfirmation(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 [FLOW CONFIRM GET] ===============================================');
  console.log('🚀 [FLOW CONFIRM GET] FLOW CONFIRMATION GET REQUEST');
  console.log('🚀 [FLOW CONFIRM GET] ===============================================');
  console.log('⏰ [FLOW CONFIRM GET] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW CONFIRM GET] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW CONFIRM GET] Request URL:', request.url);
  
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  console.log('📋 [FLOW CONFIRM GET] Search params:', Object.fromEntries(searchParams.entries()));
  console.log('🎫 [FLOW CONFIRM GET] Token:', token || 'NO_TOKEN');

  if (!token) {
    console.error('💥 [FLOW CONFIRM GET] No token provided in GET request');
    return NextResponse.json({ 
      error: 'No token provided',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    console.log('🔧 [FLOW CONFIRM GET] Initializing FlowService for GET request...');
    const flowService = initializeFlowService();
    
    console.log('📞 [FLOW CONFIRM GET] Calling Flow API...');
    const paymentStatus = await verifyPaymentWithFlow(flowService, token);
    
    console.log('📥 [FLOW CONFIRM GET] Payment status received:', {
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder,
      status: paymentStatus.status,
      amount: paymentStatus.amount
    });
    
    const response = NextResponse.json({
      status: paymentStatus.status === 1 ? 'success' : 'error',
      message: paymentStatus.status === 1 ? 'Payment confirmed' : `Payment status: ${paymentStatus.status}`,
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder,
      paymentStatus: paymentStatus.status,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    console.log('✅ [FLOW CONFIRM GET] Sending response with status 200');
    return response;

  } catch (error) {
    console.error('💥 [FLOW CONFIRM GET] Error in GET confirmation:', error);
    console.error('💥 [FLOW CONFIRM GET] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    const errorResponse = NextResponse.json({
      status: 'error',
      message: 'Error verifying payment',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    console.log('📤 [FLOW CONFIRM GET] Sending error response with status 200');
    return errorResponse;
  } finally {
    console.log('🏁 [FLOW CONFIRM GET] GET request processing completed');
  }
}

/**
 * Maneja requests OPTIONS para CORS
 */
export async function handleOptionsRequest(): Promise<NextResponse> {
  console.log('🚀 [FLOW CONFIRM OPTIONS] ===============================================');
  console.log('🚀 [FLOW CONFIRM OPTIONS] FLOW CONFIRMATION OPTIONS REQUEST');
  console.log('🚀 [FLOW CONFIRM OPTIONS] ===============================================');
  console.log('⏰ [FLOW CONFIRM OPTIONS] Timestamp:', new Date().toISOString());
  
  const response = NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    }
  });
  
  console.log('✅ [FLOW CONFIRM OPTIONS] Sending CORS response');
  return response;
}
