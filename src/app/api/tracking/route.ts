import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '../../../lib/firebaseTrackingService';
import { UserTracking } from '../../../interfaces/tracking';
import { validateApiKeyOrJWT, corsHeaders, jwtUnauthorizedResponse } from '../../../lib/apiAuth';
import fs from 'fs';
import path from 'path';
import { logger } from '../../../lib/logger';

// Función para cargar datos de prueba desde archivos JSON
async function loadTestTrackingData(username: string): Promise<UserTracking | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'tracking', `${username}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      // Agregar un ID ficticio para compatibilidad
      return { ...data, id: `test_${username}` } as UserTracking;
    }
    return null;
  } catch (error) {
    logger.error('Error loading test data:', error);
    return null;
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET - Obtener todos los trackings o uno específico por query param
export async function GET(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const hash = searchParams.get('hash');
    const shippingStatus = searchParams.get('shippingStatus');
    const nearDeadline = searchParams.get('nearDeadline');

    // Si se especifica un ID, obtener tracking específico
    if (id) {
      const tracking = await FirebaseTrackingService.getTrackingById(id);
      if (!tracking) {
        return NextResponse.json({ error: 'Tracking not found' }, { 
          status: 404,
          headers: corsHeaders
        });
      }
      return NextResponse.json(tracking, { headers: corsHeaders });
    }

    // Si se especifica un hash, obtener tracking por hash (método preferido)
    if (hash) {
      const tracking = await FirebaseTrackingService.getTrackingByHashOrUsername(hash);
      
      if (!tracking) {
        return NextResponse.json({ error: 'Tracking not found' }, { 
          status: 404,
          headers: corsHeaders
        });
      }
      return NextResponse.json([tracking], { headers: corsHeaders }); // Retornar como array para consistencia con la interfaz admin
    }

    // Si se especifica un username, obtener tracking por nombre de usuario (legacy)
    if (username) {
      let tracking = await FirebaseTrackingService.getTrackingByUsername(username);
      
      // Si no se encuentra en Firebase, intentar cargar desde archivos de prueba
      tracking ??= await loadTestTrackingData(username);
      
      if (!tracking) {
        return NextResponse.json({ error: 'Tracking not found' }, { 
          status: 404,
          headers: corsHeaders
        });
      }
      return NextResponse.json([tracking], { headers: corsHeaders }); // Retornar como array para consistencia con la interfaz admin
    }

    // Si se especifica estado de envío
    if (shippingStatus !== null) {
      const trackings = await FirebaseTrackingService.getTrackingsByShippingStatus(shippingStatus === 'true');
      return NextResponse.json(trackings, { headers: corsHeaders });
    }

    // Si se especifica búsqueda por fecha límite próxima
    if (nearDeadline) {
      const days = parseInt(nearDeadline) || 7;
      const trackings = await FirebaseTrackingService.getTrackingsNearDeadline(days);
      return NextResponse.json(trackings, { headers: corsHeaders });
    }

    // Obtener todos los trackings
    const trackings = await FirebaseTrackingService.getAllTrackings();
    return NextResponse.json(trackings, { headers: corsHeaders });

  } catch (error) {
    logger.error('GET /api/tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST - Crear nuevo tracking
export async function POST(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const trackingData: UserTracking = await request.json();
    
    // Validaciones básicas
    if (!trackingData.nombreUsuario || !trackingData.contacto) {
      return NextResponse.json({ 
        error: 'nombreUsuario and contacto are required' 
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const trackingId = await FirebaseTrackingService.createTracking(trackingData);
    const createdTracking = await FirebaseTrackingService.getTrackingById(trackingId);
    
    return NextResponse.json(createdTracking, { 
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    logger.error('POST /api/tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// PUT - Actualizar tracking existente
export async function PUT(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const updateData: Partial<UserTracking> = await request.json();
    
    // Manejar datos de prueba (IDs que empiezan con "test_")
    if (id.startsWith('test_')) {
      // Para datos de prueba, solo simular la actualización y devolver los datos actualizados
      const updatedData = { ...updateData, id, updatedAt: new Date().toISOString() };
      return NextResponse.json(updatedData, { headers: corsHeaders });
    }
    
    // Verificar que el tracking existe en Firebase
    const existingTracking = await FirebaseTrackingService.getTrackingById(id);
    if (!existingTracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    await FirebaseTrackingService.updateTracking(id, updateData);
    const updatedTracking = await FirebaseTrackingService.getTrackingById(id);
    
    return NextResponse.json(updatedTracking, { headers: corsHeaders });

  } catch (error) {
    logger.error('PUT /api/tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// DELETE - Eliminar tracking
export async function DELETE(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Verificar que el tracking existe
    const existingTracking = await FirebaseTrackingService.getTrackingById(id);
    if (!existingTracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    await FirebaseTrackingService.deleteTracking(id);
    
    return NextResponse.json({ message: 'Tracking deleted successfully' }, { headers: corsHeaders });

  } catch (error) {
    logger.error('DELETE /api/tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
