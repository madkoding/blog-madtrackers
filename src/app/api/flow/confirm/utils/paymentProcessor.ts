import { FlowPaymentStatusResponse } from '@/lib/flowService';
import { initializeFlowService, verifyPaymentWithFlow } from './flowService';
import { getStatusMessage } from './getStatusMessage';
import { PaymentProcessingResult } from './types';

/**
 * Handles the complete payment verification flow with Flow API
 */
export async function processPaymentVerification(token: string): Promise<PaymentProcessingResult> {
  const flowService = initializeFlowService();
  const paymentStatus = await verifyPaymentWithFlow(flowService, token);
  const analysis = getStatusMessage(paymentStatus.status, paymentStatus.paymentData);
  
  return {
    paymentStatus,
    analysis
  };
}

/**
 * Registra los detalles de un pago exitoso
 */
export function logSuccessfulPayment(paymentStatus: FlowPaymentStatusResponse): void {
  console.log('🎉 [FLOW CONFIRM] ===============================================');
  console.log('🎉 [FLOW CONFIRM] PAYMENT SUCCESSFULLY CONFIRMED!');
  console.log('🎉 [FLOW CONFIRM] ===============================================');
  console.log('✅ [FLOW CONFIRM] Payment details:');
  console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
  console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
  console.log('   💰 Amount:', paymentStatus.amount);
  console.log('   👤 Payer:', paymentStatus.payer);
  console.log('   📅 Request Date:', paymentStatus.requestDate);
  if (paymentStatus.paymentData) {
    console.log('   💳 Payment Method:', paymentStatus.paymentData.media);
    console.log('   📅 Payment Date:', paymentStatus.paymentData.date);
  }
}

/**
 * Registra los detalles de un pago fallido
 */
export function logFailedPayment(paymentStatus: FlowPaymentStatusResponse, message: string): void {
  console.log('❌ [FLOW CONFIRM] ===============================================');
  console.log('❌ [FLOW CONFIRM] PAYMENT NOT SUCCESSFUL');
  console.log('❌ [FLOW CONFIRM] ===============================================');
  console.log('💔 [FLOW CONFIRM] Payment failure details:');
  console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
  console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
  console.log('   📊 Status Code:', paymentStatus.status);
  console.log('   💬 Status Message:', message);
  console.log('   💰 Amount:', paymentStatus.amount);
  console.log('   📅 Request Date:', paymentStatus.requestDate);
  if (paymentStatus.pending_info) {
    console.log('   ⏳ Pending Info:', paymentStatus.pending_info);
  }
}

/**
 * Registra la respuesta final que se envía a Flow
 */
export function logFinalResponse(isSuccess: boolean): void {
  console.log('📤 [FLOW CONFIRM] Preparing response for Flow...');
  console.log('🎯 [FLOW CONFIRM] ===============================================');
  console.log(`🎯 [FLOW CONFIRM] SENDING RESPONSE: ${isSuccess ? 'SUCCESS' : 'ERROR'}`);
  console.log('🎯 [FLOW CONFIRM] ===============================================');
}
