import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para manejar la redirección POST de Flow
 * Flow puede enviar tanto GET como POST al urlReturn
 */
export async function POST(request: NextRequest) {
  console.log('🚀 =================================================================');
  console.log('🚀 ==================== FLOW RETURN ENDPOINT ====================');
  console.log('🚀 =================================================================');
  console.log('⏰ [FLOW RETURN] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW RETURN] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW RETURN] Request URL:', request.url);
  console.log('📍 [FLOW RETURN] Request method:', request.method);
  
  // Log todos los headers
  console.log('📋 [FLOW RETURN] All headers:');
  const headers = Object.fromEntries(request.headers.entries());
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  try {
    console.log('🏁 [FLOW RETURN] Starting return process...');
    
    // Obtener datos del body de diferentes maneras posibles
    let body = {};
    try {
      console.log('📄 [FLOW RETURN] Reading request body...');
      const textBody = await request.text();
      console.log('📄 [FLOW RETURN] Raw body content:', textBody || 'EMPTY');
      
      if (textBody) {
        // Detectar formato primero - si contiene '=' es probablemente form-urlencoded
        if (textBody.includes('=')) {
          // Intentar parsear como form-urlencoded primero (más común en Flow)
          try {
            const params = new URLSearchParams(textBody);
            body = Object.fromEntries(params.entries());
            console.log('✅ [FLOW RETURN] Successfully parsed as form-urlencoded:', body);
          } catch (formError) {
            console.log('❌ [FLOW RETURN] Failed to parse as form-urlencoded:', formError);
            
            // Si falla form-urlencoded, intentar JSON
            try {
              body = JSON.parse(textBody);
              console.log('✅ [FLOW RETURN] Successfully parsed as JSON:', body);
            } catch (jsonError) {
              console.log('❌ [FLOW RETURN] Failed to parse as JSON:', jsonError);
            }
          }
        } else {
          // Si no contiene '=', intentar parsear como JSON
          try {
            body = JSON.parse(textBody);
            console.log('✅ [FLOW RETURN] Successfully parsed as JSON:', body);
          } catch (jsonError) {
            console.log('❌ [FLOW RETURN] Failed to parse as JSON:', jsonError);
            console.log('❌ [FLOW RETURN] Body format not recognized');
          }
        }
      } else {
        console.log('⚠️ [FLOW RETURN] No body content found');
      }
    } catch (error) {
      console.error('💥 [FLOW RETURN] Error reading body:', error);
    }
    
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    console.log('🔗 [FLOW RETURN] URL search params:', Object.fromEntries(searchParams.entries()));
    
    const bodyToken = (body as Record<string, unknown>)?.token;
    const urlToken = searchParams.get('token');
    const token = urlToken || (typeof bodyToken === 'string' ? bodyToken : null);
    
    console.log('🎫 [FLOW RETURN] Token extraction:');
    console.log('   - From body:', bodyToken || 'NOT_FOUND');
    console.log('   - From URL:', urlToken || 'NOT_FOUND');
    console.log('   - Final token:', token || 'NO_TOKEN');
    
    console.log('📊 [FLOW RETURN] Complete request analysis:', {
      body,
      searchParams: Object.fromEntries(searchParams.entries()),
      token: token || 'NO_TOKEN',
      hasToken: !!token
    });

    // Obtener la URL base del sitio (usar variable de entorno si está disponible)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    console.log('🌐 [FLOW RETURN] Base URL for redirect:', baseUrl);
    
    // Verificar estado del pago antes de redirigir
    let redirectPath = '/payment-success'; // Default para caso sin token o error
    
    if (token && token !== 'null' && token !== 'undefined') {
      console.log('🔍 [FLOW RETURN] Checking payment status before redirect...');
      
      try {
        // Importar FlowService para verificar el estado
        const { getFlowService } = await import('@/lib/flowService');
        const flowService = getFlowService();
        
        console.log('🌐 [FLOW RETURN] Getting payment status from Flow API...');
        const statusResponse = await flowService.getPaymentStatus({ token });
        
        console.log('📋 [FLOW RETURN] Flow API response:', statusResponse);
        
        if (statusResponse?.status !== undefined) {
          const status = statusResponse.status;
          console.log(`📊 [FLOW RETURN] Payment status: ${status}`);
          
          // Determinar página de destino según el estado
          switch (status) {
            case 1: // Pagado
              redirectPath = '/payment-success';
              console.log('✅ [FLOW RETURN] Payment successful - redirecting to success page');
              break;
            case 2: // Rechazado
              redirectPath = '/payment-cancel';
              console.log('❌ [FLOW RETURN] Payment rejected - redirecting to cancel page');
              break;
            case 3: // Pendiente
              // Se mostrará como pendiente en la página de success
              console.log('⏳ [FLOW RETURN] Payment pending - redirecting to success page (will show as pending)');
              break;
            case 4: // Cancelado
              redirectPath = '/payment-cancel';
              console.log('🚫 [FLOW RETURN] Payment cancelled - redirecting to cancel page');
              break;
            default:
              console.log(`⚠️ [FLOW RETURN] Unknown status ${status} - defaulting to success page`);
          }
        } else {
          console.log('⚠️ [FLOW RETURN] Could not verify payment status - defaulting to success page');
        }
      } catch (statusError) {
        console.error('💥 [FLOW RETURN] Error checking payment status:', statusError);
        console.log('⚠️ [FLOW RETURN] Status check failed - defaulting to success page');
        // En caso de error, mantener el default (payment-success)
      }
    } else {
      console.log('⚠️ [FLOW RETURN] No token available - defaulting to success page');
    }
    
    // Construir URL de redirección con los parámetros necesarios
    const redirectUrl = new URL(redirectPath, baseUrl);
    redirectUrl.searchParams.set('flow', 'true');
    
    // Solo agregar token si existe y no es null/undefined
    if (token && token !== 'null' && token !== 'undefined') {
      redirectUrl.searchParams.set('token', token);
      console.log('✅ [FLOW RETURN] Token added to redirect URL');
    } else {
      console.log('⚠️ [FLOW RETURN] No valid token to add to redirect URL');
    }

    console.log('🎯 [FLOW RETURN] Final redirect URL:', redirectUrl.toString());

    // Redirigir con GET usando 302 (Found) que fuerza cambio de método POST a GET
    console.log('📤 [FLOW RETURN] Sending 302 redirect response...');
    const response = NextResponse.redirect(redirectUrl.toString(), 302);
    
    console.log('✅ [FLOW RETURN] Redirect response created successfully');
    return response;

  } catch (error) {
    console.error('💥 [FLOW RETURN] ===============================================');
    console.error('💥 [FLOW RETURN] ERROR HANDLING FLOW POST REDIRECT');
    console.error('💥 [FLOW RETURN] ===============================================');
    console.error('💥 [FLOW RETURN] Error details:', error);
    console.error('💥 [FLOW RETURN] Error type:', typeof error);
    console.error('💥 [FLOW RETURN] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 [FLOW RETURN] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Obtener la URL base del sitio para el fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    
    // En caso de error, redirigir a payment-success básico sin token
    const redirectUrl = new URL('/payment-success', baseUrl);
    redirectUrl.searchParams.set('flow', 'true');
    
    console.log('🚨 [FLOW RETURN] Error fallback redirect to:', redirectUrl.toString());
    
    const fallbackResponse = NextResponse.redirect(redirectUrl.toString(), 302);
    console.log('📤 [FLOW RETURN] Sending fallback redirect response');
    
    return fallbackResponse;
  } finally {
    console.log('🏁 [FLOW RETURN] ===============================================');
    console.log('🏁 [FLOW RETURN] RETURN ENDPOINT EXECUTION COMPLETED');
    console.log('🏁 [FLOW RETURN] ===============================================');
  }
}

/**
 * También manejar GET en caso de que Flow use GET
 */
export async function GET(request: NextRequest) {
  console.log('🚀 [FLOW RETURN GET] ===============================================');
  console.log('🚀 [FLOW RETURN GET] FLOW RETURN GET REQUEST');
  console.log('🚀 [FLOW RETURN GET] ===============================================');
  console.log('⏰ [FLOW RETURN GET] Timestamp:', new Date().toISOString());
  console.log('🌐 [FLOW RETURN GET] Request from IP:', request.headers.get('x-forwarded-for') || 'localhost');
  console.log('🔗 [FLOW RETURN GET] Request URL:', request.url);
  
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  console.log('📋 [FLOW RETURN GET] Search params:', Object.fromEntries(searchParams.entries()));
  console.log('🎫 [FLOW RETURN GET] Token:', token || 'NO_TOKEN');
  console.log('📊 [FLOW RETURN GET] Request analysis:', {
    searchParams: Object.fromEntries(searchParams.entries()),
    token: token || 'NO_TOKEN',
    hasToken: !!token
  });

  // Obtener la URL base del sitio (usar variable de entorno si está disponible)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  console.log('🌐 [FLOW RETURN GET] Base URL for redirect:', baseUrl);

  // Verificar estado del pago antes de redirigir
  let redirectPath = '/payment-success'; // Default para caso sin token o error
  
  if (token && token !== 'null' && token !== 'undefined') {
    console.log('🔍 [FLOW RETURN GET] Checking payment status before redirect...');
    
    try {
      // Importar FlowService para verificar el estado
      const { getFlowService } = await import('@/lib/flowService');
      const flowService = getFlowService();
      
      console.log('🌐 [FLOW RETURN GET] Getting payment status from Flow API...');
      const statusResponse = await flowService.getPaymentStatus({ token });
      
      console.log('📋 [FLOW RETURN GET] Flow API response:', statusResponse);
      
      if (statusResponse?.status !== undefined) {
        const status = statusResponse.status;
        console.log(`📊 [FLOW RETURN GET] Payment status: ${status}`);
        
        // Determinar página de destino según el estado
        switch (status) {
          case 1: // Pagado
            redirectPath = '/payment-success';
            console.log('✅ [FLOW RETURN GET] Payment successful - redirecting to success page');
            break;
          case 2: // Rechazado
            redirectPath = '/payment-cancel';
            console.log('❌ [FLOW RETURN GET] Payment rejected - redirecting to cancel page');
            break;
          case 3: // Pendiente
            // Se mostrará como pendiente en la página de success
            console.log('⏳ [FLOW RETURN GET] Payment pending - redirecting to success page (will show as pending)');
            break;
          case 4: // Cancelado
            redirectPath = '/payment-cancel';
            console.log('🚫 [FLOW RETURN GET] Payment cancelled - redirecting to cancel page');
            break;
          default:
            console.log(`⚠️ [FLOW RETURN GET] Unknown status ${status} - defaulting to success page`);
        }
      } else {
        console.log('⚠️ [FLOW RETURN GET] Could not verify payment status - defaulting to success page');
      }
    } catch (statusError) {
      console.error('💥 [FLOW RETURN GET] Error checking payment status:', statusError);
      console.log('⚠️ [FLOW RETURN GET] Status check failed - defaulting to success page');
      // En caso de error, mantener el default (payment-success)
    }
  } else {
    console.log('⚠️ [FLOW RETURN GET] No token available - defaulting to success page');
  }

  // Construir URL de redirección
  const redirectUrl = new URL(redirectPath, baseUrl);
  redirectUrl.searchParams.set('flow', 'true');
  
  // Solo agregar token si existe y no es null/undefined
  if (token && token !== 'null' && token !== 'undefined') {
    redirectUrl.searchParams.set('token', token);
    console.log('✅ [FLOW RETURN GET] Token added to redirect URL');
  } else {
    console.log('⚠️ [FLOW RETURN GET] No valid token to add to redirect URL');
  }

  console.log('🎯 [FLOW RETURN GET] Final redirect URL:', redirectUrl.toString());

  console.log('📤 [FLOW RETURN GET] Sending 302 redirect response...');
  const response = NextResponse.redirect(redirectUrl.toString(), 302);
  
  console.log('✅ [FLOW RETURN GET] Redirect response created successfully');
  console.log('🏁 [FLOW RETURN GET] GET request processing completed');
  
  return response;
}
