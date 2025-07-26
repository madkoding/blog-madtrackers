import { NextRequest, NextResponse } from 'next/server';

/**
 * API route para manejar POST requests directos a /payment-success
 * Flow a veces hace POST directamente después de un redirect
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener todos los parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    
    console.log('POST to payment-success received:', {
      searchParams: Object.fromEntries(searchParams.entries()),
      url: request.nextUrl.toString()
    });

    // Construir URL de redirección GET con los mismos parámetros
    const redirectUrl = new URL('/payment-success', request.nextUrl.origin);
    
    // Copiar todos los parámetros existentes
    for (const [key, value] of searchParams.entries()) {
      redirectUrl.searchParams.set(key, value);
    }

    console.log('Redirecting POST to GET:', redirectUrl.toString());

    // Redirigir a GET con 302 (Found) para forzar cambio de método
    return NextResponse.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('Error handling POST to payment-success:', error);
    
    // En caso de error, redirigir a la página básica
    const redirectUrl = new URL('/payment-success', request.nextUrl.origin);
    redirectUrl.searchParams.set('flow', 'true');
    
    return NextResponse.redirect(redirectUrl.toString(), 302);
  }
}
