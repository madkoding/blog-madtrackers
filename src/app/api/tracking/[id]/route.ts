import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '../../../../lib/firebaseTrackingService';
import { UserTracking } from '../../../../interfaces/tracking';
import { validateApiKeyOrJWT, corsHeaders, jwtUnauthorizedResponse } from '../../../../lib/apiAuth';

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET - Obtener tracking por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const tracking = await FirebaseTrackingService.getTrackingById(params.id);
    
    if (!tracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }
    
    return NextResponse.json(tracking, { headers: corsHeaders });

  } catch (error) {
    console.error('GET /api/tracking/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// PUT - Actualizar tracking por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const updateData: Partial<UserTracking> = await request.json();
    
    // Verificar que el tracking existe
    const existingTracking = await FirebaseTrackingService.getTrackingById(params.id);
    if (!existingTracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    await FirebaseTrackingService.updateTracking(params.id, updateData);
    const updatedTracking = await FirebaseTrackingService.getTrackingById(params.id);
    
    return NextResponse.json(updatedTracking, { headers: corsHeaders });

  } catch (error) {
    console.error('PUT /api/tracking/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// DELETE - Eliminar tracking por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar autenticación (API Key o JWT para acceso de usuario)
    const auth = validateApiKeyOrJWT(request, 'user');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    // Verificar que el tracking existe
    const existingTracking = await FirebaseTrackingService.getTrackingById(params.id);
    if (!existingTracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    await FirebaseTrackingService.deleteTracking(params.id);
    
    return NextResponse.json({ message: 'Tracking deleted successfully' }, { headers: corsHeaders });

  } catch (error) {
    console.error('DELETE /api/tracking/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
