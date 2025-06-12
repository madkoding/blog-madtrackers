import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '../../../../../lib/firebaseTrackingService';
import { corsHeaders } from '../../../../../lib/apiAuth';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to try loading from JSON file fallback
async function tryLoadFromJSON(username: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'tracking', `${username}.json`);
    const jsonData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(jsonData);
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

// GET - Endpoint público para obtener tracking por username desde la web
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const resolvedParams = await params;
    const username = decodeURIComponent(resolvedParams.username);
    
    if (!username || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const tracking = await FirebaseTrackingService.getTrackingByUsername(username);
    
    if (!tracking) {
      // Try fallback to JSON files for testing
      const jsonFallback = await tryLoadFromJSON(username);
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
    console.error('GET /api/public/tracking/[username] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
