import { NextRequest, NextResponse } from 'next/server';
import { FlowService } from '@/lib/flowService';

/**
 * Endpoint de confirmación para Flow
 * Flow llama a este endpoint para confirmar que la transacción fue procesada correctamente
 * Este endpoint debe responder con un mensaje específico que Flow entienda
 * 
 * IMPORTANTE: En desarrollo (localhost), Flow no puede alcanzar este endpoint
 * desde internet, por lo que el pago se procesará pero Flow reportará error de confirmación.
 * En producción con dominio público, funcionará correctamente.
 */
export async function POST(request: NextRequest) {
  console.log('=== FLOW CONFIRMATION ENDPOINT ===');
  console.log('Flow confirmation request received from:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    console.log('Flow confirmation request received');
    
    // Obtener datos del body de diferentes maneras posibles
    let body = {};
    try {
      const textBody = await request.text();
      if (textBody) {
        // Intentar parsear como JSON
        try {
          body = JSON.parse(textBody);
        } catch {
          // Si no es JSON, podría ser form-urlencoded
          if (textBody.includes('=')) {
            const params = new URLSearchParams(textBody);
            body = Object.fromEntries(params.entries());
          }
        }
      }
    } catch (error) {
      console.log('No body in confirmation request:', error);
    }
    
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token') || (body as any)?.token;
    
    console.log('Flow confirmation data:', {
      body,
      searchParams: Object.fromEntries(searchParams.entries()),
      token: token || 'NO_TOKEN',
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
      url: request.url
    });

    if (!token) {
      console.error('No token provided in confirmation request');
      return NextResponse.json({ 
        error: 'No token provided' 
      }, { status: 400 });
    }

    // Verificar el estado del pago con Flow
    try {
      const flowService = new FlowService({
        apiKey: process.env.FLOW_API_KEY!,
        secretKey: process.env.FLOW_SECRET_KEY!,
        baseUrl: 'sandbox.flow.cl'
      });
      const paymentStatus = await flowService.getPaymentStatus({ token });
      
      console.log('Payment status verification:', {
        token,
        status: paymentStatus.status,
        flowOrder: paymentStatus.flowOrder,
        commerceOrder: paymentStatus.commerceOrder,
        amount: paymentStatus.amount
      });

      // Aquí puedes agregar tu lógica de negocio:
      // - Actualizar estado en base de datos
      // - Enviar emails de confirmación
      // - Activar servicios/productos
      // - Etc.
      
      if (paymentStatus.status === 1) { // Pago exitoso
        console.log('✅ Payment confirmed successfully:', {
          flowOrder: paymentStatus.flowOrder,
          commerceOrder: paymentStatus.commerceOrder,
          amount: paymentStatus.amount,
          payer: paymentStatus.payer
        });

        // Responder con el formato que Flow espera
        const response = NextResponse.json({
          status: 'success',
          message: 'Payment confirmed successfully',
          flowOrder: paymentStatus.flowOrder,
          commerceOrder: paymentStatus.commerceOrder
        }, { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
        
        console.log('✅ Sending success response to Flow');
        return response;
      } else {
        console.log('❌ Payment not successful:', {
          status: paymentStatus.status,
          flowOrder: paymentStatus.flowOrder
        });

        return NextResponse.json({
          status: 'error',
          message: `Payment not successful: Status ${paymentStatus.status}`,
          flowOrder: paymentStatus.flowOrder,
          commerceOrder: paymentStatus.commerceOrder
        }, { status: 400 });
      }

    } catch (verificationError) {
      console.error('Error verifying payment status:', verificationError);
      
      return NextResponse.json({
        status: 'error',
        message: 'Error verifying payment status',
        error: verificationError instanceof Error ? verificationError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in Flow confirmation endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * También manejar GET en caso de que Flow use GET para confirmación
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  console.log('Flow confirmation GET request:', {
    searchParams: Object.fromEntries(searchParams.entries()),
    token: token || 'NO_TOKEN'
  });

  if (!token) {
    return NextResponse.json({ 
      error: 'No token provided' 
    }, { status: 400 });
  }

  try {
    const flowService = new FlowService({
      apiKey: process.env.FLOW_API_KEY!,
      secretKey: process.env.FLOW_SECRET_KEY!,
      baseUrl: 'sandbox.flow.cl'
    });
    const paymentStatus = await flowService.getPaymentStatus({ token });
    
    return NextResponse.json({
      status: paymentStatus.status === 1 ? 'success' : 'error',
      message: paymentStatus.status === 1 ? 'Payment confirmed' : 'Payment not successful',
      flowOrder: paymentStatus.flowOrder,
      commerceOrder: paymentStatus.commerceOrder
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET confirmation:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error verifying payment'
    }, { status: 500 });
  }
}

/**
 * Manejar OPTIONS para CORS
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    }
  });
}
