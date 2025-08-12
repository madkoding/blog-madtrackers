import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus } from '@/interfaces/tracking';
import { EmailService } from '@/lib/emailService';

/**
 * API endpoint para actualizar un tracking pendiente a completado
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 [FLOW UPDATE] Starting tracking update for successful payment...');
    
    const body = await request.json();
    console.log('📄 [FLOW UPDATE] Request body:', body);
    
    const { 
      commerceOrder,
      flowOrder,
      amount, 
      payer,
      paymentData
    } = body;

    // Validar parámetros requeridos
    if (!commerceOrder || !flowOrder || !amount || !payer) {
      console.error('❌ [FLOW UPDATE] Missing required parameters');
      return NextResponse.json({ 
        error: 'Missing required parameters: commerceOrder, flowOrder, amount, payer' 
      }, { status: 400 });
    }

    // Buscar el tracking por commerceOrder (paymentTransactionId)
    console.log('🔍 [FLOW UPDATE] Searching for pending tracking...');
    
    // Buscar por paymentTransactionId que debería ser el commerceOrder
    const allTrackings = await FirebaseTrackingService.getAllTrackings();
    const pendingTracking = allTrackings.find(tracking => 
      tracking.paymentTransactionId === commerceOrder && 
      tracking.paymentStatus === 'PENDING'
    );

    if (!pendingTracking) {
      console.log('⚠️ [FLOW UPDATE] No pending tracking found for commerce order:', commerceOrder);
      return NextResponse.json({ 
        error: 'No pending tracking found for this payment' 
      }, { status: 404 });
    }

    console.log('✅ [FLOW UPDATE] Found pending tracking:', pendingTracking.id);

    // Actualizar el tracking con información del pago completado
    const updateData = {
      paymentStatus: 'COMPLETED',
      paymentFlowOrder: flowOrder,
      paymentData: paymentData,
      abonadoUsd: Math.round(parseFloat(amount) / 920), // Convertir CLP a USD aprox
      estadoPedido: OrderStatus.WAITING, // Cambiar de PENDING_PAYMENT a WAITING
      isPendingPayment: false,
      paymentCompletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await FirebaseTrackingService.updateTracking(pendingTracking.id!, updateData);
    
    const updatedTracking = await FirebaseTrackingService.getTrackingById(pendingTracking.id!);

    // Enviar correo de confirmación de compra
    console.log('📧 [FLOW UPDATE] Sending purchase confirmation email...');
    try {
      const orderDetails = {
        transactionId: commerceOrder,
        amount: Math.round(parseFloat(amount) / 900), // Conversión aproximada de CLP a USD
        currency: 'USD',
        trackers: pendingTracking.numeroTrackers || 5,
        sensor: pendingTracking.sensor || 'ICM45686 + QMC6309',
        colors: {
          case: pendingTracking.colorCase || 'black',
          tapa: pendingTracking.colorTapa || 'black'
        },
        shippingAddress: {
          direccion: pendingTracking.shippingAddress?.direccion || 'No especificada',
          ciudad: pendingTracking.shippingAddress?.ciudad || 'No especificada', 
          estado: pendingTracking.shippingAddress?.estado || 'No especificado',
          pais: pendingTracking.shippingAddress?.pais || pendingTracking.paisEnvio || 'Chile'
        },
        paymentMethod: 'Flow (Webpay)',
        orderDate: new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const emailSent = await EmailService.sendPurchaseConfirmation(
        pendingTracking.contacto,
        pendingTracking.vrchatUsername || 'Usuario',
        pendingTracking.userHash!,
        orderDetails
      );

      if (emailSent) {
        console.log('✅ [FLOW UPDATE] Purchase confirmation email sent successfully');
      } else {
        console.warn('⚠️ [FLOW UPDATE] Failed to send purchase confirmation email');
      }
    } catch (emailError) {
      console.error('❌ [FLOW UPDATE] Error sending purchase confirmation email:', emailError);
    }

    console.log('🎯 [FLOW UPDATE] Tracking updated successfully:', {
      trackingId: pendingTracking.userHash,
      username: pendingTracking.nombreUsuario,
      userHash: pendingTracking.userHash,
      paymentMethod: 'Flow',
      commerceOrder,
      flowOrder,
      newStatus: 'COMPLETED'
    });

    return NextResponse.json({
      success: true,
      trackingId: pendingTracking.userHash,
      username: pendingTracking.nombreUsuario,
      userHash: pendingTracking.userHash,
      message: 'Tracking updated successfully for completed payment',
      tracking: updatedTracking
    });

  } catch (error) {
    console.error('❌ [FLOW UPDATE] Error updating tracking:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
