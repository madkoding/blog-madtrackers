export interface PayPalStatusRequest {
  transactionId?: string | null;
  trackingId?: string | null;
}

export interface PayPalPaymentStatus {
  status: number;
  statusText: string;
  isPaymentSuccessful: boolean;
}

export interface PayPalStatusResponse {
  success: boolean;
  payment?: {
    transactionId: string;
    status: number;
    statusText: string;
    isPaymentSuccessful: boolean;
    amount: string;
    currency: string;
    payer: string;
    paymentMethod: string;
    trackingId: string;
    username: string;
    orderDate: string;
  };
  error?: string;
  timestamp: string;
}

export interface TrackingData {
  id?: string;
  userHash?: string;
  paymentTransactionId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  estadoPedido?: string;
  abonadoUsd?: number;
  totalUsd?: number;
  paymentCurrency?: string;
  contacto?: string;
  nombreUsuario?: string;
  createdAt?: string;
}
