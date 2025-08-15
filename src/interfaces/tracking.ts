// Interface para la información de seguimiento de usuarios
import { FlowPaymentStatusResponse } from '../lib/flowService';

// Enum para los estados del pedido
export enum OrderStatus {
  WAITING = "waiting",           // En espera
  PENDING_PAYMENT = "pending_payment", // Pendiente de pago
  MANUFACTURING = "manufacturing", // En fabricación
  TESTING = "testing",           // En prueba
  SHIPPING = "shipping",         // En envío
  RECEIVED = "received",         // Recibido
  DELIVERED = "DELIVERED",       // Entregado
  PRODUCTION = "PRODUCTION",
}

export interface UserTracking {
  id?: string; // ID de Firestore
  nombreUsuario: string;
  userHash?: string; // Hash seguro del nombre de usuario para URLs
  contacto: string;
  fechaEntrega: string; // ISO date string
  fechaLimite?: string; // Temporal para transición
  totalUsd: number; // Precio base en USD
  abonadoUsd: number; // Cantidad pagada en USD
  envioPagado: boolean;
  numeroTrackers: number;
  sensor: string;
  magneto: boolean;
  porcentajes: {
    placa: number;
    straps: number;
    cases: number;
    baterias: number;
  };
  colorCase: string;
  colorTapa: string;
  paisEnvio: string;
  estadoPedido: OrderStatus;
  
  // Campos de pago
  paymentMethod?: string; // 'PayPal', 'Flow', etc.
  paymentTransactionId?: string; // ID de transacción del método de pago (nuestro ID personalizado)
  paypalTransactionId?: string; // ID real de transacción de PayPal
  paymentFlowOrder?: number; // Flow Order ID específico para Flow
  paymentStatus?: string; // 'PENDING', 'COMPLETED', 'FAILED'
  paymentAmount?: number; // Monto del pago
  paymentCurrency?: string; // Moneda del pago
  paymentData?: FlowPaymentStatusResponse['paymentData']; // Datos adicionales del pago
  paymentCompletedAt?: string; // Fecha de completado del pago
  isPendingPayment?: boolean; // Flag para pagos pendientes
  
  // Dirección de envío
  shippingAddress?: {
    address?: string;
    cityState?: string;
    country?: string;
  };
  
  // VRChat username
  vrchatUsername?: string;
  
  // Extras seleccionados (nueva estructura para extras)
  extrasSeleccionados?: {
    usbReceiver?: {
      id: string;
      cost: number;
    };
    strap?: {
      id: string;
      cost: number;
    };
    chargingDock?: {
      id: string;
      cost: number;
    };
  };
  
  // Campos de auditoría de Firestore
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  // Mantener compatibilidad con valores existentes en moneda local
  total?: number; // Deprecated: usar totalUsd
  abonado?: number; // Deprecated: usar abonadoUsd
}

// Enum para los estados de progreso
export enum ProgressStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 50,
  COMPLETED = 100
}

// Enum para los colores disponibles
export enum Colors {
  WHITE = "white",
  BLACK = "black",
  RED = "red",
  BLUE = "blue",
  PURPLE = "purple",
  YELLOW = "yellow",
  GREEN = "green",
  ORANGE = "orange",
  PINK = "pink",
  GRAY = "gray"
}

// Enum para los sensores disponibles
export enum SensorTypes {
  LSM6DSR = "LSM6DSR",
  LSM6DSR_MMC = "LSM6DSR + QMC6309", 
  ICM45686 = "ICM45686",
  ICM45686_QMC = "ICM45686 + QMC6309"
}

// ========== DTOs (Data Transfer Objects) para garantizar consistencia ==========

// DTO para datos del producto - estructura fija para evitar inconsistencias
export interface ProductDataDTO {
  totalUsd: number;
  numberOfTrackers: number;
  sensor: string;
  magnetometer: boolean;
  caseColor: string;
  coverColor: string;
  // Extras con estructura controlada
  usbReceiverId: string;
  usbReceiverCost: number;
  strapId: string;
  strapCost: number;
  chargingDockId: string;
  chargingDockCost: number;
}

// DTO para datos del usuario
export interface UserDataDTO {
  email: string;
  address?: string;
  cityState?: string;
  country: string;
  nombreUsuarioVrChat?: string;
}

// DTO para información de pago - tipos controlados
export interface PaymentDataDTO {
  method: 'PayPal' | 'Flow';
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  currency: 'USD' | 'CLP';
  amount?: number;
  completedAt?: string;
  // Campos específicos por método
  paypalTransactionId?: string;
  flowOrderId?: number;
  flowPaymentData?: FlowPaymentStatusResponse['paymentData'];
}

