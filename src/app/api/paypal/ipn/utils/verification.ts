import { PayPalIPNData, IPNVerificationResult } from './types';

/**
 * Verifica la notificación IPN con PayPal
 */
export async function verifyIPNWithPayPal(body: string): Promise<IPNVerificationResult> {
  try {
    console.log('🔔 [PAYPAL IPN] Received PayPal IPN notification...');
    
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
      const ipnData: PayPalIPNData = {
        payment_status: params.get('payment_status'),
        txn_id: params.get('txn_id'),
        payer_email: params.get('payer_email'),
        mc_gross: params.get('mc_gross'),
        mc_currency: params.get('mc_currency'),
        custom: params.get('custom')
      };
      
      console.log('✅ [PAYPAL IPN] Payment verified:', ipnData);
      
      return {
        isVerified: true,
        ipnData
      };
    } else {
      console.error('❌ [PAYPAL IPN] PayPal notification not verified');
      return {
        isVerified: false
      };
    }
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error verifying IPN:', error);
    return {
      isVerified: false
    };
  }
}
