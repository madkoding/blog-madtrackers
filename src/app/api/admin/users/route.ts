import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '../../../../lib/firebaseTrackingService';
import { validateApiKeyOrJWT, corsHeaders, jwtUnauthorizedResponse } from '../../../../lib/apiAuth';

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET - Obtener todos los usuarios para el panel de administración
export async function GET(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT)
    const auth = validateApiKeyOrJWT(request, 'admin');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    // Obtener todos los trackings ordenados por fecha de creación
    const trackings = await FirebaseTrackingService.getAllTrackings();
    
    return NextResponse.json({ users: trackings }, { headers: corsHeaders });

  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT)
    const auth = validateApiKeyOrJWT(request, 'admin');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    // Obtener datos del cuerpo de la petición
    const userData = await request.json();
    
    // Validar datos requeridos
    if (!userData.nombreUsuario || !userData.contacto) {
      return NextResponse.json({ 
        error: 'nombreUsuario and contacto are required' 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Crear el tracking en Firebase
    const newTracking = await FirebaseTrackingService.createTracking(userData);
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: newTracking 
    }, { 
      status: 201,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
