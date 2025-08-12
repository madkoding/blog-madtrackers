import { NextRequest, NextResponse } from 'next/server';
import {
  verifyIPNWithPayPal,
  isPaymentCompleted,
  processCompletedPayment
} from './utils';

export async function POST(request: NextRequest) {
  try {
    // Obtener el cuerpo de la petición
    const body = await request.text();
    
    // Verificar la notificación con PayPal
    const verificationResult = await verifyIPNWithPayPal(body);
    
    if (!verificationResult.isVerified || !verificationResult.ipnData) {
      return NextResponse.json({ error: 'Invalid IPN' }, { status: 400 });
    }
    
    const { ipnData } = verificationResult;
    
    // Solo procesar pagos completados
    if (isPaymentCompleted(ipnData.payment_status)) {
      await processCompletedPayment(ipnData);
    } else {
      console.log('⏳ [PAYPAL IPN] Payment status is not completed:', ipnData.payment_status);
    }
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('❌ [PAYPAL IPN] Error processing PayPal IPN:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
