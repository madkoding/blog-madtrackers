import { NextRequest, NextResponse } from 'next/server';
import { getFlowService, FlowPaymentStatusResponse } from '@/lib/flowService';

/**
 * Actualiza un tracking pendiente o crea uno nuevo para un pago exitoso
 */
async function updateOrCreateTrackingForSuccessfulPayment(statusResponse: FlowPaymentStatusResponse): Promise<string | null> {
  try {
    console.log('🎯 [FLOW STATUS] Processing tracking for successful payment...');
    
    // Los datos del usuario están directamente en optional, no en optional.userData
    const userData = statusResponse.optional;
    if (!userData) {
      console.log('⚠️ [FLOW STATUS] No optional data found in payment response');
      return null;
    }

    console.log('📋 [FLOW STATUS] Found userData:', userData);

    // Primero intentar actualizar un tracking existente
    const updatePayload = {
      commerceOrder: statusResponse.commerceOrder,
      flowOrder: statusResponse.flowOrder,
      amount: statusResponse.amount,
      payer: statusResponse.payer,
      paymentData: statusResponse.paymentData
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const updateResponse = await fetch(`${baseUrl}/api/flow/update-tracking`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ [FLOW STATUS] Existing tracking updated successfully:', result);
      console.log('🎯 [FLOW STATUS] Returning trackingId from update:', result.trackingId);
      console.log('🎯 [FLOW STATUS] userHash from update:', result.userHash);
      return result.trackingId || result.userHash || null;
    }
    
    // Si no hay tracking existente, crear uno nuevo
    if (updateResponse.status === 404) {
      console.log('📝 [FLOW STATUS] No pending tracking found, creating new one...');
      
      const successPayload = {
        commerceOrder: statusResponse.commerceOrder,
        flowOrder: statusResponse.flowOrder,
        amount: statusResponse.amount,
        currency: statusResponse.currency,
        payer: statusResponse.payer,
        paymentData: statusResponse.paymentData,
        userData: userData,
        productData: {}
      };

      const createResponse = await fetch(`${baseUrl}/api/flow/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(successPayload)
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('✅ [FLOW STATUS] New tracking created successfully:', result);
        console.log('🎯 [FLOW STATUS] Returning trackingId from creation:', result.trackingId);
        console.log('🎯 [FLOW STATUS] userHash from creation:', result.userHash);
        return result.trackingId || result.userHash || null;
      } else {
        const errorText = await createResponse.text();
        console.error('❌ [FLOW STATUS] Error creating new tracking:', errorText);
        return null;
      }
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ [FLOW STATUS] Error updating existing tracking:', errorText);
      return null;
    }
  } catch (error) {
    console.error('❌ [FLOW STATUS] Exception processing tracking:', error);
    throw error;
  }
}

/**
 * API endpoint para verificar el estado de un pago Flow
 */
export async function GET(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 =================== FLOW STATUS ENDPOINT =====================');
  console.log('🚀 =================================================================');
  console.log('⏰ [FLOW STATUS] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW STATUS] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW STATUS] Request URL:', request.url);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log('📋 [FLOW STATUS] Search params:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token');
    console.log('🎫 [FLOW STATUS] Token:', token || 'NO_TOKEN');

    if (!token) {
      console.error('💥 [FLOW STATUS] No token provided in status request');
      return NextResponse.json(
        { 
          error: 'Token no proporcionado',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.log('🔧 [FLOW STATUS] Initializing FlowService...');
    console.log('🔑 [FLOW STATUS] API Key:', process.env.FLOW_API_KEY ? 'SET' : 'NOT_SET');
    console.log('🔐 [FLOW STATUS] Secret Key:', process.env.FLOW_SECRET_KEY ? 'SET' : 'NOT_SET');
    console.log('🌐 [FLOW STATUS] Base URL:', process.env.FLOW_BASE_URL || 'sandbox.flow.cl');

    // Configurar el servicio Flow
    const flowService = getFlowService();

    console.log('📞 [FLOW STATUS] Calling Flow API to get payment status...');
    console.log('🎫 [FLOW STATUS] Using token:', token);

    // Obtener el estado del pago
    const paymentStatus = await flowService.getPaymentStatus({ token });

    console.log('📥 [FLOW STATUS] Payment status response received:');
    console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
    console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
    console.log('   📊 Status:', paymentStatus.status);
    console.log('   💰 Amount:', paymentStatus.amount);
    console.log('   👤 Payer:', paymentStatus.payer);
    console.log('   📅 Request Date:', paymentStatus.requestDate);
    console.log('   💳 Payment Data:', paymentStatus.paymentData);
    console.log('   ⏳ Pending Info:', paymentStatus.pending_info);
    console.log('📋 [FLOW STATUS] Full payment status object:', JSON.stringify(paymentStatus, null, 2));

    // Mapear estados de Flow a estados legibles
    const getStatusText = (status: number, paymentData?: FlowPaymentStatusResponse['paymentData']): { statusCode: number; statusText: string; isSuccess: boolean } => {
      console.log(`🔍 [FLOW STATUS] Mapping status ${status} to text...`);
      console.log(`🔍 [FLOW STATUS] Payment data present: ${paymentData ? 'YES' : 'NO'}`);
      
      if (paymentData) {
        console.log('💳 [FLOW STATUS] Payment data details:', paymentData);
      }
      
      // Si hay paymentData con fecha, media y monto, considerar como exitoso
      // independientemente del status (problema conocido de Flow)
      if (paymentData?.date && paymentData?.media && paymentData?.amount) {
        console.log('🎉 [FLOW STATUS] OVERRIDE: PaymentData indicates successful payment despite status 2');
        console.log('💰 [FLOW STATUS] Payment amount:', paymentData.amount);
        console.log('💳 [FLOW STATUS] Payment method:', paymentData.media);
        console.log('📅 [FLOW STATUS] Payment date:', paymentData.date);
        console.log('💸 [FLOW STATUS] Flow fee:', paymentData.fee);
        console.log('💵 [FLOW STATUS] Available balance:', paymentData.balance);
        
        return { statusCode: 1, statusText: 'Pagado (Verificado)', isSuccess: true };
      }
      
      let statusText: string;
      let isSuccess: boolean;
      
      switch (status) {
        case 1: 
          statusText = 'Pagado';
          isSuccess = true;
          console.log('✅ [FLOW STATUS] Status 1: Pagado');
          break;
        case 2: 
          statusText = 'Rechazado';
          isSuccess = false;
          console.log('❌ [FLOW STATUS] Status 2: Rechazado');
          break;
        case 3: 
          statusText = 'Pendiente';
          isSuccess = false;
          console.log('⏳ [FLOW STATUS] Status 3: Pendiente');
          break;
        case 4: 
          statusText = 'Anulado';
          isSuccess = false;
          console.log('🚫 [FLOW STATUS] Status 4: Anulado');
          break;
        default: 
          statusText = 'Pendiente';
          isSuccess = false;
          console.log(`❓ [FLOW STATUS] Unknown status ${status}, defaulting to Pendiente`);
          break;
      }
      
      console.log(`📝 [FLOW STATUS] Status ${status} mapped to: ${statusText}`);
      return { statusCode: status, statusText, isSuccess };
    };

    const { statusCode, statusText, isSuccess } = getStatusText(paymentStatus.status, paymentStatus.paymentData);

    // Si el pago es exitoso y tenemos optional data, intentar crear el tracking si no existe
    let trackingId = null;
    if (isSuccess && paymentStatus.optional) {
      console.log('🎯 [FLOW STATUS] Payment is successful and optional data found, creating/updating tracking...');
      try {
        trackingId = await updateOrCreateTrackingForSuccessfulPayment(paymentStatus);
        console.log('🎯 [FLOW STATUS] Tracking operation result - trackingId:', trackingId);
      } catch (trackingError) {
        console.error('❌ [FLOW STATUS] Error creating tracking:', trackingError);
        // No fallar la consulta de status por un error de tracking
      }
    } else {
      console.log('🚫 [FLOW STATUS] Not creating tracking. isSuccess:', isSuccess, 'optional data present:', !!paymentStatus.optional);
    }

    const responseData = {
      success: true,
      payment: {
        flowOrder: paymentStatus.flowOrder,
        commerceOrder: paymentStatus.commerceOrder,
        status: statusCode, // Usar el statusCode calculado (puede ser override)
        originalStatus: paymentStatus.status, // Mantener el status original para referencia
        statusText,
        isPaymentSuccessful: isSuccess, // Indicador claro de éxito
        subject: paymentStatus.subject,
        currency: paymentStatus.currency,
        amount: paymentStatus.amount,
        payer: paymentStatus.payer,
        requestDate: paymentStatus.requestDate,
        paymentData: paymentStatus.paymentData,
        pending_info: paymentStatus.pending_info,
        trackingId: trackingId // Añadir el tracking ID si se creó
      },
      timestamp: new Date().toISOString()
    };

    console.log('📤 [FLOW STATUS] Preparing response...');
    console.log('📊 [FLOW STATUS] Response data:', JSON.stringify(responseData, null, 2));

    const response = NextResponse.json(responseData);
    
    console.log('✅ [FLOW STATUS] Successfully sending payment status response');
    return response;

  } catch (error) {
    console.error('💥 [FLOW STATUS] ===============================================');
    console.error('💥 [FLOW STATUS] ERROR CHECKING FLOW PAYMENT STATUS');
    console.error('💥 [FLOW STATUS] ===============================================');
    console.error('💥 [FLOW STATUS] Error details:', error);
    console.error('💥 [FLOW STATUS] Error type:', typeof error);
    console.error('💥 [FLOW STATUS] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [FLOW STATUS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = 'Error interno del servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Flow API error')) {
        console.error('🌐 [FLOW STATUS] This appears to be a Flow API communication error');
      }
    }

    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
    
    console.log('📤 [FLOW STATUS] Sending error response');
    return errorResponse;
  } finally {
    console.log('🏁 [FLOW STATUS] ===============================================');
    console.log('🏁 [FLOW STATUS] STATUS ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [FLOW STATUS] ===============================================');
  }
}
