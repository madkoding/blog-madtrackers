import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus } from '@/interfaces/tracking';
import { EmailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [PAYPAL IPN] Received PayPal IPN notification...');
    
    // Obtener el cuerpo de la petición
    const body = await request.text();
    
    // Verificar la notificación con PayPal
    const verificationData = 'cmd=_notify-validate&' + body;
    
    // Determinar si usar sandbox o producción (live)
    const isProduction = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'live';
    const ipnUrl = isProduction 
      ? 'https://ipnpb.paypal.com/cgi-bin/webscr'
      : 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';
    
    console.log('🌐 [PAYPAL IPN] Environment:', process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox');
    console.log('🔗 [PAYPAL IPN] Using IPN URL:', ipnUrl);
    
    const verificationResponse = await fetch(ipnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verificationData,
    });
    
    const verificationResult = await verificationResponse.text();
    
    if (verificationResult === 'VERIFIED') {
      // Parsear los datos de PayPal
      const params = new URLSearchParams(body);
      const paymentStatus = params.get('payment_status');
      const transactionId = params.get('txn_id');
      const payerEmail = params.get('payer_email');
      const amount = params.get('mc_gross');
      const currency = params.get('mc_currency');
      const custom = params.get('custom'); // Nuestro ID de transacción personalizado
      
      console.log('✅ [PAYPAL IPN] Payment verified:', {
        paymentStatus,
        transactionId,
        payerEmail,
        amount,
        currency,
        custom,
      });

      // Solo procesar pagos completados
      if (paymentStatus === 'Completed') {
        console.log('🎉 [PAYPAL IPN] Payment completed successfully! Transaction ID:', transactionId);
        
        // Procesar datos del usuario si están disponibles en el campo 'custom'
        if (custom) {
          try {
            console.log('📋 [PAYPAL IPN] Processing custom data:', custom);
            
            // Parsear los datos del campo custom
            const customData = JSON.parse(custom);
            
            if (customData.txnId) {
              console.log('📝 [PAYPAL IPN] Transaction ID found, updating existing tracking...');
              
              // Buscar el tracking pendiente por transactionId
              const existingTracking = await FirebaseTrackingService.getTrackingByPaymentTransactionId(customData.txnId);
              
              if (existingTracking) {
                console.log('✅ [PAYPAL IPN] Found existing tracking:', existingTracking.id);
                
                // Actualizar el tracking a estado MANUFACTURING (pago completado)
                const updatedTrackingData = {
                  ...existingTracking,
                  estadoPedido: OrderStatus.MANUFACTURING,
                  abonadoUsd: customData.amount || parseFloat(amount || '0'),
                  paymentStatus: 'COMPLETED',
                  paypalTransactionId: transactionId,
                  paymentDate: new Date().toISOString()
                };
                
                // Actualizar en Firebase
                if (existingTracking.id) {
                  await FirebaseTrackingService.updateTracking(existingTracking.id, updatedTrackingData);
                  
                  console.log('🎯 [PAYPAL IPN] Tracking updated successfully to MANUFACTURING status');
                } else {
                  console.error('❌ [PAYPAL IPN] Tracking ID is undefined');
                }
                
                // Enviar correo de confirmación usando los datos completos del tracking
                console.log('📧 [PAYPAL IPN] Sending purchase confirmation email...');
                try {
                  const orderDetails = {
                    transactionId: customData.txnId,
                    amount: customData.amount || parseFloat(amount || '0'),
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

                  const emailSent = await EmailService.sendPurchaseConfirmation(
                    existingTracking.contacto,
                    existingTracking.vrchatUsername || 'Usuario',
                    existingTracking.userHash!,
                    orderDetails
                  );

                  if (emailSent) {
                    console.log('✅ [PAYPAL IPN] Purchase confirmation email sent successfully');
                  } else {
                    console.warn('⚠️ [PAYPAL IPN] Failed to send purchase confirmation email');
                  }
                } catch (emailError) {
                  console.error('❌ [PAYPAL IPN] Error sending purchase confirmation email:', emailError);
                }
                
              } else {
                console.error('❌ [PAYPAL IPN] No pending tracking found for transaction ID:', customData.txnId);
              }
            } else {
              console.error('⚠️ [PAYPAL IPN] No transaction ID found in custom field');
            }
            
          } catch (error) {
            console.error('❌ [PAYPAL IPN] Error processing custom data:', error);
          }
        } else {
          console.log('⚠️ [PAYPAL IPN] No custom data received');
        }
      } else {
        console.log('⏳ [PAYPAL IPN] Payment status is not completed:', paymentStatus);
      }
      
      return NextResponse.json({ status: 'success' });
    } else {
      console.error('❌ [PAYPAL IPN] PayPal notification not verified');
      return NextResponse.json({ error: 'Invalid IPN' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error processing PayPal IPN:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
