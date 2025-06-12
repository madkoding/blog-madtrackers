import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '../../../../lib/apiAuth';
import { logger } from '../../../../lib/logger';

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET - Convertir hash a username para autenticación admin
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const hash = url.searchParams.get('hash');

    if (!hash) {
      return NextResponse.json({ 
        error: 'Hash requerido' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Obtener tracking usando el hash
    const response = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/public/tracking/hash/${encodeURIComponent(hash)}`);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Hash no encontrado' 
      }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    const responseData = await response.json();
    const tracking = Array.isArray(responseData) ? responseData[0] : responseData;

    if (!tracking?.nombreUsuario) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { 
        status: 404,
        headers: corsHeaders 
      });
    }

    return NextResponse.json({ 
      username: tracking.nombreUsuario,
      success: true 
    }, { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    logger.error('Error en hash lookup:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
