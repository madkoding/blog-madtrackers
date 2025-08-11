/**
 * Extrae el token de la petición
 * Prioriza el token de URL por encima del token del body
 */
export function extractToken(body: Record<string, unknown>, searchParams: URLSearchParams): string | null {
  console.log('🔍 [FLOW CONFIRM] Extracting token...');
  console.log('📄 [FLOW CONFIRM] Body:', body);
  console.log('🔗 [FLOW CONFIRM] Search params:', Object.fromEntries(searchParams.entries()));
  
  const bodyToken = body?.token;
  const urlToken = searchParams.get('token');
  
  console.log('🎫 [FLOW CONFIRM] Token from body:', bodyToken || 'NOT_FOUND');
  console.log('🎫 [FLOW CONFIRM] Token from URL:', urlToken || 'NOT_FOUND');
  
  const finalToken = urlToken || (typeof bodyToken === 'string' ? bodyToken : null);
  console.log('🎯 [FLOW CONFIRM] Final token selected:', finalToken || 'NO_TOKEN');
  
  return finalToken;
}
