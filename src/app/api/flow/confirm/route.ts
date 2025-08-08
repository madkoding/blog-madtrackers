import { NextRequest, NextResponse } from 'next/server';
import { FlowService, FlowPaymentStatusResponse } from '@/lib/flowService';

/**
 * Procesa el cuerpo de la petición HTTP para extraer datos
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>> {
  console.log('🔍 [FLOW CONFIRM] Parsing request body...');
  try {
    const textBody = await request.text();
    console.log('📄 [FLOW CONFIRM] Raw body content:', textBody || 'EMPTY');
    
    if (!textBody) {
      console.log('⚠️ [FLOW CONFIRM] No body content found');
      return {};
    }

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(textBody);
      console.log('✅ [FLOW CONFIRM] Successfully parsed as JSON:', jsonData);
      return jsonData;
    } catch (jsonError) {
      console.log('❌ [FLOW CONFIRM] Failed to parse as JSON:', jsonError);
      
      // Si no es JSON, podría ser form-urlencoded
      if (textBody.includes('=')) {
        const params = new URLSearchParams(textBody);
        const formData = Object.fromEntries(params.entries());
        console.log('✅ [FLOW CONFIRM] Successfully parsed as form-urlencoded:', formData);
        return formData;
      } else {
        console.log('❌ [FLOW CONFIRM] Not recognized as form-urlencoded either');
      }
    }
  } catch (error) {
    console.error('💥 [FLOW CONFIRM] Error parsing request body:', error);
  }
  
  console.log('⚠️ [FLOW CONFIRM] Returning empty object as fallback');
  return {};
}

/**
 * Extrae el token de la petición
 */
function extractToken(body: Record<string, unknown>, searchParams: URLSearchParams): string | null {
  console.log('🔍 [FLOW CONFIRM] Extracting token...');
  console.log('📄 [FLOW CONFIRM] Body:', body);
  console.log('🔗 [FLOW CONFIRM] Search params:', Object.fromEntries(searchParams.entries()));
  
  const bodyToken = body?.token;
  const urlToken = searchParams.get('token');
  
  console.log('🎫 [FLOW CONFIRM] Token from body:', bodyToken || 'NOT_FOUND');
  console.log('🎫 [FLOW CONFIRM] Token from URL:', urlToken || 'NOT_FOUND');
  
  const finalToken = urlToken || (typeof bodyToken === 'string' ? bodyToken : null);
  console.log('🎯 [FLOW CONFIRM] Final token selected:', finalToken || 'NO_TOKEN');
  
  return finalToken;
}

/**
 * Determina el estado del pago y mensaje correspondiente
 * NOTA: Flow a veces reporta status 2 pero con paymentData válido,
 * lo que indica que el pago SÍ fue procesado exitosamente
 */
function getStatusMessage(status: number, paymentData?: FlowPaymentStatusResponse['paymentData']): { isSuccess: boolean; message: string } {
  console.log(`🔍 [FLOW CONFIRM] Analyzing payment status: ${status}`);
  console.log(`🔍 [FLOW CONFIRM] Payment data present: ${paymentData ? 'YES' : 'NO'}`);
  
  if (paymentData) {
    console.log('💳 [FLOW CONFIRM] Payment data details:', paymentData);
  }
  
  let result: { isSuccess: boolean; message: string };
  
  // Si hay paymentData con fecha, media y monto, considerar como exitoso
  // independientemente del status (problema conocido de Flow)
  if (paymentData?.date && paymentData?.media && paymentData?.amount) {
    console.log('🎉 [FLOW CONFIRM] OVERRIDE: PaymentData indicates successful payment despite status 2');
    console.log('💰 [FLOW CONFIRM] Payment amount:', paymentData.amount);
    console.log('💳 [FLOW CONFIRM] Payment method:', paymentData.media);
    console.log('📅 [FLOW CONFIRM] Payment date:', paymentData.date);
    console.log('💸 [FLOW CONFIRM] Flow fee:', paymentData.fee);
    console.log('💵 [FLOW CONFIRM] Available balance:', paymentData.balance);
    
    result = { isSuccess: true, message: 'Payment confirmed successfully (verified by paymentData)' };
    console.log('✅ [FLOW CONFIRM] Status override: Payment confirmed by paymentData presence');
  } else {
    // Usar el status normal si no hay paymentData válido
    switch (status) {
      case 1: 
        result = { isSuccess: true, message: 'Payment confirmed successfully' };
        console.log('✅ [FLOW CONFIRM] Status 1: Payment successful');
        break;
      case 2: 
        result = { isSuccess: false, message: 'Payment rejected' };
        console.log('❌ [FLOW CONFIRM] Status 2: Payment rejected');
        break;
      case 3: 
        result = { isSuccess: false, message: 'Payment pending' };
        console.log('⏳ [FLOW CONFIRM] Status 3: Payment pending');
        break;
      case 4: 
        result = { isSuccess: false, message: 'Payment cancelled' };
        console.log('🚫 [FLOW CONFIRM] Status 4: Payment cancelled');
        break;
      default: 
        result = { isSuccess: false, message: `Unknown payment status: ${status}` };
        console.log(`❓ [FLOW CONFIRM] Unknown status: ${status}`);
        break;
    }
  }
  
  console.log('📊 [FLOW CONFIRM] Status analysis result:', result);
  return result;
}

