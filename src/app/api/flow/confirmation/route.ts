import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

/**
 * API endpoint para recibir confirmaciones de pago de Flow
 * Flow llama a esta URL cuando el estado de un pago cambia
 */
export async function POST(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 ================ FLOW CONFIRMATION2 ENDPOINT =================');
  console.log('🚀 =================================================================');
  console.log('⏰ [FLOW CONFIRMATION2] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW CONFIRMATION2] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW CONFIRMATION2] Request URL:', request.url);
  console.log('📍 [FLOW CONFIRMATION2] Request method:', request.method);
  
  // Log todos los headers
  console.log('📋 [FLOW CONFIRMATION2] All headers:');
  const headers = Object.fromEntries(request.headers.entries());
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  try {
    console.log('🏁 [FLOW CONFIRMATION2] Starting confirmation process...');
    
    console.log('📄 [FLOW CONFIRMATION2] Reading form data...');
    const formData = await request.formData();
    
    console.log('📋 [FLOW CONFIRMATION2] Form data entries:');
    for (const [key, value] of formData.entries()) {
      const valueString = typeof value === 'string' ? value : JSON.stringify(value);
      console.log(`   ${key}: ${valueString}`);
    }
    
    const token = formData.get('token') as string;
    console.log('🎫 [FLOW CONFIRMATION2] Extracted token:', token || 'NO_TOKEN');

    if (!token) {
      console.error('💥 [FLOW CONFIRMATION2] No token provided in form data');
      return NextResponse.json(
        { 
          error: 'Token no proporcionado',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.log('🔧 [FLOW CONFIRMATION2] Initializing FlowService...');
    // Configurar el servicio Flow
    const flowService = getFlowService();

    console.log('📞 [FLOW CONFIRMATION2] Calling Flow API to get payment status...');
    console.log('🎫 [FLOW CONFIRMATION2] Using token:', token);

    // Obtener el estado del pago
    const paymentStatus = await flowService.getPaymentStatus({ token });

    console.log('📥 [FLOW CONFIRMATION2] Payment status received:');
    console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
    console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
    console.log('   📊 Status:', paymentStatus.status);
    console.log('   💰 Amount:', paymentStatus.amount);
    console.log('   💰 Currency:', paymentStatus.currency);
    console.log('   👤 Payer:', paymentStatus.payer);

    // Log para debugging (remover en producción)
    console.log('📋 [FLOW CONFIRMATION2] Complete payment confirmation data:', {
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder,
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      payer: paymentStatus.payer,
      requestDate: paymentStatus.requestDate,
      paymentData: paymentStatus.paymentData
    });

    // Aquí puedes agregar tu lógica de negocio
    // Por ejemplo, actualizar el estado del pedido en tu base de datos
    if (paymentStatus.status === 1) {
      // Pago exitoso
      console.log('🎉 [FLOW CONFIRMATION2] ===============================================');
      console.log('🎉 [FLOW CONFIRMATION2] PAYMENT SUCCESSFUL!');
      console.log('🎉 [FLOW CONFIRMATION2] ===============================================');
      console.log(`✅ [FLOW CONFIRMATION2] Successful payment: ${paymentStatus.commerceOrder} for ${paymentStatus.amount} ${paymentStatus.currency}`);
      
      // Implementar lógica específica del negocio:
      // - Actualizar estado del pedido en base de datos
      // - Enviar email de confirmación al cliente
      // - Activar servicios o productos comprados
      // - Notificar al equipo de ventas
      
    } else if (paymentStatus.status === 0) {
      // Pago pendiente
      console.log('⏳ [FLOW CONFIRMATION2] ===============================================');
      console.log('⏳ [FLOW CONFIRMATION2] PAYMENT PENDING');
      console.log('⏳ [FLOW CONFIRMATION2] ===============================================');
      console.log(`⏳ [FLOW CONFIRMATION2] Pending payment: ${paymentStatus.commerceOrder}`);
    } else {
      // Pago fallido o cancelado
      console.log('❌ [FLOW CONFIRMATION2] ===============================================');
      console.log('❌ [FLOW CONFIRMATION2] PAYMENT FAILED/CANCELLED');
      console.log('❌ [FLOW CONFIRMATION2] ===============================================');
      console.log(`❌ [FLOW CONFIRMATION2] Failed/cancelled payment: ${paymentStatus.commerceOrder} (Status: ${paymentStatus.status})`);
    }

    console.log('📤 [FLOW CONFIRMATION2] Sending success response to Flow...');
    
    // Flow espera una respuesta HTTP 200 para confirmar que recibimos la notificación
    const response = NextResponse.json({ 
      success: true,
      timestamp: new Date().toISOString(),
      processed: true
    });
    
    console.log('✅ [FLOW CONFIRMATION2] Successfully processed Flow confirmation');
    return response;

  } catch (error) {
    console.error('💥 [FLOW CONFIRMATION2] ===============================================');
    console.error('💥 [FLOW CONFIRMATION2] ERROR PROCESSING FLOW CONFIRMATION');
    console.error('💥 [FLOW CONFIRMATION2] ===============================================');
    console.error('💥 [FLOW CONFIRMATION2] Error details:', error);
    console.error('💥 [FLOW CONFIRMATION2] Error type:', typeof error);
    console.error('💥 [FLOW CONFIRMATION2] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [FLOW CONFIRMATION2] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Es importante devolver un error para que Flow reintente la notificación
    const errorResponse = NextResponse.json(
      { 
        error: 'Error procesando confirmación',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
    
    console.log('📤 [FLOW CONFIRMATION2] Sending error response');
    return errorResponse;
  } finally {
    console.log('🏁 [FLOW CONFIRMATION2] ===============================================');
    console.log('🏁 [FLOW CONFIRMATION2] CONFIRMATION2 ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [FLOW CONFIRMATION2] ===============================================');
  }
}
