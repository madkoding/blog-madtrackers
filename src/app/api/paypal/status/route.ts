import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';

/**
 * API endpoint para verificar el estado de un pago PayPal usando el tracking ID
 */
export async function GET(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 =================== PAYPAL STATUS ENDPOINT ===================');
  console.log('🚀 =================================================================');
  console.log('⏰ [PAYPAL STATUS] Timestamp:', new Date().toISOString());
  console.log('🌐 [PAYPAL STATUS] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [PAYPAL STATUS] Request URL:', request.url);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log('📋 [PAYPAL STATUS] Search params:', Object.fromEntries(searchParams.entries()));
    
    const transactionId = searchParams.get('transactionId');
    const trackingId = searchParams.get('trackingId');
    
    console.log('🎫 [PAYPAL STATUS] Transaction ID:', transactionId || 'NO_TRANSACTION_ID');
    console.log('🎯 [PAYPAL STATUS] Tracking ID:', trackingId || 'NO_TRACKING_ID');

    if (!transactionId && !trackingId) {
      console.error('💥 [PAYPAL STATUS] No transactionId or trackingId provided');
      return NextResponse.json(
        { 
          error: 'Transaction ID or Tracking ID required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.log('🔍 [PAYPAL STATUS] Searching for PayPal tracking...');

    let tracking = null;

    // Buscar por tracking ID si se proporciona
    if (trackingId) {
      console.log('🎯 [PAYPAL STATUS] Searching by tracking ID:', trackingId);
      tracking = await FirebaseTrackingService.getTrackingByUserHash(trackingId);
    }

    // Si no se encuentra por tracking ID, buscar por transaction ID
    if (!tracking && transactionId) {
      console.log('💳 [PAYPAL STATUS] Searching by transaction ID:', transactionId);
      const allTrackings = await FirebaseTrackingService.getAllTrackings();
      tracking = allTrackings.find(t => 
        t.paymentTransactionId === transactionId && 
        t.paymentMethod === 'PayPal'
      );
    }

    if (!tracking) {
      console.log('⚠️ [PAYPAL STATUS] No tracking found for PayPal payment');
      return NextResponse.json({
        success: false,
        error: 'No tracking found for this PayPal payment',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    console.log('✅ [PAYPAL STATUS] Found PayPal tracking:', {
      id: tracking.id,
      userHash: tracking.userHash,
      paymentMethod: tracking.paymentMethod,
      paymentStatus: tracking.paymentStatus,
      estadoPedido: tracking.estadoPedido
    });

    // Mapear el estado del tracking a un formato similar al de Flow
    const getPayPalStatus = () => {
      // Para PayPal, si existe el tracking significa que el pago fue exitoso
      return {
        status: 1, // Siempre exitoso si existe el tracking
        statusText: 'Pagado',
        isPaymentSuccessful: true
      };
    };

    const { status, statusText, isPaymentSuccessful } = getPayPalStatus();

    const responseData = {
      success: true,
      payment: {
        transactionId: tracking.paymentTransactionId,
        status,
        statusText,
        isPaymentSuccessful,
        amount: tracking.abonadoUsd?.toString() || tracking.totalUsd?.toString() || '0',
        currency: tracking.paymentCurrency || 'USD',
        payer: tracking.contacto,
        paymentMethod: 'PayPal',
        trackingId: tracking.userHash, // Este es el tracking ID que necesita la página
        username: tracking.nombreUsuario,
        orderDate: tracking.createdAt
      },
      timestamp: new Date().toISOString()
    };

    console.log('📤 [PAYPAL STATUS] Preparing response...');
    console.log('📊 [PAYPAL STATUS] Response data:', JSON.stringify(responseData, null, 2));

    const response = NextResponse.json(responseData);
    
    console.log('✅ [PAYPAL STATUS] Successfully sending PayPal status response');
    return response;

  } catch (error) {
    console.error('💥 [PAYPAL STATUS] ===============================================');
    console.error('💥 [PAYPAL STATUS] ERROR CHECKING PAYPAL PAYMENT STATUS');
    console.error('💥 [PAYPAL STATUS] ===============================================');
    console.error('💥 [PAYPAL STATUS] Error details:', error);
    console.error('💥 [PAYPAL STATUS] Error type:', typeof error);
    console.error('💥 [PAYPAL STATUS] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [PAYPAL STATUS] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = 'Error interno del servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const errorResponse = NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
    
    console.log('📤 [PAYPAL STATUS] Sending error response');
    return errorResponse;
  } finally {
    console.log('🏁 [PAYPAL STATUS] ===============================================');
    console.log('🏁 [PAYPAL STATUS] STATUS ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [PAYPAL STATUS] ===============================================');
  }
}
