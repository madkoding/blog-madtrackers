/**
 * Servicio consolidado para manejo de tracking con DTOs
 * Garantiza la consistencia de datos y centraliza la lógica de negocio
 */

import { FirebaseTrackingService } from './firebaseTrackingService';
import { generateUserHash } from '../utils/hashUtils';
import { 
  OrderStatus,
  CreateTrackingDTO,
  UpdateTrackingDTO,
  TrackingResponseDTO,
  ProductDataDTO,
  UserDataDTO,
  PaymentDataDTO,
  TrackingDTOValidator,
  TrackingDTOConverter
} from '../interfaces/tracking';

/**
 * Servicio para manejar operaciones de tracking usando DTOs
 */
export class TrackingService {

  /**
   * Crea un nuevo tracking usando un DTO validado
   */
  static async createTracking(dto: CreateTrackingDTO): Promise<TrackingResponseDTO> {
    try {
      console.log('🔒 [TRACKING SERVICE] Creating tracking with DTO validation...');
      
      // Validar DTO
      const validation = TrackingDTOValidator.validateCreateTrackingDTO(dto);
      if (!validation.isValid) {
        console.error('❌ [TRACKING SERVICE] DTO validation failed:', validation.errors);
        return {
          success: false,
          trackingId: '',
          userHash: '',
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }
      
      // Generar hash si no existe
      const userHash = dto.userHash ?? generateUserHash(dto.nombreUsuario);
      dto.userHash = userHash;
      
      // Convertir DTO a UserTracking
      const trackingData = TrackingDTOConverter.createDTOToUserTracking(dto);
      
      console.log('🔒 [TRACKING SERVICE] DTO converted to UserTracking:', {
        nombreUsuario: trackingData.nombreUsuario,
        userHash: trackingData.userHash,
        paymentMethod: trackingData.paymentMethod,
        paymentStatus: trackingData.paymentStatus,
        totalUsd: trackingData.totalUsd
      });
      
      // Crear en Firebase
      const trackingId = await FirebaseTrackingService.createTracking(trackingData);
      
      console.log('✅ [TRACKING SERVICE] Tracking created successfully:', trackingId);
      
      return {
        success: true,
        trackingId,
        userHash,
        data: trackingData
      };
      
    } catch (error) {
      console.error('❌ [TRACKING SERVICE] Error creating tracking:', error);
      return {
        success: false,
        trackingId: '',
        userHash: dto.userHash || '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualiza un tracking existente usando un DTO validado
   */
  static async updateTracking(updateDTO: UpdateTrackingDTO): Promise<TrackingResponseDTO> {
    try {
      console.log('🔒 [TRACKING SERVICE] Updating tracking with DTO:', updateDTO.id);
      
      // Obtener tracking existente
      const existingTracking = await FirebaseTrackingService.getTrackingById(updateDTO.id);
      if (!existingTracking) {
        return {
          success: false,
          trackingId: updateDTO.id,
          userHash: '',
          error: 'Tracking not found'
        };
      }
      
      // Aplicar cambios usando DTO
      const updatedTracking = TrackingDTOConverter.applyUpdateDTO(existingTracking, updateDTO);
      
      console.log('🔒 [TRACKING SERVICE] Applied DTO updates:', {
        id: updateDTO.id,
        estadoPedido: updatedTracking.estadoPedido,
        paymentStatus: updatedTracking.paymentStatus,
        updatedAt: updatedTracking.updatedAt
      });
      
      // Actualizar en Firebase
      await FirebaseTrackingService.updateTracking(updateDTO.id, updatedTracking);
      
      console.log('✅ [TRACKING SERVICE] Tracking updated successfully');
      
      return {
        success: true,
        trackingId: updateDTO.id,
        userHash: updatedTracking.userHash || '',
        data: updatedTracking
      };
      
    } catch (error) {
      console.error('❌ [TRACKING SERVICE] Error updating tracking:', error);
      return {
        success: false,
        trackingId: updateDTO.id,
        userHash: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Crea un tracking pendiente para PayPal
   */
  static async createPayPalPendingTracking(
    transactionId: string,
    email: string,
    amount: number,
    productData: Partial<ProductDataDTO>,
    userData: Partial<UserDataDTO>
  ): Promise<TrackingResponseDTO> {
    
    const dto: CreateTrackingDTO = {
      nombreUsuario: `paypal_${transactionId}`,
      contacto: email,
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
      paisEnvio: userData.country || 'Chile',
      estadoPedido: OrderStatus.PENDING_PAYMENT,
      
      productData: {
        totalUsd: productData.totalUsd || amount,
        numberOfTrackers: productData.numberOfTrackers || 6,
        sensor: productData.sensor || "ICM45686 + QMC6309",
        magnetometer: productData.magnetometer ?? true,
        caseColor: productData.caseColor || 'white',
        coverColor: productData.coverColor || 'white',
        usbReceiverId: productData.usbReceiverId || 'usb_3m',
        usbReceiverCost: productData.usbReceiverCost || 0,
        strapId: productData.strapId || 'velcro',
        strapCost: productData.strapCost || 0,
        chargingDockId: productData.chargingDockId || 'no_dock',
        chargingDockCost: productData.chargingDockCost || 0
      },
      
      userData,
      
      paymentData: {
        method: 'PayPal',
        transactionId,
        status: 'PENDING',
        currency: 'USD',
        amount
      }
    };
    
    return this.createTracking(dto);
  }

  /**
   * Crea un tracking pendiente para Flow
   */
  static async createFlowPendingTracking(
    commerceOrder: string,
    email: string,
    amount: number,
    productData: Partial<ProductDataDTO>,
    userData: Partial<UserDataDTO>
  ): Promise<TrackingResponseDTO> {
    
    const dto: CreateTrackingDTO = {
      nombreUsuario: `flow_${commerceOrder}`,
      contacto: email,
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 días
      paisEnvio: userData.country || 'Chile',
      estadoPedido: OrderStatus.PENDING_PAYMENT,
      
      productData: {
        totalUsd: productData.totalUsd || Math.round(amount / 920), // Conversión aprox CLP to USD
        numberOfTrackers: productData.numberOfTrackers || 6,
        sensor: productData.sensor || "ICM45686 + QMC6309",
        magnetometer: productData.magnetometer ?? true,
        caseColor: productData.caseColor || 'white',
        coverColor: productData.coverColor || 'white',
        usbReceiverId: productData.usbReceiverId || 'usb_3m',
        usbReceiverCost: productData.usbReceiverCost || 0,
        strapId: productData.strapId || 'velcro',
        strapCost: productData.strapCost || 0,
        chargingDockId: productData.chargingDockId || 'no_dock',
        chargingDockCost: productData.chargingDockCost || 0
      },
      
      userData,
      
      paymentData: {
        method: 'Flow',
        transactionId: commerceOrder,
        status: 'PENDING',
        currency: 'CLP',
        amount
      }
    };
    
    return this.createTracking(dto);
  }

  /**
   * Completa un pago pendiente
   */
  static async completePayment(
    trackingId: string,
    paymentData: Partial<PaymentDataDTO>
  ): Promise<TrackingResponseDTO> {
    
    const updateDTO: UpdateTrackingDTO = {
      id: trackingId,
      estadoPedido: OrderStatus.WAITING,
      paymentData: {
        ...paymentData,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      }
    };
    
    return this.updateTracking(updateDTO);
  }

  /**
   * Falla un pago pendiente
   */
  static async failPayment(
    trackingId: string
  ): Promise<TrackingResponseDTO> {
    
    const updateDTO: UpdateTrackingDTO = {
      id: trackingId,
      paymentData: {
        status: 'FAILED'
      }
    };
    
    return this.updateTracking(updateDTO);
  }
}
