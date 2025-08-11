/**
 * Tipos específicos para el endpoint de retorno de Flow
 */
export interface ReturnRequestData {
  body: Record<string, unknown>;
  searchParams: Record<string, string>;
  token: string | null;
}

export interface ReturnRedirectInfo {
  redirectPath: string;
  redirectUrl: string;
  token: string | null;
  baseUrl: string;
}

export interface PaymentStatusInfo {
  status: number;
  redirectPath: string;
  shouldRedirect: boolean;
}

export interface ReturnProcessingResult {
  success: boolean;
  redirectInfo: ReturnRedirectInfo;
  error?: string;
}
