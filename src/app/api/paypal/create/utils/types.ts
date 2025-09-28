export interface PayPalProductData {
  totalUsd?: number;
  numberOfTrackers?: number;
  sensor?: string;
  magnetometer?: boolean;
  caseColor?: string;
  coverColor?: string;
  // Extras adicionales
  usbReceiverId?: string;
  usbReceiverCost?: number;
  strapId?: string;
  strapCost?: number;
  chargingDockId?: string;
  chargingDockCost?: number;
}

export interface UserData {
  email: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  nombreUsuarioVrChat: string;
}

export interface PayPalCreateRequest {
  amount: number;
  description: string;
  email: string;
  userData: UserData;
  productData?: PayPalProductData;
  transactionId: string;
}

export interface PayPalCreateResponse {
  success: boolean;
  paymentUrl: string;
  trackingId: string;
  transactionId: string;
  environment: 'live' | 'sandbox';
}

export interface PayPalCustomData {
  txnId: string;
  email: string;
  vrchat: string;
  trackers: number;
  amount: number;
}
