import { NextRequest, NextResponse } from 'next/server';
import { getFlowService } from '@/lib/flowService';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingManager } from '@/lib/trackingManager';
import { OrderStatus } from '@/interfaces/tracking';

interface FlowProductData {
  totalUsd?: number;
  numberOfTrackers?: number;
  sensor?: string;
  magnetometer?: boolean;
  caseColor?: string;
  coverColor?: string;
  // Extras adicionales
  usbReceiverId?: string;
  usbReceiverCost?: number;
  strapId?: string;
  strapCost?: number;
  chargingDockId?: string;
  chargingDockCost?: number;
}

// Importar utils específicos para mejor trazabilidad
import { validateFlowCreateParams, normalizeAmount } from './utils/flowValidation';
import { 
  createFlowLogContext, 
  logFlowEndpointStart, 
  logFlowParameters, 
  logFlowValidationError,
  logFlowSuccess,
  logFlowError,
  logFlowEndpointEnd
} from './utils/flowLogging';
import { generateCommerceOrder } from './utils/flowOrderGenerator';
import { getFlowConfig, buildFlowUrls, buildFlowPaymentParams, formatConfigForLogging } from './utils/flowConfig';
import type { UserData } from './utils/flowValidation';
import { buildSuccessResponse, validatePaymentData } from './utils/flowUrlBuilder';
import { createFlowErrorResponse, createValidationErrorResponse } from './utils/flowErrorHandler';

/**
 * Crea un tracking en estado PENDING antes del pago
 */
async function createPendingTracking(
  commerceOrder: string, 
  email: string, 
  amount: number, 
  userData: UserData,
  productData?: FlowProductData
): Promise<string> {
  // Generar un nombre de usuario temporal basado en el commerceOrder
  const username = `flow_${commerceOrder}`;

  console.log('📦 [FLOW CREATE] Creating pending tracking with product data:', productData);

  // Crear el tracking usando TrackingManager con los datos reales del producto
  const trackingData = TrackingManager.generateUserTracking({
    nombreUsuario: username,
    contacto: email,
    fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
    totalUsd: productData?.totalUsd || Math.round(amount / 920), // Usar precio real del producto o conversión aprox
    abonadoUsd: 0, // Pendiente de pago
    envioPagado: false,
    numeroTrackers: productData?.numberOfTrackers || 6, // Primera opción por defecto
    sensor: productData?.sensor || "ICM45686 + QMC6309", // Primer sensor disponible
    magneto: productData?.magnetometer || true,
    colorCase: productData?.caseColor || 'white', // Segundo color por defecto (posición 0)
    colorTapa: productData?.coverColor || 'white', // Primer color por defecto (posición 0)
    paisEnvio: userData.pais || 'Chile',
    estadoPedido: OrderStatus.PENDING_PAYMENT, // Estado específico para pago pendiente
    porcentajes: {
      placa: 0,
      straps: 0,
      cases: 0,
      baterias: 0
    }
  });

  // Agregar información adicional del pago pendiente (solo campos esenciales)
  const enhancedTrackingData = {
    ...trackingData,
    // Payment info (solo campos necesarios)
    paymentMethod: 'Flow',
    paymentTransactionId: commerceOrder,
    paymentStatus: 'PENDING',
    paymentCurrency: 'CLP',
    // VRChat username
    vrchatUsername: userData.nombreUsuarioVrChat,
    // Dirección de envío (solo si es diferente al país ya guardado)
    ...(userData.direccion && {
      shippingAddress: {
        address: userData.direccion,
        cityState: userData.ciudad && userData.estado 
          ? `${userData.ciudad}, ${userData.estado}` 
          : userData.ciudad || userData.estado,
        country: userData.pais
      }
    }),
    // Extras adicionales
    extrasSeleccionados: {
      usbReceiver: {
        id: productData?.usbReceiverId || 'usb_3m',
        cost: productData?.usbReceiverCost || 0
      },
      strap: {
        id: productData?.strapId || 'velcro',
        cost: productData?.strapCost || 0
      },
      chargingDock: {
        id: productData?.chargingDockId || 'no_dock',
        cost: productData?.chargingDockCost || 0
      }
    }
  };

  // Crear el tracking en Firebase
  return await FirebaseTrackingService.createTracking(enhancedTrackingData);
}

