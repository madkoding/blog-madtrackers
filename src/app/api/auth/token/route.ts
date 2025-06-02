import { NextRequest, NextResponse } from 'next/server';
import { JWTAuthService } from '../../../../lib/jwtAuthService';
import { FirebaseTrackingService } from '../../../../lib/firebaseTrackingService';
import { corsHeaders } from '../../../../lib/apiAuth';

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST - Generar token de acceso
export async function POST(request: NextRequest) {
  try {
    const { username, type } = await request.json();

    if (!username || !type) {
      return NextResponse.json({ 
        error: 'Username y type son requeridos' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (type !== 'user' && type !== 'admin') {
      return NextResponse.json({ 
        error: 'Type debe ser "user" o "admin"' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Para acceso de usuario, necesitamos obtener el email del tracking
    if (type === 'user') {
      const tracking = await FirebaseTrackingService.getTrackingByUsername(username);
      
      if (!tracking) {
        return NextResponse.json({ 
          error: 'Usuario no encontrado' 
        }, { 
          status: 404,
          headers: corsHeaders 
        });
      }

      const result = await JWTAuthService.generateUserAccessToken(username, tracking.contacto);
      
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400,
        headers: corsHeaders 
      });
    }

    // Para acceso de admin
    if (type === 'admin') {
      // Verificar que el username es 'Administrador' (nuestro identificador interno)
      if (username !== 'Administrador') {
        return NextResponse.json({ 
          error: 'Acceso administrativo no autorizado' 
        }, { 
          status: 403,
          headers: corsHeaders 
        });
      }

      // Pasar el username correcto ('Administrador') al servicio
      const result = await JWTAuthService.generateAdminAccessToken(username);
      
      return NextResponse.json(result, { 
        status: result.success ? 200 : 400,
        headers: corsHeaders 
      });
    }

  } catch (error) {
    console.error('Error en /api/auth/token:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// PUT - Verificar token y generar JWT
export async function PUT(request: NextRequest) {
  try {
    const { token, username, type } = await request.json();

    if (!token || !username || !type) {
      return NextResponse.json({ 
        error: 'Token, username y type son requeridos' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const result = JWTAuthService.verifyEmailTokenAndGenerateJWT(token, username, type);

    return NextResponse.json(result, { 
      status: result.valid ? 200 : 400,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
