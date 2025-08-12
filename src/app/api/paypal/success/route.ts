import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingManager } from '@/lib/trackingManager';
import { OrderStatus } from '@/interfaces/tracking';

/**
 * API endpoint para procesar pagos exitosos de PayPal y crear tracking
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎉 [PAYPAL SUCCESS] Starting PayPal payment processing...');
    
    const body = await request.json();
    console.log('📄 [PAYPAL SUCCESS] Request body:', body);
    
    const { 
      transactionId, 
      payerEmail, 
      amount, 
      currency, 
      userData,
      productData 
    } = body;

    // Validar parámetros requeridos
    if (!transactionId || !payerEmail || !amount || !userData) {
      console.error('❌ [PAYPAL SUCCESS] Missing required parameters');
      return NextResponse.json({ 
        error: 'Missing required parameters: transactionId, payerEmail, amount, userData' 
      }, { status: 400 });
    }

    // Validar que userData tenga los campos necesarios
    if (!userData.email || !userData.direccion || !userData.ciudad || !userData.estado || !userData.pais) {
      console.error('❌ [PAYPAL SUCCESS] Missing userData fields');
      return NextResponse.json({ 
        error: 'Missing required userData fields' 
      }, { status: 400 });
    }

    console.log('✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:', {
      transactionId,
      payerEmail,
      amount,
      userData: {
        email: userData.email,
        direccion: userData.direccion,
        ciudad: userData.ciudad,
        estado: userData.estado,
        pais: userData.pais,
        nombreUsuarioVrChat: userData.nombreUsuarioVrChat || 'N/A'
      }
    });

    // Generar un nombre de usuario basado en el email para el tracking
    const username = userData.email.split('@')[0] + '_' + Date.now().toString().slice(-6);

    // Crear el tracking usando TrackingManager
    const trackingData = TrackingManager.generateUserTracking({
      nombreUsuario: username,
      contacto: userData.email,
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
      totalUsd: parseFloat(amount),
      abonadoUsd: parseFloat(amount), // PayPal pago completo
      envioPagado: false, // El envío se paga por separado normalmente
      numeroTrackers: productData?.numberOfTrackers || 5,
      sensor: productData?.sensor || "ICM45686 + QMC6309",
      magneto: productData?.magnetometer || false,
      colorCase: productData?.caseColor || 'black',
      colorTapa: productData?.coverColor || 'black',
      paisEnvio: userData.pais,
      estadoPedido: OrderStatus.WAITING,
      porcentajes: {
        placa: 0,
        straps: 0,
        cases: 0,
        baterias: 0
      }
    });

    // Agregar información adicional del pago de PayPal
    const enhancedTrackingData = {
      ...trackingData,
      paymentMethod: 'PayPal',
      paymentTransactionId: transactionId,
      paymentAmount: parseFloat(amount),
      paymentCurrency: currency || 'USD',
      shippingAddress: {
        direccion: userData.direccion,
        ciudad: userData.ciudad,
        estado: userData.estado,
        pais: userData.pais
      },
      vrchatUsername: userData.nombreUsuarioVrChat
    };

    // Crear el tracking en Firebase
    const trackingId = await FirebaseTrackingService.createTracking(enhancedTrackingData);

    console.log('🎯 [PAYPAL SUCCESS] Tracking created successfully:', {
      trackingId,
      username: trackingData.nombreUsuario,
      userHash: trackingData.userHash,
      paymentMethod: 'PayPal',
      transactionId
    });

    return NextResponse.json({
      success: true,
      trackingId,
      username: trackingData.nombreUsuario,
      userHash: trackingData.userHash,
      message: 'Payment processed and tracking created successfully'
    });

  } catch (error) {
    console.error('❌ [PAYPAL SUCCESS] Error processing PayPal payment:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
