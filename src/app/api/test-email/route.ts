import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/emailService';

/**
 * Endpoint para probar el envío de emails
 * SOLO PARA DESARROLLO/TESTING
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [EMAIL TEST] Testing email service...');
    
    const body = await request.json();
    const { email, testType = 'simple' } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    console.log('📧 [EMAIL TEST] Testing email to:', email);
    console.log('📧 [EMAIL TEST] Test type:', testType);
    
    // Verificar configuración de environment
    const config = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      nextAuthUrl: process.env.NEXTAUTH_URL
    };
    
    console.log('⚙️ [EMAIL TEST] Environment config:', config);
    
    if (testType === 'simple') {
      // Test simple
      const result = await EmailService.sendEmail({
        to: email,
        subject: '🧪 Test Email - MadTrackers',
        html: `
          <h1>Test Email</h1>
          <p>Este es un email de prueba desde MadTrackers.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Si recibes este email, el servicio está funcionando correctamente.</p>
        `
      });
      
      return NextResponse.json({
        success: result,
        message: result ? 'Email sent successfully' : 'Email failed to send',
        config,
        testType: 'simple'
      });
    } else if (testType === 'purchase') {
      // Test de confirmación de compra
      const orderDetails = {
        transactionId: 'TEST_123',
        amount: 93.26,
        currency: 'USD',
        trackers: 6,
        sensor: 'ICM45686 + QMC6309',
        colors: {
          case: 'white',
          tapa: 'white'
        },
        shippingAddress: {
          address: 'Test Address 123',
          cityState: 'Santiago, RM',
          country: 'Chile'
        },
        paymentMethod: 'PayPal',
        orderDate: new Date().toLocaleDateString('es-CL')
      };
      
      const result = await EmailService.sendPurchaseConfirmation(
        email,
        'Usuario Test',
        'test_hash_123',
        orderDetails
      );
      
      return NextResponse.json({
        success: result,
        message: result ? 'Purchase confirmation email sent successfully' : 'Purchase confirmation email failed to send',
        config,
        testType: 'purchase',
        orderDetails
      });
    }
    
    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    
  } catch (error) {
    console.error('❌ [EMAIL TEST] Error testing email:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
