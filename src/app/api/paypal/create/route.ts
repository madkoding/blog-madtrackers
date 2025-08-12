import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingManager } from '@/lib/trackingManager';
import { OrderStatus } from '@/interfaces/tracking';

interface PayPalProductData {
  totalUsd?: number;
  numberOfTrackers?: number;
  sensor?: string;
  magnetometer?: boolean;
  caseColor?: string;
  coverColor?: string;
}

interface UserData {
  email: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  nombreUsuarioVrChat?: string;
}

/**
 * Crea un tracking en estado PENDING antes del pago PayPal
 */
async function createPendingTracking(
  transactionId: string, 
  email: string, 
  amount: number, 
  userData: UserData,
  productData?: PayPalProductData
): Promise<string> {
  // Generar un nombre de usuario temporal basado en el transactionId
  const username = `paypal_${transactionId}`;

  console.log('📦 [PAYPAL CREATE] Creating pending tracking with product data:', productData);

  // Crear el tracking usando TrackingManager con los datos reales del producto
  const trackingData = TrackingManager.generateUserTracking({
    nombreUsuario: username,
    contacto: email,
    fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
    totalUsd: productData?.totalUsd || amount, // PayPal ya está en USD
    abonadoUsd: 0, // Pendiente de pago
    envioPagado: false,
    numeroTrackers: productData?.numberOfTrackers || 6, // Primera opción por defecto
    sensor: productData?.sensor || "ICM45686 + QMC6309", // Primer sensor disponible
    magneto: productData?.magnetometer || true,
    colorCase: productData?.caseColor || 'white', // Segundo color por defecto
    colorTapa: productData?.coverColor || 'white', // Primer color por defecto
    paisEnvio: userData.pais || 'Chile',
    estadoPedido: OrderStatus.PENDING_PAYMENT, // Estado específico para pago pendiente
    porcentajes: {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    }
  });

  // Agregar información adicional del pago pendiente
  const enhancedTrackingData = {
    ...trackingData,
    paymentMethod: 'PayPal',
    paymentTransactionId: transactionId,
    paymentStatus: 'PENDING',
    paymentAmount: amount,
    paymentCurrency: 'USD',
    shippingAddress: {
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      estado: userData.estado,
      pais: userData.pais
    },
    vrchatUsername: userData.nombreUsuarioVrChat,
    isPendingPayment: true // Flag para identificar pagos pendientes
  };

  // Crear el tracking en Firebase
  return await FirebaseTrackingService.createTracking(enhancedTrackingData);
}

/**
 * API endpoint para crear un tracking antes del pago PayPal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, email, userData, productData, transactionId } = body;

    console.log('🚀 [PAYPAL CREATE] Creating PayPal payment with data:', {
      amount,
      description,
      email,
      userData,
      productData,
      transactionId
    });

    // Validaciones básicas
    if (!email || !amount || !transactionId) {
      return NextResponse.json(
        { error: 'Email, amount y transactionId son requeridos' },
        { status: 400 }
      );
    }

    if (!userData || !userData.direccion) {
      return NextResponse.json(
        { error: 'Datos de usuario incompletos' },
        { status: 400 }
      );
    }

    // Crear tracking pendiente
    const trackingId = await createPendingTracking(
      transactionId,
      email,
      amount,
      userData,
      productData
    );

    console.log('✅ [PAYPAL CREATE] Tracking created successfully:', trackingId);

    // Determinar entorno PayPal
    const isProduction = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'live';
    const paypalBusinessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL ?? 'tu-email@paypal.com';
    
    // Verificar configuración
    if (paypalBusinessEmail === 'tu-email@paypal.com') {
      return NextResponse.json(
        { error: 'PayPal business email no configurado' },
        { status: 500 }
      );
    }

    // Construir URL de PayPal
    const paypalBaseUrl = isProduction 
      ? 'https://www.paypal.com/cgi-bin/webscr'
      : 'https://www.sandbox.paypal.com/cgi-bin/webscr';

    // Datos personalizados reducidos para PayPal (límite 256 caracteres)
    const customData = {
      txnId: transactionId,
      email: email,
      vrchat: userData.nombreUsuarioVrChat || '',
      trackers: productData?.numberOfTrackers || 6,
      amount: amount
    };

    const customDataString = JSON.stringify(customData);
    
    // Verificar límite de caracteres
    if (customDataString.length > 256) {
      console.warn('⚠️ [PAYPAL CREATE] Custom data size:', customDataString.length, 'characters (limit: 256)');
    }

    // Construir URL de PayPal con parámetros
    const paypalUrl = new URL(paypalBaseUrl);
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', paypalBusinessEmail);
    paypalUrl.searchParams.append('item_name', description);
    paypalUrl.searchParams.append('amount', amount.toFixed(2));
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('custom', customDataString);
    paypalUrl.searchParams.append('return', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-success?paypal=true&transactionId=${transactionId}`);
    paypalUrl.searchParams.append('cancel_return', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-cancel`);
    paypalUrl.searchParams.append('notify_url', `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/paypal/ipn`);

    return NextResponse.json({
      success: true,
      paymentUrl: paypalUrl.toString(),
      trackingId,
      transactionId,
      environment: isProduction ? 'live' : 'sandbox'
    });

  } catch (error) {
    console.error('❌ [PAYPAL CREATE] Error creating PayPal payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
