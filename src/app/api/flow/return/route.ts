import { NextRequest } from 'next/server';
import { ReturnRequestProcessor } from './utils';

/**
 * API endpoint para manejar la redirección POST de Flow
 * Flow puede enviar tanto GET como POST al urlReturn
 */
export async function POST(request: NextRequest) {
  return ReturnRequestProcessor.processPostRequest(request);
}

/**
 * También manejar GET en caso de que Flow use GET
 */
export async function GET(request: NextRequest) {
  return ReturnRequestProcessor.processGetRequest(request);
}