/**
 * Crea la respuesta para Flow
 */
function createFlowResponse(isSuccess: boolean, message: string, paymentStatus: FlowPaymentStatusResponse) {
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

/**
 * Endpoint de confirmación para Flow
 * Flow llama a este endpoint para confirmar que la transacción fue procesada correctamente
 * Este endpoint debe responder con un mensaje específico que Flow entienda
 * 
 * IMPORTANTE: En desarrollo (localhost), Flow no puede alcanzar este endpoint
 * desde internet, por lo que el pago se procesará pero Flow reportará error de confirmación.
 * En producción con dominio público, funcionará correctamente.
 */
export async function POST(request: NextRequest) {
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
  
  try {
    console.log('🏁 [FLOW CONFIRM] Starting confirmation process...');
    
    // Procesar body y extraer token
    const body = await parseRequestBody(request);
    const searchParams = request.nextUrl.searchParams;
    const token = extractToken(body, searchParams);
    
    console.log('📊 [FLOW CONFIRM] Complete request analysis:', {
      body,
      searchParams: Object.fromEntries(searchParams.entries()),
      token: token || 'NO_TOKEN',
      headers,
      method: request.method,
      url: request.url
    });

    if (!token) {
      console.error('💥 [FLOW CONFIRM] CRITICAL: No token provided in confirmation request');
      console.error('💥 [FLOW CONFIRM] This means Flow couldn\'t send the token properly');
      
      const errorResponse = NextResponse.json({ 
        error: 'No token provided',
        timestamp: new Date().toISOString(),
        requestDetails: {
          body,
          searchParams: Object.fromEntries(searchParams.entries()),
          headers: Object.fromEntries(request.headers.entries())
        }
      }, { status: 200 }); // Incluso sin token, devolver 200 para Flow
      
      console.log('📤 [FLOW CONFIRM] Sending error response (no token)');
      return errorResponse;
    }

    console.log('✅ [FLOW CONFIRM] Token found, proceeding to verify payment status...');

    // Verificar el estado del pago con Flow
    try {
      console.log('🔧 [FLOW CONFIRM] Initializing FlowService...');
      console.log('🔑 [FLOW CONFIRM] API Key:', process.env.FLOW_API_KEY ? 'SET' : 'NOT_SET');
      console.log('🔐 [FLOW CONFIRM] Secret Key:', process.env.FLOW_SECRET_KEY ? 'SET' : 'NOT_SET');
      console.log('🌐 [FLOW CONFIRM] Base URL:', process.env.FLOW_BASE_URL || 'sandbox.flow.cl');
      
      const flowService = new FlowService({
        apiKey: process.env.FLOW_API_KEY!,
        secretKey: process.env.FLOW_SECRET_KEY!,
        baseUrl: process.env.FLOW_BASE_URL || 'sandbox.flow.cl'
      });
      
      console.log('📞 [FLOW CONFIRM] Calling Flow API to get payment status...');
      console.log('🎫 [FLOW CONFIRM] Using token:', token);
      
      const paymentStatus = await flowService.getPaymentStatus({ token });
      
      console.log('📥 [FLOW CONFIRM] Payment status response received:');
      console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
      console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
      console.log('   📊 Status:', paymentStatus.status);
      console.log('   💰 Amount:', paymentStatus.amount);
      console.log('   👤 Payer:', paymentStatus.payer);
      console.log('   📅 Request Date:', paymentStatus.requestDate);
      console.log('   💳 Payment Data:', paymentStatus.paymentData);
      console.log('   ⏳ Pending Info:', paymentStatus.pending_info);
      console.log('📋 [FLOW CONFIRM] Full payment status object:', JSON.stringify(paymentStatus, null, 2));
      
      const { isSuccess, message } = getStatusMessage(paymentStatus.status, paymentStatus.paymentData);

      if (isSuccess) {
        console.log('🎉 [FLOW CONFIRM] ===============================================');
        console.log('🎉 [FLOW CONFIRM] PAYMENT SUCCESSFULLY CONFIRMED!');
        console.log('🎉 [FLOW CONFIRM] ===============================================');
        console.log('✅ [FLOW CONFIRM] Payment details:');
        console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
        console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
        console.log('   💰 Amount:', paymentStatus.amount);
        console.log('   👤 Payer:', paymentStatus.payer);
        console.log('   📅 Request Date:', paymentStatus.requestDate);
        if (paymentStatus.paymentData) {
          console.log('   💳 Payment Method:', paymentStatus.paymentData.media);
          console.log('   📅 Payment Date:', paymentStatus.paymentData.date);
        }
      } else {
        console.log('❌ [FLOW CONFIRM] ===============================================');
        console.log('❌ [FLOW CONFIRM] PAYMENT NOT SUCCESSFUL');
        console.log('❌ [FLOW CONFIRM] ===============================================');
        console.log('💔 [FLOW CONFIRM] Payment failure details:');
        console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
        console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
        console.log('   📊 Status Code:', paymentStatus.status);
        console.log('   💬 Status Message:', message);
        console.log('   💰 Amount:', paymentStatus.amount);
        console.log('   📅 Request Date:', paymentStatus.requestDate);
        if (paymentStatus.pending_info) {
          console.log('   ⏳ Pending Info:', paymentStatus.pending_info);
        }
      }

      console.log('📤 [FLOW CONFIRM] Preparing response for Flow...');
      const response = createFlowResponse(isSuccess, message, paymentStatus);
      
      console.log('🎯 [FLOW CONFIRM] ===============================================');
      console.log(`🎯 [FLOW CONFIRM] SENDING RESPONSE: ${isSuccess ? 'SUCCESS' : 'ERROR'}`);
      console.log('🎯 [FLOW CONFIRM] ===============================================');
      
      return response;

    } catch (verificationError) {
      console.error('💥 [FLOW CONFIRM] ===============================================');
      console.error('💥 [FLOW CONFIRM] ERROR VERIFYING PAYMENT STATUS');
      console.error('💥 [FLOW CONFIRM] ===============================================');
      console.error('💥 [FLOW CONFIRM] Error details:', verificationError);
      console.error('💥 [FLOW CONFIRM] Error type:', typeof verificationError);
      console.error('💥 [FLOW CONFIRM] Error message:', verificationError instanceof Error ? verificationError.message : 'Unknown error');
      console.error('💥 [FLOW CONFIRM] Error stack:', verificationError instanceof Error ? verificationError.stack : 'No stack trace');
      
      if (verificationError instanceof Error && verificationError.message.includes('Flow API error')) {
        console.error('🌐 [FLOW CONFIRM] This appears to be a Flow API communication error');
      }
      
      const errorResponse = NextResponse.json({
        status: 'error',
        message: 'Error verifying payment status',
        error: verificationError instanceof Error ? verificationError.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        token
      }, { status: 200 }); // Siempre 200 para Flow
      
      console.log('📤 [FLOW CONFIRM] Sending error response (verification failed)');
      return errorResponse;
    }

  } catch (error) {
    console.error('💥 [FLOW CONFIRM] ===============================================');
    console.error('💥 [FLOW CONFIRM] CRITICAL ERROR IN CONFIRMATION ENDPOINT');
    console.error('💥 [FLOW CONFIRM] ===============================================');
    console.error('💥 [FLOW CONFIRM] Error details:', error);
    console.error('💥 [FLOW CONFIRM] Error type:', typeof error);
    console.error('💥 [FLOW CONFIRM] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [FLOW CONFIRM] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const criticalErrorResponse = NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Siempre 200 para Flow
    
    console.log('📤 [FLOW CONFIRM] Sending critical error response');
    return criticalErrorResponse;
  } finally {
    console.log('🏁 [FLOW CONFIRM] ===============================================');
    console.log('🏁 [FLOW CONFIRM] CONFIRMATION ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [FLOW CONFIRM] ===============================================');
  }
}

/**
 * También manejar GET en caso de que Flow use GET para confirmación
 */
export async function GET(request: NextRequest) {
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
    const flowService = new FlowService({
      apiKey: process.env.FLOW_API_KEY!,
      secretKey: process.env.FLOW_SECRET_KEY!,
      baseUrl: process.env.FLOW_BASE_URL || 'sandbox.flow.cl'
    });
    
    console.log('📞 [FLOW CONFIRM GET] Calling Flow API...');
    const paymentStatus = await flowService.getPaymentStatus({ token });
    
    console.log('📥 [FLOW CONFIRM GET] Payment status received:', {
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder,
      status: paymentStatus.status,
      amount: paymentStatus.amount
    });
    
    // IMPORTANTE: Flow espera SIEMPRE status 200 para confirmar que recibimos la notificación
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
    
    // Incluso en caso de error, devolver 200 para Flow
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
 * Manejar OPTIONS para CORS
 */
export async function OPTIONS() {
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
