import { FlowPaymentStatusResponse } from '@/lib/flowService';

/**
 * Determina el estado del pago y mensaje correspondiente
 * NOTA: Flow a veces reporta status 2 pero con paymentData válido,
 * lo que indica que el pago SÍ fue procesado exitosamente
 */
export function getStatusMessage(
  status: number, 
  paymentData?: FlowPaymentStatusResponse['paymentData']
): { isSuccess: boolean; message: string } {
  console.log(`🔍 [FLOW CONFIRM] Analyzing payment status: ${status}`);
  console.log(`🔍 [FLOW CONFIRM] Payment data present: ${paymentData ? 'YES' : 'NO'}`);
  
  if (paymentData) {
    console.log('💳 [FLOW CONFIRM] Payment data details:', paymentData);
  }
  
  let result: { isSuccess: boolean; message: string };
  
  // Si hay paymentData con fecha, media y monto, considerar como exitoso
  // independientemente del status (problema conocido de Flow)
  if (paymentData?.date && paymentData?.media && paymentData?.amount) {
    console.log('🎉 [FLOW CONFIRM] OVERRIDE: PaymentData indicates successful payment despite status 2');
    console.log('💰 [FLOW CONFIRM] Payment amount:', paymentData.amount);
    console.log('💳 [FLOW CONFIRM] Payment method:', paymentData.media);
    console.log('📅 [FLOW CONFIRM] Payment date:', paymentData.date);
    console.log('💸 [FLOW CONFIRM] Flow fee:', paymentData.fee);
    console.log('💵 [FLOW CONFIRM] Available balance:', paymentData.balance);
    
    result = { isSuccess: true, message: 'Payment confirmed successfully (verified by paymentData)' };
    console.log('✅ [FLOW CONFIRM] Status override: Payment confirmed by paymentData presence');
  } else {
    // Usar el status normal si no hay paymentData válido
    switch (status) {
      case 1: 
        result = { isSuccess: true, message: 'Payment confirmed successfully' };
        console.log('✅ [FLOW CONFIRM] Status 1: Payment successful');
        break;
      case 2: 
        result = { isSuccess: false, message: 'Payment rejected' };
        console.log('❌ [FLOW CONFIRM] Status 2: Payment rejected');
        break;
      case 3: 
        result = { isSuccess: false, message: 'Payment pending' };
        console.log('⏳ [FLOW CONFIRM] Status 3: Payment pending');
        break;
      case 4: 
        result = { isSuccess: false, message: 'Payment cancelled' };
        console.log('🚫 [FLOW CONFIRM] Status 4: Payment cancelled');
        break;
      default: 
        result = { isSuccess: false, message: `Unknown payment status: ${status}` };
        console.log(`❓ [FLOW CONFIRM] Unknown status: ${status}`);
        break;
    }
  }
  
  console.log('📊 [FLOW CONFIRM] Status analysis result:', result);
  return result;
}
