/**
 * Obtiene la configuración del entorno PayPal
 */
export function getPayPalConfiguration() {
  const isProduction = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === 'live';
  const paypalBusinessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL ?? 'tu-email@paypal.com';
  
  return {
    isProduction,
    paypalBusinessEmail,
    baseUrl: isProduction 
      ? 'https://www.paypal.com/cgi-bin/webscr'
      : 'https://www.sandbox.paypal.com/cgi-bin/webscr'
  };
}

/**
 * Obtiene las URLs de retorno para PayPal
 */
export function getPayPalReturnUrls(transactionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return {
    returnUrl: `${baseUrl}/payment-success?paypal=true&transactionId=${transactionId}`,
    cancelUrl: `${baseUrl}/payment-cancel`,
    notifyUrl: `${baseUrl}/api/paypal/ipn`
  };
}
