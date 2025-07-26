import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';

/**
 * API endpoint para recibir confirmaciones de pago de Flow
 * Flow llama a esta URL cuando el estado de un pago cambia
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

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

    // Log para debugging (remover en producción)
    console.log('Flow payment confirmation:', {
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder,
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      currency: paymentStatus.currency,
      payer: paymentStatus.payer
    });

    // Aquí puedes agregar tu lógica de negocio
    // Por ejemplo, actualizar el estado del pedido en tu base de datos
    if (paymentStatus.status === 1) {
      // Pago exitoso
      console.log(`✅ Pago exitoso: ${paymentStatus.commerceOrder} por ${paymentStatus.amount} ${paymentStatus.currency}`);
      
      // Implementar lógica específica del negocio:
      // - Actualizar estado del pedido en base de datos
      // - Enviar email de confirmación al cliente
      // - Activar servicios o productos comprados
      // - Notificar al equipo de ventas
      
    } else if (paymentStatus.status === 0) {
      // Pago pendiente
      console.log(`⏳ Pago pendiente: ${paymentStatus.commerceOrder}`);
    } else {
      // Pago fallido o cancelado
      console.log(`❌ Pago fallido/cancelado: ${paymentStatus.commerceOrder} (Estado: ${paymentStatus.status})`);
    }

    // Flow espera una respuesta HTTP 200 para confirmar que recibimos la notificación
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Flow confirmation:', error);
    
    // Es importante devolver un error para que Flow reintente la notificación
    return NextResponse.json(
      { error: 'Error procesando confirmación' },
      { status: 500 }
    );
  }
}
