import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus } from '@/interfaces/tracking';

/**
 * API endpoint para marcar un pago de PayPal como completado
 * Este endpoint se llama cuando el usuario vuelve exitosamente de PayPal
 */
export async function POST(request: NextRequest) {
  const requestId = Date.now().toString().slice(-6);
  
  try {
    console.log(`🎉 [PAYPAL COMPLETE ${requestId}] Marking PayPal payment as completed`);
    
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    const trackingId = searchParams.get('trackingId');
    
    console.log(`🔍 [PAYPAL COMPLETE ${requestId}] Parameters:`, { transactionId, trackingId });

    if (!transactionId && !trackingId) {
      console.error(`❌ [PAYPAL COMPLETE ${requestId}] No transaction ID or tracking ID provided`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Transaction ID or Tracking ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Buscar el tracking pendiente
    let existingTracking;
    
    if (transactionId) {
      console.log(`🔍 [PAYPAL COMPLETE ${requestId}] Searching by transaction ID:`, transactionId);
      existingTracking = await FirebaseTrackingService.getTrackingByPaymentTransactionId(transactionId);
    } else if (trackingId) {
      console.log(`🔍 [PAYPAL COMPLETE ${requestId}] Searching by tracking ID:`, trackingId);
      existingTracking = await FirebaseTrackingService.getTrackingByUserHash(trackingId);
    }

    if (!existingTracking) {
      console.error(`❌ [PAYPAL COMPLETE ${requestId}] No tracking found for the provided ID`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Tracking not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    console.log(`✅ [PAYPAL COMPLETE ${requestId}] Found tracking:`, {
      id: existingTracking.id,
      status: existingTracking.estadoPedido,
      paymentStatus: existingTracking.paymentStatus,
      currentAmount: existingTracking.abonadoUsd
    });

    // Si el pago ya está completado, devolver la información actual
    if (existingTracking.paymentStatus === 'COMPLETED' || existingTracking.estadoPedido === OrderStatus.WAITING) {
      console.log(`ℹ️ [PAYPAL COMPLETE ${requestId}] Payment already completed, returning existing data`);
      return NextResponse.json({
        success: true,
        message: 'Payment already completed',
        payment: {
          transactionId: existingTracking.paymentTransactionId,
          trackingId: existingTracking.userHash,
          status: 200,
          statusText: 'Payment Successful',
          isPaymentSuccessful: true,
          amount: existingTracking.abonadoUsd?.toString() || '0',
          currency: existingTracking.paymentCurrency || 'USD',
          payer: existingTracking.contacto,
          paymentMethod: 'PayPal',
          username: existingTracking.nombreUsuario,
          orderDate: existingTracking.createdAt || new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    // Actualizar el tracking a estado exitoso
    const updatedTrackingData = {
      ...existingTracking,
      estadoPedido: OrderStatus.WAITING, // El pago está completado, ahora en espera de fabricación
      paymentStatus: 'COMPLETED',
      paymentCompletedAt: new Date().toISOString(),
      // Actualizar el monto pagado si no estaba establecido (importante para anticipos)
      ...(existingTracking.abonadoUsd === 0 && existingTracking.totalUsd && {
        abonadoUsd: existingTracking.totalUsd * 0.25 // 25% para anticipo
      })
    };

    console.log(`🔄 [PAYPAL COMPLETE ${requestId}] Updating tracking with:`, {
      newStatus: updatedTrackingData.estadoPedido,
      newPaymentStatus: updatedTrackingData.paymentStatus,
      newAbonadoUsd: updatedTrackingData.abonadoUsd
    });

    // Actualizar en Firebase
    if (existingTracking.id) {
      await FirebaseTrackingService.updateTracking(existingTracking.id, updatedTrackingData);
      console.log(`🎯 [PAYPAL COMPLETE ${requestId}] Payment marked as completed successfully`);
    }

    // Devolver información del pago exitoso
    const successResponse = {
      success: true,
      message: 'Payment completed successfully',
      payment: {
        transactionId: existingTracking.paymentTransactionId,
        trackingId: existingTracking.userHash,
        status: 200,
        statusText: 'Payment Successful',
        isPaymentSuccessful: true,
        amount: updatedTrackingData.abonadoUsd?.toString() || existingTracking.abonadoUsd?.toString() || '0',
        currency: existingTracking.paymentCurrency || 'USD',
        payer: existingTracking.contacto,
        paymentMethod: 'PayPal',
        username: existingTracking.nombreUsuario,
        orderDate: existingTracking.createdAt || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ [PAYPAL COMPLETE ${requestId}] Success response prepared`);
    return NextResponse.json(successResponse);

  } catch (error) {
    console.error(`❌ [PAYPAL COMPLETE ${requestId}] Error completing PayPal payment:`, error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
