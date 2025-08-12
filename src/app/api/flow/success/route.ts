import { NextRequest, NextResponse } from 'next/server';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { TrackingManager } from '@/lib/trackingManager';
import { OrderStatus } from '@/interfaces/tracking';
import { EmailService } from '@/lib/emailService';

/**
 * API endpoint para procesar pagos exitosos de Flow y crear tracking
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`🎉 [FLOW SUCCESS ${requestId}] Starting Flow payment processing at ${new Date().toISOString()}...`);
    
    const body = await request.json();
    console.log(`📄 [FLOW SUCCESS ${requestId}] Request body:`, body);
    
    const { 
      commerceOrder,
      flowOrder,
      amount, 
      currency,
      payer,
      paymentData,
      userData,
      productData 
    } = body;

    // Validar parámetros requeridos
    if (!commerceOrder || !flowOrder || !amount || !payer || !userData) {
      console.error(`❌ [FLOW SUCCESS ${requestId}] Missing required parameters`);
      return NextResponse.json({ 
        error: 'Missing required parameters: commerceOrder, flowOrder, amount, payer, userData' 
      }, { status: 400 });
    }

    // Validar que userData tenga los campos necesarios
    if (!payer || !userData.direccion || !userData.ciudad || !userData.estado || !userData.pais) {
      console.error(`❌ [FLOW SUCCESS ${requestId}] Missing userData fields`);
      return NextResponse.json({ 
        error: 'Missing required userData fields' 
      }, { status: 400 });
    }

    // 🚨 VALIDACIÓN DE DUPLICADOS: Verificar si ya existe una orden con este commerceOrder
    console.log(`🔍 [FLOW SUCCESS ${requestId}] Checking for existing tracking with commerceOrder:`, commerceOrder);
    const existingTracking = await FirebaseTrackingService.getTrackingByPaymentTransactionId(commerceOrder);
    
    if (existingTracking) {
      // Si ya existe un tracking COMPLETADO, es un duplicado
      if (existingTracking.estadoPedido !== OrderStatus.PENDING_PAYMENT) {
        const processingTime = Date.now() - startTime;
        console.warn(`⚠️ [FLOW SUCCESS ${requestId}] Duplicate order detected! Returning existing tracking (${processingTime}ms):`, {
          commerceOrder,
          existingUserHash: existingTracking.userHash,
          existingUsername: existingTracking.nombreUsuario,
          existingStatus: existingTracking.estadoPedido
        });
        
        return NextResponse.json({
          success: true,
          trackingId: existingTracking.userHash,
          username: existingTracking.nombreUsuario,
          userHash: existingTracking.userHash,
          message: 'Order already exists - returning existing tracking',
          isDuplicate: true
        });
      } else {
        // Si existe un tracking PENDIENTE, lo vamos a actualizar con los datos del pago exitoso
        console.log(`🔄 [FLOW SUCCESS ${requestId}] Found pending tracking, will update it:`, {
          commerceOrder,
          existingUserHash: existingTracking.userHash,
          existingStatus: existingTracking.estadoPedido
        });
      }
    }

    console.log(`✅ [FLOW SUCCESS ${requestId}] Creating tracking for Flow payment:`, {
      commerceOrder,
      flowOrder,
      amount,
      payer,
      productData: productData,
      userData: {
        direccion: userData.direccion,
        ciudad: userData.ciudad,
        estado: userData.estado,
        pais: userData.pais,
        nombreUsuarioVrChat: userData.nombreUsuarioVrChat || 'N/A'
      }
    });

    console.log(`🔍 [FLOW SUCCESS ${requestId}] DETAILED PRODUCT DATA ANALYSIS:`, {
      'Raw productData': productData,
      'Raw userData': userData,
      'Raw amount': amount,
      'Raw currency': currency,
      'Raw paymentData': paymentData,
      'productData keys': productData ? Object.keys(productData) : 'NO PRODUCT DATA',
      'userData keys': userData ? Object.keys(userData) : 'NO USER DATA',
      'paymentData keys': paymentData ? Object.keys(paymentData) : 'NO PAYMENT DATA'
    });

    // Calcular el monto real pagado desde Flow
    const realAmountPaidUsd = paymentData?.amount ? 
      parseFloat(paymentData.amount.toString()) : 
      (productData?.totalUsd || Math.round(parseFloat(amount) / 1000));
    
    console.log(`💰 [FLOW SUCCESS ${requestId}] Payment amount calculation:`, {
      'paymentData.amount': paymentData?.amount,
      'paymentData.currency': paymentData?.currency,
      'productData.totalUsd': productData?.totalUsd,
      'amount (CLP)': amount,
      'amount converted to USD (fallback)': Math.round(parseFloat(amount) / 1000),
      'FINAL realAmountPaidUsd': realAmountPaidUsd
    });

    // Generar un nombre de usuario basado en el email para el tracking
    const username = existingTracking ? 
      existingTracking.nombreUsuario : 
      payer.split('@')[0] + '_' + Date.now().toString().slice(-6);

    // Si ya existe un tracking pendiente, usar sus datos de producto
    let trackingData;
    if (existingTracking && existingTracking.estadoPedido === OrderStatus.PENDING_PAYMENT) {
      console.log(`� [FLOW SUCCESS ${requestId}] Updating existing pending tracking...`);
      
      // Actualizar el tracking existente con los datos del pago exitoso
      trackingData = {
        ...existingTracking,
        abonadoUsd: realAmountPaidUsd, // Actualizar el monto abonado
        estadoPedido: OrderStatus.WAITING, // Cambiar a estado WAITING
        paymentStatus: 'COMPLETED',
        fechaPago: new Date().toISOString(),
        // Mantener todos los datos del producto del tracking pendiente
      };
    } else {
      console.log(`🆕 [FLOW SUCCESS ${requestId}] Creating new tracking...`);
      
      // Crear el tracking usando TrackingManager con valores por defecto mejorados
      trackingData = TrackingManager.generateUserTracking({
        nombreUsuario: username,
        contacto: payer,
        fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
        totalUsd: realAmountPaidUsd, // Usar el monto real pagado
        abonadoUsd: realAmountPaidUsd, // Flow pago completo
        envioPagado: false, // El envío se paga por separado normalmente
        numeroTrackers: productData?.numberOfTrackers || 6, // Primera opción por defecto
        sensor: productData?.sensor || "ICM45686 + QMC6309", // Primer sensor disponible
        magneto: productData?.magnetometer || false,
        colorCase: productData?.caseColor || 'black', // Segundo color por defecto (posición 1)
        colorTapa: productData?.coverColor || 'white', // Primer color por defecto (posición 0)
        paisEnvio: userData.pais,
        estadoPedido: OrderStatus.WAITING,
        porcentajes: {
          placa: 0,
          straps: 0,
          cases: 0,
          baterias: 0
        }
      });
    }

    console.log(`🔍 [FLOW SUCCESS ${requestId}] TRACKING DATA FINAL VALIDATION:`, {
      'FINAL tracking data': {
        numeroTrackers: trackingData.numeroTrackers,
        sensor: trackingData.sensor,
        colorCase: trackingData.colorCase,
        colorTapa: trackingData.colorTapa,
        magneto: trackingData.magneto,
        totalUsd: trackingData.totalUsd,
        abonadoUsd: trackingData.abonadoUsd,
        estadoPedido: trackingData.estadoPedido
      },
      'Source': existingTracking ? 'Updated from pending tracking' : 'Created new tracking',
      'productData received': productData,
      'paymentData received': paymentData,
      'realAmountPaidUsd calculated': realAmountPaidUsd
    });

    // Agregar información adicional del pago de Flow
    const enhancedTrackingData = {
      ...trackingData,
      paymentMethod: 'Flow',
      paymentTransactionId: commerceOrder,
      paymentFlowOrder: flowOrder,
      paymentAmount: parseFloat(amount),
      paymentCurrency: currency || 'CLP',
      paymentData: paymentData || null,
      shippingAddress: {
        direccion: userData.direccion,
        ciudad: userData.ciudad,
        estado: userData.estado,
        pais: userData.pais
      },
      vrchatUsername: userData.nombreUsuarioVrChat
    };

    // Crear o actualizar el tracking en Firebase
    console.log(`📝 [FLOW SUCCESS ${requestId}] About to ${existingTracking ? 'update' : 'create'} tracking in Firebase...`);
    console.log(`📋 [FLOW SUCCESS ${requestId}] Enhanced tracking data:`, JSON.stringify(enhancedTrackingData, null, 2));
    
    let finalTrackingId: string;
    if (existingTracking && existingTracking.estadoPedido === OrderStatus.PENDING_PAYMENT) {
      // Actualizar tracking existente
      finalTrackingId = existingTracking.userHash!;
      await FirebaseTrackingService.updateTracking(finalTrackingId, enhancedTrackingData);
      console.log(`✅ [FLOW SUCCESS ${requestId}] Existing tracking updated:`, finalTrackingId);
    } else {
      // Crear nuevo tracking
      finalTrackingId = await FirebaseTrackingService.createTracking(enhancedTrackingData);
      console.log(`✅ [FLOW SUCCESS ${requestId}] New tracking created:`, finalTrackingId);
    }

    // Enviar correo de confirmación de compra
    console.log(`📧 [FLOW SUCCESS ${requestId}] Sending purchase confirmation email...`);
    try {
      const orderDetails = {
        transactionId: commerceOrder,
        amount: trackingData.totalUsd, // Usar el total del tracking creado (más preciso)
        currency: 'USD', // Siempre mostramos en USD para consistencia
        trackers: trackingData.numeroTrackers, // Usar datos del tracking real
        sensor: trackingData.sensor, // Usar sensor del tracking real
        colors: {
          case: trackingData.colorCase, // Usar color del tracking real
          tapa: trackingData.colorTapa // Usar color del tracking real
        },
        shippingAddress: {
          direccion: userData.direccion || 'No especificada',
          ciudad: userData.ciudad || 'No especificada', 
          estado: userData.estado || 'No especificado',
          pais: userData.pais || 'Chile'
        },
        paymentMethod: 'Flow (Webpay)',
        orderDate: new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const emailSent = await EmailService.sendPurchaseConfirmation(
        payer,
        userData.nombreUsuarioVrChat || 'Usuario',
        finalTrackingId,
        orderDetails
      );

      if (emailSent) {
        console.log(`✅ [FLOW SUCCESS ${requestId}] Purchase confirmation email sent successfully`);
      } else {
        console.warn(`⚠️ [FLOW SUCCESS ${requestId}] Failed to send purchase confirmation email`);
      }
    } catch (emailError) {
      console.error(`❌ [FLOW SUCCESS ${requestId}] Error sending purchase confirmation email:`, emailError);
    }

    const processingTime = Date.now() - startTime;
    console.log(`🎯 [FLOW SUCCESS ${requestId}] Tracking ${existingTracking ? 'updated' : 'created'} successfully (${processingTime}ms):`, {
      trackingId: finalTrackingId,
      username: trackingData.nombreUsuario,
      userHash: finalTrackingId,
      paymentMethod: 'Flow',
      commerceOrder,
      flowOrder
    });

    return NextResponse.json({
      success: true,
      trackingId: finalTrackingId,
      username: trackingData.nombreUsuario,
      userHash: finalTrackingId,
      message: 'Payment processed and tracking created successfully'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [FLOW SUCCESS ${requestId}] Error processing Flow payment (${processingTime}ms):`, error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
