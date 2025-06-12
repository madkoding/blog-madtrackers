import { NextRequest, NextResponse } from 'next/server';
import { JWTAuthService } from '../../../../lib/jwtAuthService';
import { FirebaseTrackingService } from '../../../../lib/firebaseTrackingService';
import { corsHeaders } from '../../../../lib/apiAuth';
import { isHashFormat } from '../../../../utils/hashUtils';
import { logger } from '../../../../lib/logger';

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Función auxiliar para validar los parámetros de entrada
function validateRequestParams(username: string, type: string) {
  if (!username || !type) {
    return { 
      error: 'Username y type son requeridos',
      status: 400
    };
  }

  if (type !== 'user' && type !== 'admin') {
    return { 
      error: 'Type debe ser "user" o "admin"',
      status: 400
    };
  }

  return null;
}

// Función auxiliar para manejar autenticación de usuario
async function handleUserAuth(username: string) {
  let tracking;
  
  // Verificar si es un hash o un username
  const isHash = isHashFormat(username);
  
  if (isHash) {
    tracking = await FirebaseTrackingService.getTrackingByUserHash(username);
  } else {
    tracking = await FirebaseTrackingService.getTrackingByUsername(username);
  }
  
  if (!tracking) {
    return { 
      error: 'Usuario no encontrado',
      status: 404
    };
  }

  // Usar el username real del tracking (no el hash) para generar el token
  const result = await JWTAuthService.generateUserAccessToken(tracking.nombreUsuario, tracking.contacto);
  
  return {
    result,
    status: result.success ? 200 : 400
  };
}

// Función auxiliar para manejar autenticación de admin
async function handleAdminAuth(username: string) {
  // Verificar que el username es 'Administrador' (nuestro identificador interno)
  if (username !== 'Administrador') {
    return { 
      error: 'Acceso administrativo no autorizado',
      status: 403
    };
  }

  // Pasar el username correcto ('Administrador') al servicio
  const result = await JWTAuthService.generateAdminAccessToken(username);
  
  return {
    result,
    status: result.success ? 200 : 400
  };
}

// POST - Generar token de acceso
export async function POST(request: NextRequest) {
  try {
    const { username, type } = await request.json();

    // Validar parámetros
    const validation = validateRequestParams(username, type);
    if (validation) {
      return NextResponse.json({ 
        error: validation.error 
      }, { 
        status: validation.status,
        headers: corsHeaders 
      });
    }

    // Manejar según el tipo
    let authResult;
    if (type === 'user') {
      authResult = await handleUserAuth(username);
    } else {
      authResult = await handleAdminAuth(username);
    }

    // Si hay error, retornarlo
    if (authResult.error) {
      return NextResponse.json({ 
        error: authResult.error 
      }, { 
        status: authResult.status,
        headers: corsHeaders 
      });
    }

    // Retornar resultado exitoso
    return NextResponse.json(authResult.result, { 
      status: authResult.status,
      headers: corsHeaders 
    });

  } catch (error) {
    logger.error('Error en /api/auth/token:', error);
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

    let realUsername = username;

    // Si es un tipo 'user' y el username es un hash, obtener el username real
    if (type === 'user' && isHashFormat(username)) {
      const tracking = await FirebaseTrackingService.getTrackingByUserHash(username);
      if (!tracking) {
        return NextResponse.json({ 
          error: 'Usuario no encontrado' 
        }, { 
          status: 404,
          headers: corsHeaders 
        });
      }
      realUsername = tracking.nombreUsuario;
    }

    const result = JWTAuthService.verifyEmailTokenAndGenerateJWT(token, realUsername, type);

    return NextResponse.json(result, { 
      status: result.valid ? 200 : 400,
      headers: corsHeaders 
    });

  } catch (error) {
    logger.error('Error verificando token:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
