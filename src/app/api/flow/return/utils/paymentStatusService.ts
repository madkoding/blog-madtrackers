import { PaymentStatusInfo } from './types';
import { ReturnLogger } from './requestLogger';

/**
 * Servicio para verificar el estado de pago y determinar la ruta de redirección
 */
export class PaymentStatusService {
  /**
   * Verifica el estado del pago y determina la ruta de redirección
   */
  static async verifyPaymentStatus(token: string, method: 'POST' | 'GET'): Promise<PaymentStatusInfo> {
    try {
      ReturnLogger.logPaymentStatusCheck(method);
      
      // Importar FlowService dinámicamente para verificar el estado
      const { getFlowService } = await import('@/lib/flowService');
      const flowService = getFlowService();
      
      const statusResponse = await flowService.getPaymentStatus({ token });
      ReturnLogger.logPaymentStatusResponse(method, statusResponse);
      
      if (statusResponse?.status !== undefined) {
        const redirectPath = this.mapStatusToRedirectPath(
          statusResponse.status, 
          method,
          statusResponse.paymentData
        );
        
        return {
          status: statusResponse.status,
          redirectPath,
          shouldRedirect: true
        };
      } else {
        ReturnLogger.logNoStatusResponse(method);
        return this.getDefaultStatusInfo();
      }
    } catch (statusError) {
      ReturnLogger.logStatusCheckError(method, statusError);
      return this.getDefaultStatusInfo();
    }
  }

  /**
   * Mapea el estado de Flow a una ruta de redirección
   */
  private static mapStatusToRedirectPath(status: number, method: 'POST' | 'GET', paymentData?: Record<string, unknown>): string {
    let redirectPath: string;
    
    // Detectar pago exitoso basado en paymentData (problema conocido de Flow con status 2)
    if (paymentData?.date && paymentData?.media && paymentData?.amount) {
      console.log(`🎉 [FLOW RETURN ${method}] OVERRIDE: PaymentData indicates successful payment despite status ${status}`);
      console.log(`💰 [FLOW RETURN ${method}] Payment amount:`, paymentData.amount);
      console.log(`💳 [FLOW RETURN ${method}] Payment method:`, paymentData.media);
      console.log(`📅 [FLOW RETURN ${method}] Payment date:`, paymentData.date);
      
      // Verificaciones adicionales de validez según documentación Flow
      if (paymentData.fee) {
        console.log(`💸 [FLOW RETURN ${method}] Flow fee:`, paymentData.fee);
      }
      if (paymentData.balance !== undefined) {
        console.log(`💵 [FLOW RETURN ${method}] Available balance:`, paymentData.balance);
      }
      if (paymentData.transferDate) {
        console.log(`📤 [FLOW RETURN ${method}] Transfer date:`, paymentData.transferDate);
      }
      
      redirectPath = '/payment-success';
      console.log(`📝 [FLOW RETURN ${method}] Status ${status} overridden to SUCCESS due to complete payment data`);
      return redirectPath;
    }
    
    switch (status) {
      case 1: // Pagado
        redirectPath = '/payment-success';
        break;
      case 2: // Pendiente
        redirectPath = '/payment-success'; // Los pagos pendientes van a success para seguimiento
        break;
      case 3: // Rechazado
        redirectPath = '/payment-cancel'; // Los pagos rechazados van a cancel
        break;
      case 4: // Cancelado/Anulado
        redirectPath = '/payment-cancel'; // Los pagos cancelados van a cancel
        break;
      default:
        redirectPath = '/payment-success'; // Default optimista para estados desconocidos
        break;
    }
    
    ReturnLogger.logPaymentStatusMapping(method, status);
    
    return redirectPath;
  }

  /**
   * Retorna la información de estado por defecto
   */
  private static getDefaultStatusInfo(): PaymentStatusInfo {
    return {
      status: 0,
      redirectPath: '/payment-success',
      shouldRedirect: true
    };
  }
}
