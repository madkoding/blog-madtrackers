import { FlowService } from '@/lib/flowService';

/**
 * Inicializa y configura el servicio de Flow
 */
export function initializeFlowService(): FlowService {
  console.log('🔧 [FLOW CONFIRM] Initializing FlowService...');
  console.log('🔑 [FLOW CONFIRM] API Key:', process.env.FLOW_API_KEY ? 'SET' : 'NOT_SET');
  console.log('🔐 [FLOW CONFIRM] Secret Key:', process.env.FLOW_SECRET_KEY ? 'SET' : 'NOT_SET');
  console.log('🌐 [FLOW CONFIRM] Base URL:', process.env.FLOW_BASE_URL || 'sandbox.flow.cl');
  
  const flowService = new FlowService({
    apiKey: process.env.FLOW_API_KEY!,
    secretKey: process.env.FLOW_SECRET_KEY!,
    baseUrl: process.env.FLOW_BASE_URL || 'sandbox.flow.cl'
  });
  
  return flowService;
}

/**
 * Realiza la verificación del estado de pago con Flow
 */
export async function verifyPaymentWithFlow(flowService: FlowService, token: string) {
  console.log('📞 [FLOW CONFIRM] Calling Flow API to get payment status...');
  console.log('🎫 [FLOW CONFIRM] Using token:', token);
  
  const paymentStatus = await flowService.getPaymentStatus({ token });
  
  console.log('📥 [FLOW CONFIRM] Payment status response received:');
  console.log('   🆔 Flow Order:', paymentStatus.flowOrder);
  console.log('   🛒 Commerce Order:', paymentStatus.commerceOrder);
  console.log('   📊 Status:', paymentStatus.status);
  console.log('   💰 Amount:', paymentStatus.amount);
  console.log('   👤 Payer:', paymentStatus.payer);
  console.log('   📅 Request Date:', paymentStatus.requestDate);
  console.log('   💳 Payment Data:', paymentStatus.paymentData);
  console.log('   ⏳ Pending Info:', paymentStatus.pending_info);
  console.log('📋 [FLOW CONFIRM] Full payment status object:', JSON.stringify(paymentStatus, null, 2));
  
  return paymentStatus;
}
