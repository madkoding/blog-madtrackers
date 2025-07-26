import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para manejar la redirección POST de Flow
 * Flow puede enviar tanto GET como POST al urlReturn
 */
export async function POST(request: NextRequest) {
  try {
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
      console.log('No body in POST request:', error);
    }
    
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const bodyToken = (body as Record<string, unknown>)?.token;
    const token = searchParams.get('token') || (typeof bodyToken === 'string' ? bodyToken : null);
    
    console.log('Flow POST redirect received:', {
      body,
      searchParams: Object.fromEntries(searchParams.entries()),
      token: token || 'NO_TOKEN',
      hasToken: !!token
    });

    // Construir URL de redirección con los parámetros necesarios
    const redirectUrl = new URL('/payment-success', request.nextUrl.origin);
    redirectUrl.searchParams.set('flow', 'true');
    
    // Solo agregar token si existe y no es null/undefined
    if (token && token !== 'null' && token !== 'undefined') {
      redirectUrl.searchParams.set('token', token);
    }

    console.log('Redirecting to:', redirectUrl.toString());

    // Redirigir con GET usando 302 (Found) que fuerza cambio de método POST a GET
    return NextResponse.redirect(redirectUrl.toString(), 302);

  } catch (error) {
    console.error('Error handling Flow POST redirect:', error);
    
    // En caso de error, redirigir a payment-success básico sin token
    const redirectUrl = new URL('/payment-success', request.nextUrl.origin);
    redirectUrl.searchParams.set('flow', 'true');
    
    console.log('Error fallback redirect to:', redirectUrl.toString());
    
    return NextResponse.redirect(redirectUrl.toString(), 302);
  }
}

/**
 * También manejar GET en caso de que Flow use GET
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  console.log('Flow GET redirect received:', {
    searchParams: Object.fromEntries(searchParams.entries()),
    token: token || 'NO_TOKEN',
    hasToken: !!token
  });

  // Construir URL de redirección
  const redirectUrl = new URL('/payment-success', request.nextUrl.origin);
  redirectUrl.searchParams.set('flow', 'true');
  
  // Solo agregar token si existe y no es null/undefined
  if (token && token !== 'null' && token !== 'undefined') {
    redirectUrl.searchParams.set('token', token);
  }

  console.log('Redirecting to:', redirectUrl.toString());

  return NextResponse.redirect(redirectUrl.toString(), 302);
}
