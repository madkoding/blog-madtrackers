// Interface para la información de seguimiento de usuarios
import { FlowPaymentStatusResponse } from '@/lib/flowService';

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
  paymentTransactionId?: string; // ID de transacción del método de pago
  paymentFlowOrder?: number; // Flow Order ID específico para Flow
  paymentStatus?: string; // 'PENDING', 'COMPLETED', 'FAILED'
  paymentAmount?: number; // Monto del pago
  paymentCurrency?: string; // Moneda del pago
  paymentData?: FlowPaymentStatusResponse['paymentData']; // Datos adicionales del pago
  paymentCompletedAt?: string; // Fecha de completado del pago
  isPendingPayment?: boolean; // Flag para pagos pendientes
  
  // Dirección de envío
  shippingAddress?: {
    direccion?: string;
    ciudad?: string;
    estado?: string;
    pais?: string;
  };
  
  // VRChat username
  vrchatUsername?: string;
  
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
  // Sensores comentados - no disponibles actualmente
  // LSM6DSR = "LSM6DSR",
  // LSM6DSR_MMC = "LSM6DSR + QMC6309", 
  // ICM45686 = "ICM45686",
  ICM45686_QMC = "ICM45686 + QMC6309"
}
