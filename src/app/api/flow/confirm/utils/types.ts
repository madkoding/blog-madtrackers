import { FlowPaymentStatusResponse } from '@/lib/flowService';

export interface PaymentAnalysis {
  isSuccess: boolean;
  message: string;
}

export interface FlowConfirmationContext {
  body: Record<string, unknown>;
  searchParams: URLSearchParams;
  token: string | null;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface PaymentProcessingResult {
  paymentStatus: FlowPaymentStatusResponse;
  analysis: PaymentAnalysis;
}
