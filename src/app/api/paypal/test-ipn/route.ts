import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus } from '@/interfaces/tracking';
import { EmailService } from '@/lib/emailService';

/**
 * Endpoint temporal para probar el procesamiento de IPN sin verificación de PayPal
 * SOLO PARA DESARROLLO/TESTING
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [PAYPAL TEST] Testing PayPal IPN processing...');
    
    const body = await request.json();
    const { txnId, paypalTxnId, email, amount, currency } = body;
    
    console.log('📋 [PAYPAL TEST] Processing test data:', { txnId, paypalTxnId, email, amount, currency });
    
    if (!txnId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }
    
    // Buscar el tracking pendiente por transactionId
    const existingTracking = await FirebaseTrackingService.getTrackingByPaymentTransactionId(txnId);
    
    if (existingTracking) {
      console.log('✅ [PAYPAL TEST] Found existing tracking:', existingTracking.id);
      
      // Actualizar el tracking a estado MANUFACTURING (pago completado)
      const updatedTrackingData = {
        ...existingTracking,
        estadoPedido: OrderStatus.MANUFACTURING,
        abonadoUsd: parseFloat(amount || '0'),
        paymentStatus: 'COMPLETED',
        paypalTransactionId: paypalTxnId,
        paymentDate: new Date().toISOString()
      };
      
      // Actualizar en Firebase
      if (existingTracking.id) {
        await FirebaseTrackingService.updateTracking(existingTracking.id, updatedTrackingData);
        console.log('🎯 [PAYPAL TEST] Tracking updated successfully to MANUFACTURING status');
      }
      
      // Enviar correo de confirmación usando los datos completos del tracking
      console.log('📧 [PAYPAL TEST] Sending purchase confirmation email...');
      try {
        const orderDetails = {
          transactionId: txnId,
          amount: parseFloat(amount || '0'),
          currency: currency || 'USD',
          trackers: existingTracking.numeroTrackers,
          sensor: existingTracking.sensor,
          colors: {
            case: existingTracking.colorCase,
            tapa: existingTracking.colorTapa
          },
          shippingAddress: {
            direccion: existingTracking.shippingAddress?.direccion || 'Dirección no disponible',
            ciudad: existingTracking.shippingAddress?.ciudad || 'Ciudad no disponible',
            estado: existingTracking.shippingAddress?.estado || 'Estado no disponible',
            pais: existingTracking.paisEnvio || 'País no disponible'
          },
          paymentMethod: 'PayPal',
          orderDate: new Date().toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        console.log('📨 [PAYPAL TEST] Email details:', {
          to: existingTracking.contacto,
          username: existingTracking.vrchatUsername || 'Usuario',
          trackingHash: existingTracking.userHash,
          orderDetails
        });

        const emailSent = await EmailService.sendPurchaseConfirmation(
          existingTracking.contacto,
          existingTracking.vrchatUsername || 'Usuario',
          existingTracking.userHash!,
          orderDetails
        );

        if (emailSent) {
          console.log('✅ [PAYPAL TEST] Purchase confirmation email sent successfully');
          return NextResponse.json({
            success: true,
            message: 'Tracking updated and email sent successfully',
            trackingId: existingTracking.userHash,
            emailSent: true
          });
        } else {
          console.warn('⚠️ [PAYPAL TEST] Failed to send purchase confirmation email');
          return NextResponse.json({
            success: true,
            message: 'Tracking updated but email failed',
            trackingId: existingTracking.userHash,
            emailSent: false
          });
        }
      } catch (emailError) {
        console.error('❌ [PAYPAL TEST] Error sending purchase confirmation email:', emailError);
        return NextResponse.json({
          success: true,
          message: 'Tracking updated but email error',
          trackingId: existingTracking.userHash,
          emailSent: false,
          emailError: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
      
    } else {
      console.error('❌ [PAYPAL TEST] No pending tracking found for transaction ID:', txnId);
      return NextResponse.json({ 
        error: 'No pending tracking found',
        txnId 
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('❌ [PAYPAL TEST] Error processing test IPN:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
