import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

/**
 * API endpoint para crear un pago con Flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, email } = body;

    // Validar parámetros requeridos
    if (!amount || !description || !email) {
      return NextResponse.json(
        { error: 'Amount, description y email son requeridos' },
        { status: 400 }
      );
    }

    // Generar ID único para la orden
    const commerceOrder = `MT_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Obtener la URL base del sitio
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    // Configurar el servicio Flow
    const flowService = getFlowService();

    // Crear el pago en Flow
    const paymentData = await flowService.createPayment({
      commerceOrder,
      subject: description,
      currency: 'CLP',
      amount: Math.round(amount), // Flow requiere enteros para CLP
      email,
      urlConfirmation: `${baseUrl}/api/flow/confirm`,
      urlReturn: `${baseUrl}/api/flow/return?flow=true`,
      paymentMethod: 9, // Todos los medios de pago
      optional: JSON.stringify({
        source: 'madtrackers',
        type: 'advance_payment'
      }),
      timeout: 3600 // 1 hora de expiración
    });

    return NextResponse.json({
      success: true,
      paymentUrl: `${paymentData.url}?token=${paymentData.token}`,
      flowOrder: paymentData.flowOrder,
      commerceOrder,
      token: paymentData.token
    });

  } catch (error) {
    console.error('Error creating Flow payment:', error);
    
    let errorMessage = 'Error interno del servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