// DTO principal para crear un tracking - validación obligatoria
export interface CreateTrackingDTO {
  nombreUsuario: string;
  userHash?: string;
  contacto: string;
  fechaLimite: string;
  paisEnvio: string;
  estadoPedido: OrderStatus;
  
  // Datos estructurados (requeridos)
  productData: ProductDataDTO;
  paymentData: PaymentDataDTO;
  
  // Datos opcionales
  userData?: Partial<UserDataDTO>;
  
  // Campos de auditoría (auto-generados)
  createdAt?: string;
  updatedAt?: string;
}

// DTO para actualizar un tracking existente
export interface UpdateTrackingDTO {
  id: string;
  
  // Campos actualizables
  estadoPedido?: OrderStatus;
  paymentData?: Partial<PaymentDataDTO>;
  productData?: Partial<ProductDataDTO>;
  userData?: Partial<UserDataDTO>;
  
  // Porcentajes de progreso
  porcentajes?: {
    placa?: number;
    straps?: number;
    cases?: number;
    baterias?: number;
  };
  
  // Campos de auditoría
  updatedAt?: string;
}

// DTO de respuesta después de crear/actualizar
export interface TrackingResponseDTO {
  success: boolean;
  trackingId: string;
  userHash: string;
  error?: string;
  data?: UserTracking;
}

// ========== Validadores para DTOs ==========

export class TrackingDTOValidator {
  
