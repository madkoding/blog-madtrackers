import { PaymentStatusInfo } from './types';
import { ReturnLogger } from './requestLogger';
import { FlowPaymentStatusResponse } from '@/lib/flowService';

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
        
        // Si el pago es exitoso y tenemos userData, crear el tracking
        const isSuccessful = this.isPaymentSuccessful(statusResponse.status, statusResponse.paymentData);
        if (isSuccessful && statusResponse.optional?.userData) {
          try {
            await this.createTrackingForSuccessfulPayment(statusResponse, method);
          } catch (trackingError) {
            console.error(`❌ [FLOW RETURN ${method}] Error creating tracking:`, trackingError);
            // No fallar la redirección por un error de tracking
          }
        }
        
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
   * Determina si un pago es exitoso basado en status y paymentData
   */
  private static isPaymentSuccessful(status: number, paymentData?: Record<string, unknown>): boolean {
    // Si hay paymentData con fecha, media y monto, considerar como exitoso
    if (paymentData?.date && paymentData?.media && paymentData?.amount) {
      return true;
    }
    
    // Si no hay paymentData, basarse en el status
    return status === 1; // Status 1 = Pagado
  }

  /**
   * Actualiza un tracking pendiente o crea uno nuevo para un pago exitoso
   */
  private static async createTrackingForSuccessfulPayment(statusResponse: FlowPaymentStatusResponse, method: 'POST' | 'GET'): Promise<void> {
    try {
      console.log(`🎯 [FLOW RETURN ${method}] Processing tracking for successful payment...`);
      
      const userData = statusResponse.optional?.userData;
      if (!userData) {
        console.log(`⚠️ [FLOW RETURN ${method}] No userData found in payment response`);
        return;
      }

      // Primero intentar actualizar un tracking existente
      const updatePayload = {
        commerceOrder: statusResponse.commerceOrder,
        flowOrder: statusResponse.flowOrder,
        amount: statusResponse.amount,
        payer: statusResponse.payer,
        paymentData: statusResponse.paymentData
      };

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const updateResponse = await fetch(`${baseUrl}/api/flow/update-tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`✅ [FLOW RETURN ${method}] Existing tracking updated successfully:`, result);
        return;
      }
      
      // Si no hay tracking existente, crear uno nuevo
      if (updateResponse.status === 404) {
        console.log(`📝 [FLOW RETURN ${method}] No pending tracking found, creating new one...`);
        
        const successPayload = {
          commerceOrder: statusResponse.commerceOrder,
          flowOrder: statusResponse.flowOrder,
          amount: statusResponse.amount,
          currency: statusResponse.currency,
          payer: statusResponse.payer,
          paymentData: statusResponse.paymentData,
          userData: userData,
          productData: {}
        };

        const createResponse = await fetch(`${baseUrl}/api/flow/success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(successPayload)
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          console.log(`✅ [FLOW RETURN ${method}] New tracking created successfully:`, result);
        } else {
          const errorText = await createResponse.text();
          console.error(`❌ [FLOW RETURN ${method}] Error creating new tracking:`, errorText);
        }
      } else {
        const errorText = await updateResponse.text();
        console.error(`❌ [FLOW RETURN ${method}] Error updating existing tracking:`, errorText);
      }
    } catch (error) {
      console.error(`❌ [FLOW RETURN ${method}] Exception processing tracking:`, error);
      throw error;
    }
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
