import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [PAYPAL IPN] Received PayPal IPN notification...');
    
    // Obtener el cuerpo de la petición
    const body = await request.text();
    
    // Verificar la notificación con PayPal
    const verificationData = 'cmd=_notify-validate&' + body;
    
    const verificationResponse = await fetch('https://ipnpb.paypal.com/cgi-bin/webscr', {
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
            
            if (customData.userData?.email) {
              console.log('� [PAYPAL IPN] User data found, creating tracking...');
              
              // Llamar al endpoint de success para crear el tracking
              const successResponse = await fetch(`${request.nextUrl.origin}/api/paypal/success`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  transactionId,
                  payerEmail,
                  amount,
                  currency,
                  userData: customData.userData,
                  productData: customData.productData || {}
                })
              });
              
              if (successResponse.ok) {
                const successResult = await successResponse.json();
                console.log('✅ [PAYPAL IPN] Tracking created successfully:', successResult);
              } else {
                console.error('❌ [PAYPAL IPN] Error creating tracking:', await successResponse.text());
              }
            } else {
              console.log('⚠️ [PAYPAL IPN] No user data found in custom field');
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
