import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

/**
 * API endpoint para crear un pago con Flow
 */
export async function POST(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 ==================== FLOW CREATE ENDPOINT ====================');
  console.log('🚀 =================================================================');
  console.log('⏰ [FLOW CREATE] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW CREATE] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW CREATE] Request URL:', request.url);
  
  try {
    console.log('🏁 [FLOW CREATE] Starting payment creation process...');
    
    const body = await request.json();
    console.log('📄 [FLOW CREATE] Request body:', body);
    
    const { amount, description, email } = body;
    console.log('📊 [FLOW CREATE] Extracted parameters:');
    console.log('   💰 Amount:', amount);
    console.log('   📝 Description:', description);
    console.log('   📧 Email:', email);

    // Validar parámetros requeridos
    if (!amount || !description || !email) {
      console.error('💥 [FLOW CREATE] Missing required parameters');
      console.error('   Amount:', amount ? 'PROVIDED' : 'MISSING');
      console.error('   Description:', description ? 'PROVIDED' : 'MISSING');
      console.error('   Email:', email ? 'PROVIDED' : 'MISSING');
      
      return NextResponse.json(
        { 
          error: 'Amount, description y email son requeridos',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Generar ID único para la orden
    const orderPrefix = process.env.FLOW_ORDER_PREFIX || 'MT';
    const commerceOrder = `${orderPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    console.log('🆔 [FLOW CREATE] Generated commerce order ID:', commerceOrder);
    
    // Obtener la URL base del sitio
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    console.log('🌐 [FLOW CREATE] Base URL:', baseUrl);

    console.log('🔧 [FLOW CREATE] Initializing FlowService...');
    console.log('🔑 [FLOW CREATE] Environment variables:');
    console.log('   FLOW_ORDER_PREFIX:', orderPrefix);
    console.log('   FLOW_CURRENCY:', process.env.FLOW_CURRENCY || 'CLP');
    console.log('   FLOW_PAYMENT_METHOD:', process.env.FLOW_PAYMENT_METHOD || '9');
    console.log('   FLOW_TIMEOUT:', process.env.FLOW_TIMEOUT || '3600');
    console.log('   NEXT_PUBLIC_BASE_URL:', baseUrl);

    // Configurar el servicio Flow
    const flowService = getFlowService();

    // Preparar datos del pago
    const paymentParams = {
      commerceOrder,
      subject: description,
      currency: process.env.FLOW_CURRENCY || 'CLP',
      amount: Math.round(amount), // Flow requiere enteros para CLP
      email,
      urlConfirmation: `${baseUrl}/api/flow/confirm`,
      urlReturn: `${baseUrl}/api/flow/return?flow=true`,
      paymentMethod: parseInt(process.env.FLOW_PAYMENT_METHOD || '9'), // Todos los medios de pago
      optional: JSON.stringify({
        source: process.env.FLOW_SOURCE || 'madtrackers',
        type: process.env.FLOW_PAYMENT_TYPE || 'advance_payment'
      }),
      timeout: parseInt(process.env.FLOW_TIMEOUT || '3600') // 1 hora de expiración
    };

    console.log('📋 [FLOW CREATE] Payment parameters prepared:', {
      ...paymentParams,
      optional: 'JSON_STRING' // No mostrar el JSON completo en el log
    });

    console.log('📞 [FLOW CREATE] Calling Flow API to create payment...');

    // Crear el pago en Flow
    const paymentData = await flowService.createPayment(paymentParams);

    console.log('📥 [FLOW CREATE] Payment created successfully!');
    console.log('   🔗 Payment URL:', paymentData.url);
    console.log('   🎫 Token:', paymentData.token);
    console.log('   🆔 Flow Order:', paymentData.flowOrder);

    const fullPaymentUrl = `${paymentData.url}?token=${paymentData.token}`;
    console.log('🎯 [FLOW CREATE] Complete payment URL:', fullPaymentUrl);

    const responseData = {
      success: true,
      paymentUrl: fullPaymentUrl,
      flowOrder: paymentData.flowOrder,
      commerceOrder,
      token: paymentData.token,
      timestamp: new Date().toISOString()
    };

    console.log('📤 [FLOW CREATE] Sending success response:', responseData);
    console.log('✅ [FLOW CREATE] Payment creation completed successfully');

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 [FLOW CREATE] ===============================================');
    console.error('💥 [FLOW CREATE] ERROR CREATING FLOW PAYMENT');
    console.error('💥 [FLOW CREATE] ===============================================');
    console.error('💥 [FLOW CREATE] Error details:', error);
    console.error('💥 [FLOW CREATE] Error type:', typeof error);
    console.error('💥 [FLOW CREATE] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [FLOW CREATE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = 'Error interno del servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Flow API error')) {
        console.error('🌐 [FLOW CREATE] This appears to be a Flow API communication error');
      }
    }

    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );

    console.log('📤 [FLOW CREATE] Sending error response');
    return errorResponse;
  } finally {
    console.log('🏁 [FLOW CREATE] ===============================================');
    console.log('🏁 [FLOW CREATE] CREATE ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [FLOW CREATE] ===============================================');
  }
}
