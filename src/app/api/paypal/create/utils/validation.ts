/**
 * Valida los datos requeridos para crear un pago PayPal
 */
export function validatePayPalCreateRequest(body: any): { isValid: boolean; error?: string } {
  const { amount, email, userData, transactionId } = body;

  // Validaciones básicas
  if (!email || !amount || !transactionId) {
    return {
      isValid: false,
      error: 'Email, amount y transactionId son requeridos'
    };
  }

  if (!userData?.direccion) {
    return {
      isValid: false,
      error: 'Datos de usuario incompletos'
    };
  }

  return { isValid: true };
}

/**
 * Valida que el email de negocio de PayPal esté configurado
 */
export function validatePayPalBusinessEmail(businessEmail: string): { isValid: boolean; error?: string } {
  if (businessEmail === 'tu-email@paypal.com') {
    return {
      isValid: false,
      error: 'PayPal business email no configurado'
    };
  }

  return { isValid: true };
}
