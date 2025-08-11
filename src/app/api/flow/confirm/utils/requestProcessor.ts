import { NextRequest } from 'next/server';
import { parseRequestBody } from './parseRequestBody';
import { extractToken } from './extractToken';
import { logCompleteRequestAnalysis } from './requestLogger';
import { FlowConfirmationContext } from './types';

/**
 * Procesa toda la información de la request de Flow
 */
export async function processFlowRequest(request: NextRequest): Promise<FlowConfirmationContext> {
  const body = await parseRequestBody(request);
  const searchParams = request.nextUrl.searchParams;
  const token = extractToken(body, searchParams);
  const headers = Object.fromEntries(request.headers.entries());
  
  const context: FlowConfirmationContext = {
    body,
    searchParams,
    token,
    headers,
    method: request.method,
    url: request.url
  };
  
  logCompleteRequestAnalysis({
    body,
    searchParams: Object.fromEntries(searchParams.entries()),
    token,
    headers,
    method: request.method,
    url: request.url
  });
  
  return context;
}

/**
 * Valida que el token esté presente en la request
 */
export function validateToken(token: string | null): boolean {
  if (!token) {
    console.error('💥 [FLOW CONFIRM] CRITICAL: No token provided in confirmation request');
    console.error('💥 [FLOW CONFIRM] This means Flow couldn\'t send the token properly');
    return false;
  }
  
  console.log('✅ [FLOW CONFIRM] Token found, proceeding to verify payment status...');
  return true;
}
