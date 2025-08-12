import { PayPalProductData, UserData, PayPalCustomData } from './types';

/**
 * Crea los datos personalizados para PayPal (límite 256 caracteres)
 */
export function createPayPalCustomData(
  transactionId: string,
  email: string,
  userData: UserData,
  productData: PayPalProductData | undefined,
  amount: number
): string {
  const customData: PayPalCustomData = {
    txnId: transactionId,
    email: email,
    vrchat: userData.nombreUsuarioVrChat || '',
    trackers: productData?.numberOfTrackers || 6,
    amount: amount
  };

  const customDataString = JSON.stringify(customData);
  
  // Verificar límite de caracteres
  if (customDataString.length > 256) {
    console.warn('⚠️ [PAYPAL CREATE] Custom data size:', customDataString.length, 'characters (limit: 256)');
  }

  return customDataString;
}

/**
 * Construye la URL de pago de PayPal
 */
export function buildPayPalUrl(
  baseUrl: string,
  businessEmail: string,
  description: string,
  amount: number,
  customData: string,
  urls: {
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  }
): string {
  const paypalUrl = new URL(baseUrl);
  paypalUrl.searchParams.append('cmd', '_xclick');
  paypalUrl.searchParams.append('business', businessEmail);
  paypalUrl.searchParams.append('item_name', description);
  paypalUrl.searchParams.append('amount', amount.toFixed(2));
  paypalUrl.searchParams.append('currency_code', 'USD');
  paypalUrl.searchParams.append('custom', customData);
  paypalUrl.searchParams.append('return', urls.returnUrl);
  paypalUrl.searchParams.append('cancel_return', urls.cancelUrl);
  paypalUrl.searchParams.append('notify_url', urls.notifyUrl);

  return paypalUrl.toString();
}
