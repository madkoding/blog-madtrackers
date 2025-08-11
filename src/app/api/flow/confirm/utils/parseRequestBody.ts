import { NextRequest } from 'next/server';

/**
 * Procesa el cuerpo de la petición HTTP para extraer datos
 * Puede parsear JSON o form-urlencoded
 */
export async function parseRequestBody(request: NextRequest): Promise<Record<string, unknown>> {
  console.log('🔍 [FLOW CONFIRM] Parsing request body...');
  try {
    const textBody = await request.text();
    console.log('📄 [FLOW CONFIRM] Raw body content:', textBody || 'EMPTY');
    
    if (!textBody) {
      console.log('⚠️ [FLOW CONFIRM] No body content found');
      return {};
    }

    // Intentar parsear como JSON
    try {
      const jsonData = JSON.parse(textBody);
      console.log('✅ [FLOW CONFIRM] Successfully parsed as JSON:', jsonData);
      return jsonData;
    } catch (jsonError) {
      console.log('❌ [FLOW CONFIRM] Failed to parse as JSON:', jsonError);
      
      // Si no es JSON, podría ser form-urlencoded
      if (textBody.includes('=')) {
        const params = new URLSearchParams(textBody);
        const formData = Object.fromEntries(params.entries());
        console.log('✅ [FLOW CONFIRM] Successfully parsed as form-urlencoded:', formData);
        return formData;
      } else {
        console.log('❌ [FLOW CONFIRM] Not recognized as form-urlencoded either');
      }
    }
  } catch (error) {
    console.error('💥 [FLOW CONFIRM] Error parsing request body:', error);
  }
  
  console.log('⚠️ [FLOW CONFIRM] Returning empty object as fallback');
  return {};
}
