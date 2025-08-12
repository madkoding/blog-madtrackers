import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';

/**
 * Endpoint temporal para verificar si un tracking existe
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trackingId = searchParams.get('id');
    
    if (!trackingId) {
      return NextResponse.json({ 
        error: 'No tracking ID provided. Use ?id=DOCUMENT_ID' 
      }, { status: 400 });
    }

    console.log('🔍 [VERIFY] Checking if tracking exists:', trackingId);
    
    const tracking = await FirebaseTrackingService.getTrackingById(trackingId);
    
    if (tracking) {
      console.log('✅ [VERIFY] Tracking found:', tracking);
      return NextResponse.json({
        exists: true,
        tracking: tracking,
        message: 'Tracking found successfully'
      });
    } else {
      console.log('❌ [VERIFY] Tracking not found');
      return NextResponse.json({
        exists: false,
        message: 'Tracking not found'
      });
    }

  } catch (error) {
    console.error('❌ [VERIFY] Error checking tracking:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
