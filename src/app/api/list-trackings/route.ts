import { NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';

/**
 * Endpoint temporal para listar todos los trackings
 */
export async function GET() {
  try {
    console.log('📋 [LIST] Getting all trackings...');
    
    const trackings = await FirebaseTrackingService.getAllTrackings();
    
    console.log('📋 [LIST] Found', trackings.length, 'trackings');
    
    return NextResponse.json({
      count: trackings.length,
      trackings: trackings,
      message: `Found ${trackings.length} trackings`
    });

  } catch (error) {
    console.error('❌ [LIST] Error getting trackings:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
