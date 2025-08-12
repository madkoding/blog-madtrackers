export interface PayPalSuccessRequest {
  transactionId: string;
  paypalTransactionId?: string;
  payerEmail: string;
  amount: string;
  currency?: string;
  userData: UserData;
  productData?: ProductData;
}

export interface UserData {
  email: string;
  direccion: string;
  ciudad: string;
  estado: string;
  pais: string;
  nombreUsuarioVrChat?: string;
}

export interface ProductData {
  numberOfTrackers?: number;
  sensor?: string;
  magnetometer?: boolean;
  caseColor?: string;
  coverColor?: string;
}

export interface OrderDetails {
  transactionId: string;
  amount: number;
  currency: string;
  trackers: number;
  sensor: string;
  colors: {
    case: string;
    tapa: string;
  };
  shippingAddress: {
    direccion: string;
    ciudad: string;
    estado: string;
    pais: string;
  };
  paymentMethod: string;
  orderDate: string;
}

export interface PayPalSuccessResponse {
  success: boolean;
  trackingId?: string;
  username?: string;
  userHash?: string;
  message?: string;
  error?: string;
  details?: string;
}
