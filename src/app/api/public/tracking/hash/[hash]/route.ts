import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '../../../../../../lib/firebaseTrackingService';
import { corsHeaders } from '../../../../../../lib/apiAuth';
import { promises as fs } from 'fs';
import path from 'path';
import { isHashFormat } from '../../../../../../utils/hashUtils';
import { logger } from '@/lib/logger';

// Helper function to try loading from JSON file fallback
async function tryLoadFromJSON(identifier: string) {
  try {
    // SOLO permitir hash en este endpoint - no usernames directos
    if (!isHashFormat(identifier)) {
      return null;
    }
    
    // Para testing, intentar cargar desde archivos JSON usando el hash válido
    // El hash válido para "testuser" es 54c15aeea124dfa7
    if (identifier === '54c15aeea124dfa7') {
      const filePath = path.join(process.cwd(), 'public', 'data', 'tracking', '54c15aeea124dfa7.json');
      const jsonData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(jsonData);
    }
    
    return null;
  } catch {
    // File doesn't exist or can't be read
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

// GET - Endpoint público para obtener tracking por hash seguro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const resolvedParams = await params;
    const hash = decodeURIComponent(resolvedParams.hash);
    
    if (!hash || hash.trim() === '') {
      return NextResponse.json({ error: 'Hash is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // SOLO permitir hashes válidos - rechazar usernames directos
    if (!isHashFormat(hash)) {
      return NextResponse.json({ error: 'Invalid hash format. Only secure hash access is allowed.' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Buscar por hash o username para compatibilidad hacia atrás
    const tracking = await FirebaseTrackingService.getTrackingByHashOrUsername(hash);
    
    if (!tracking) {
      // Try fallback to JSON files for testing (solo para usernames)
      const jsonFallback = await tryLoadFromJSON(hash);
      if (jsonFallback) {
        return NextResponse.json(jsonFallback, { headers: corsHeaders });
      }
      
      return NextResponse.json({ error: 'Tracking not found' }, { 
        status: 404,
        headers: corsHeaders
      });
    }
    
    return NextResponse.json(tracking, { headers: corsHeaders });

  } catch (error) {
    logger.error('GET /api/public/tracking/hash/[hash] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
