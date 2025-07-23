import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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
      
      // Aquí puedes guardar la información en tu base de datos
      console.log('Pago verificado:', {
        paymentStatus,
        transactionId,
        payerEmail,
        amount,
        currency,
        custom,
      });
      
      return NextResponse.json({ status: 'success' });
    } else {
      console.error('Notificación de PayPal no verificada');
      return NextResponse.json({ error: 'Invalid IPN' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error procesando IPN de PayPal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