  static validateCreateTrackingDTO(dto: CreateTrackingDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validar campos requeridos
    if (!dto.nombreUsuario?.trim()) {
      errors.push('nombreUsuario es requerido');
    }
    
    if (!dto.contacto?.trim()) {
      errors.push('contacto es requerido');
    }
    
    if (!dto.fechaLimite) {
      errors.push('fechaLimite es requerida');
    }
    
    if (!dto.paisEnvio?.trim()) {
      errors.push('paisEnvio es requerido');
    }
    
    // Validar datos del producto
    if (!dto.productData) {
      errors.push('productData es requerido');
    } else {
      const productErrors = this.validateProductData(dto.productData);
      errors.push(...productErrors);
    }
    
    // Validar datos de pago
    if (!dto.paymentData) {
      errors.push('paymentData es requerido');
    } else {
      const paymentErrors = this.validatePaymentData(dto.paymentData);
      errors.push(...paymentErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateProductData(productData: ProductDataDTO): string[] {
    const errors: string[] = [];
    
    if (!productData.totalUsd || productData.totalUsd <= 0) {
      errors.push('productData.totalUsd debe ser mayor a 0');
    }
    
    if (!productData.numberOfTrackers || productData.numberOfTrackers <= 0) {
      errors.push('productData.numberOfTrackers debe ser mayor a 0');
    }
    
    if (!productData.sensor?.trim()) {
      errors.push('productData.sensor es requerido');
    }
    
    if (!productData.caseColor?.trim()) {
      errors.push('productData.caseColor es requerido');
    }
    
    if (!productData.coverColor?.trim()) {
      errors.push('productData.coverColor es requerido');
    }
    
    return errors;
  }
  
  static validatePaymentData(paymentData: PaymentDataDTO): string[] {
    const errors: string[] = [];
    
    if (!['PayPal', 'Flow'].includes(paymentData.method)) {
      errors.push('paymentData.method debe ser PayPal o Flow');
    }
    
    if (!paymentData.transactionId?.trim()) {
      errors.push('paymentData.transactionId es requerido');
    }
    
    if (!['PENDING', 'COMPLETED', 'FAILED'].includes(paymentData.status)) {
      errors.push('paymentData.status debe ser PENDING, COMPLETED o FAILED');
    }
    
    if (!['USD', 'CLP'].includes(paymentData.currency)) {
      errors.push('paymentData.currency debe ser USD o CLP');
    }
    
    return errors;
  }
}

// ========== Convertidores entre DTOs y UserTracking ==========

export class TrackingDTOConverter {
  
  /**
   * Convierte un CreateTrackingDTO a UserTracking
   */
  static createDTOToUserTracking(dto: CreateTrackingDTO): UserTracking {
    const now = new Date().toISOString();
    
    return {
      nombreUsuario: dto.nombreUsuario,
      userHash: dto.userHash,
      contacto: dto.contacto,
      fechaEntrega: dto.fechaLimite,
      fechaLimite: dto.fechaLimite,
      totalUsd: dto.productData.totalUsd,
      abonadoUsd: dto.paymentData.status === 'COMPLETED' ? dto.productData.totalUsd : 0,
      envioPagado: false,
      numeroTrackers: dto.productData.numberOfTrackers,
      sensor: dto.productData.sensor,
      magneto: dto.productData.magnetometer,
      porcentajes: {
        placa: 0,
        straps: 0,
        cases: 0,
        baterias: 0
      },
      colorCase: dto.productData.caseColor,
      colorTapa: dto.productData.coverColor,
      paisEnvio: dto.paisEnvio,
      estadoPedido: dto.estadoPedido,
      
      // Campos de pago
      paymentMethod: dto.paymentData.method,
      paymentTransactionId: dto.paymentData.transactionId,
      paypalTransactionId: dto.paymentData.paypalTransactionId,
      paymentFlowOrder: dto.paymentData.flowOrderId,
      paymentStatus: dto.paymentData.status,
      paymentAmount: dto.paymentData.amount,
      paymentCurrency: dto.paymentData.currency,
      paymentData: dto.paymentData.flowPaymentData,
      paymentCompletedAt: dto.paymentData.completedAt,
      isPendingPayment: dto.paymentData.status === 'PENDING',
      
      // Dirección de envío
      shippingAddress: dto.userData ? {
        address: dto.userData.address,
        cityState: dto.userData.cityState,
        country: dto.userData.country
      } : undefined,
      
      // VRChat username
      vrchatUsername: dto.userData?.nombreUsuarioVrChat,
      
      // Extras seleccionados
      extrasSeleccionados: {
        usbReceiver: {
          id: dto.productData.usbReceiverId,
          cost: dto.productData.usbReceiverCost
        },
        strap: {
          id: dto.productData.strapId,
          cost: dto.productData.strapCost
        },
        chargingDock: {
          id: dto.productData.chargingDockId,
          cost: dto.productData.chargingDockCost
        }
      },
      
      // Campos de auditoría
      createdAt: dto.createdAt || now,
      updatedAt: dto.updatedAt || now
    };
  }
  
  /**
   * Aplica un UpdateTrackingDTO a un UserTracking existente
   */
  static applyUpdateDTO(existing: UserTracking, updateDTO: UpdateTrackingDTO): UserTracking {
    const updated = { ...existing };
    
    // Actualizar campos simples
    if (updateDTO.estadoPedido !== undefined) {
      updated.estadoPedido = updateDTO.estadoPedido;
    }
    
    // Actualizar datos de pago
    if (updateDTO.paymentData) {
      this.updatePaymentData(updated, updateDTO.paymentData);
    }
    
    // Actualizar datos del producto
    if (updateDTO.productData) {
      this.updateProductData(updated, updateDTO.productData);
    }
    
    // Actualizar porcentajes
    if (updateDTO.porcentajes) {
      updated.porcentajes = {
        ...updated.porcentajes,
        ...updateDTO.porcentajes
      };
    }
    
    // Actualizar timestamp
    updated.updatedAt = updateDTO.updatedAt || new Date().toISOString();
    
    return updated;
  }
  
  /**
   * Actualiza los datos de pago en el tracking
   */
  private static updatePaymentData(tracking: UserTracking, paymentData: Partial<PaymentDataDTO>): void {
    if (paymentData.status) tracking.paymentStatus = paymentData.status;
    if (paymentData.amount) tracking.paymentAmount = paymentData.amount;
    if (paymentData.completedAt) tracking.paymentCompletedAt = paymentData.completedAt;
    if (paymentData.paypalTransactionId) tracking.paypalTransactionId = paymentData.paypalTransactionId;
    if (paymentData.flowOrderId) tracking.paymentFlowOrder = paymentData.flowOrderId;
    
    // Actualizar isPendingPayment
    tracking.isPendingPayment = paymentData.status === 'PENDING';
    
    // Actualizar abonadoUsd si el pago se completó
    if (paymentData.status === 'COMPLETED' && paymentData.amount) {
      tracking.abonadoUsd = paymentData.amount;
    }
  }
  
  /**
   * Actualiza los datos del producto en el tracking
   */
  private static updateProductData(tracking: UserTracking, productData: Partial<ProductDataDTO>): void {
    if (productData.totalUsd) tracking.totalUsd = productData.totalUsd;
    if (productData.numberOfTrackers) tracking.numeroTrackers = productData.numberOfTrackers;
    if (productData.sensor) tracking.sensor = productData.sensor;
    if (productData.magnetometer !== undefined) tracking.magneto = productData.magnetometer;
    if (productData.caseColor) tracking.colorCase = productData.caseColor;
    if (productData.coverColor) tracking.colorTapa = productData.coverColor;
  }
}
