/**
 * Valida los parámetros requeridos para procesar un pago exitoso de PayPal
 */
export function validateSuccessRequest(body: any): { isValid: boolean; error?: string } {
  const { 
    transactionId, 
    payerEmail, 
    amount, 
    userData
  } = body;

  // Validar parámetros requeridos
  if (!transactionId || !payerEmail || !amount || !userData) {
    return {
      isValid: false,
      error: 'Missing required parameters: transactionId, payerEmail, amount, userData'
    };
  }

  // Validar que userData tenga los campos necesarios
  if (!userData.email || !userData.direccion || !userData.ciudad || !userData.estado || !userData.pais) {
    return {
      isValid: false,
      error: 'Missing required userData fields'
    };
  }

  return { isValid: true };
}
