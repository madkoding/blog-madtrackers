import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

/**
 * API endpoint para verificar el estado de un pago Flow
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    // Configurar el servicio Flow
    const flowService = getFlowService();

    // Obtener el estado del pago
    const paymentStatus = await flowService.getPaymentStatus({ token });

    // Mapear estados de Flow a estados legibles
    const getStatusText = (status: number): string => {
      switch (status) {
        case 1: return 'Pagado';
        case 2: return 'Rechazado';
        case 3: return 'Pendiente';
        case 4: return 'Anulado';
        default: return 'Pendiente';
      }
    };

    return NextResponse.json({
      success: true,
      payment: {
        flowOrder: paymentStatus.flowOrder,
        commerceOrder: paymentStatus.commerceOrder,
        status: paymentStatus.status,
        statusText: getStatusText(paymentStatus.status),
        subject: paymentStatus.subject,
        currency: paymentStatus.currency,
        amount: paymentStatus.amount,
        payer: paymentStatus.payer,
        requestDate: paymentStatus.requestDate,
        paymentData: paymentStatus.paymentData,
        pending_info: paymentStatus.pending_info
      }
    });

  } catch (error) {
    console.error('Error checking Flow payment status:', error);
    
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
