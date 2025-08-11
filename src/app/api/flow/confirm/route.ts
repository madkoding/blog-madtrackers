import { NextRequest } from 'next/server';
import { handlePostConfirmation } from './utils/confirmationHandler';
import { handleGetConfirmation, handleOptionsRequest } from './utils/httpHandlers';

/**
 * Endpoint de confirmación para Flow
 * Flow llama a este endpoint para confirmar que la transacción fue procesada correctamente
 * Este endpoint debe responder con un mensaje específico que Flow entienda
 * 
 * IMPORTANTE: En desarrollo (localhost), Flow no puede alcanzar este endpoint
 * desde internet, por lo que el pago se procesará pero Flow reportará error de confirmación.
 * En producción con dominio público, funcionará correctamente.
 */
export async function POST(request: NextRequest) {
  return handlePostConfirmation(request);
}

/**
 * También manejar GET en caso de que Flow use GET para confirmación
 */
export async function GET(request: NextRequest) {
  return handleGetConfirmation(request);
}

/**
 * Manejar OPTIONS para CORS
 */
export async function OPTIONS() {
  return handleOptionsRequest();
}