/**
 * API endpoint para crear un pago con Flow
 */
export async function POST(request: NextRequest) {
  const logContext = createFlowLogContext('CREATE', request);
  logFlowEndpointStart(logContext);
  
  try {
    console.log('🏁 [FLOW CREATE] Starting payment creation process...');
    
    const body = await request.json();
    console.log('📄 [FLOW CREATE] Request body:', body);
    
    const { amount, description, email, userData, productData } = body;
    console.log('📄 [FLOW CREATE] Product data received:', productData);
    logFlowParameters('CREATE', { amount, description, email, userData, productData });

    // Validar parámetros usando el util de validación
    const validation = validateFlowCreateParams({ amount, description, email, userData });
    if (!validation.isValid) {
      logFlowValidationError('CREATE', validation.errors, validation.missingFields);
      return createValidationErrorResponse(validation.errors);
    }

    // Generar ID único para la orden usando el util
    const commerceOrder = generateCommerceOrder();
    console.log('🆔 [FLOW CREATE] Generated commerce order ID:', commerceOrder);
    
    // Obtener configuración y URLs usando utils
    const config = getFlowConfig();
    const urls = buildFlowUrls(request);
    
    console.log('🌐 [FLOW CREATE] Base URL:', urls.baseUrl);
    console.log('🔧 [FLOW CREATE] Initializing FlowService...');
    console.log('🔑 [FLOW CREATE] Environment variables:');
    
    const configForLogging = formatConfigForLogging(config);
    logFlowParameters('CONFIG', configForLogging);

    // Configurar el servicio Flow
    const flowService = getFlowService();

    // Preparar datos del pago usando el util de configuración
    const paymentParams = buildFlowPaymentParams(
      commerceOrder,
      description,
      normalizeAmount(amount, config.currency),
      email,
      urls,
      config,
      { userData, productData }
    );

    console.log('📋 [FLOW CREATE] Payment parameters prepared:', {
      ...paymentParams,
      optional: 'JSON_STRING' // No mostrar el JSON completo en el log
    });

    console.log('📞 [FLOW CREATE] Calling Flow API to create payment...');

    // Si tenemos userData, crear un tracking PENDING antes del pago
    let pendingTrackingId: string | null = null;
    if (userData) {
      try {
        pendingTrackingId = await createPendingTracking(commerceOrder, email, amount, userData, productData);
        console.log('📝 [FLOW CREATE] Pending tracking created:', pendingTrackingId);
      } catch (trackingError) {
        console.error('⚠️ [FLOW CREATE] Error creating pending tracking:', trackingError);
        // No fallar la creación del pago por un error de tracking
      }
    }

    // Crear el pago en Flow
    const paymentData = await flowService.createPayment(paymentParams);

    // Validar datos de respuesta usando el util
    if (!validatePaymentData(paymentData)) {
      throw new Error('Invalid payment data received from Flow API');
    }

    logFlowSuccess('CREATE', {
      paymentUrl: paymentData.url,
      token: paymentData.token,
      flowOrder: paymentData.flowOrder
    });

    // Construir respuesta usando el util
    const responseData = buildSuccessResponse(paymentData, commerceOrder);

    console.log('📤 [FLOW CREATE] Sending success response:', responseData);
    console.log('✅ [FLOW CREATE] Payment creation completed successfully');

    return NextResponse.json(responseData);

  } catch (error) {
    logFlowError('CREATE', error);
    return createFlowErrorResponse(error);
  } finally {
    logFlowEndpointEnd('CREATE');
  }
}
