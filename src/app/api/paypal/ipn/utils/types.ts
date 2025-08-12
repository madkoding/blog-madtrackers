export interface PayPalIPNData {
  payment_status: string | null;
  txn_id: string | null;
  payer_email: string | null;
  mc_gross: string | null;
  mc_currency: string | null;
  custom: string | null;
}

export interface PayPalCustomData {
  txnId: string;
  email: string;
  vrchat: string;
  trackers: number;
  amount: number;
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

export interface IPNVerificationResult {
  isVerified: boolean;
  ipnData?: PayPalIPNData;
}
