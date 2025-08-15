/**
 * Tests para los DTOs de tracking
 * Valida que los DTOs garanticen la consistencia de datos
 */

import { 
  CreateTrackingDTO, 
  UpdateTrackingDTO,
  TrackingDTOValidator,
  TrackingDTOConverter,
  OrderStatus
} from '../interfaces/tracking';

describe('TrackingDTOValidator', () => {
  
  const validCreateDTO: CreateTrackingDTO = {
    nombreUsuario: 'test_user',
    contacto: 'test@example.com',
    fechaLimite: new Date().toISOString(),
    paisEnvio: 'Chile',
    estadoPedido: OrderStatus.PENDING_PAYMENT,
    productData: {
      totalUsd: 500,
      numberOfTrackers: 6,
      sensor: 'ICM45686 + QMC6309',
      magnetometer: true,
      caseColor: 'white',
      coverColor: 'black',
      usbReceiverId: 'usb_3m',
      usbReceiverCost: 25,
      strapId: 'velcro',
      strapCost: 15,
      chargingDockId: 'no_dock',
      chargingDockCost: 0
    },
    paymentData: {
      method: 'PayPal',
      transactionId: 'txn_123',
      status: 'PENDING',
      currency: 'USD',
      amount: 500
    }
  };

  describe('validateCreateTrackingDTO', () => {
    
    it('should validate a correct DTO', () => {
      const result = TrackingDTOValidator.validateCreateTrackingDTO(validCreateDTO);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject DTO with missing nombreUsuario', () => {
      const invalidDTO = { ...validCreateDTO, nombreUsuario: '' };
      const result = TrackingDTOValidator.validateCreateTrackingDTO(invalidDTO);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('nombreUsuario es requerido');
    });

    it('should reject DTO with missing contacto', () => {
      const invalidDTO = { ...validCreateDTO, contacto: '' };
      const result = TrackingDTOValidator.validateCreateTrackingDTO(invalidDTO);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('contacto es requerido');
    });

    it('should reject DTO with invalid productData', () => {
      const invalidDTO = { 
        ...validCreateDTO, 
        productData: { ...validCreateDTO.productData, totalUsd: 0 }
      };
      const result = TrackingDTOValidator.validateCreateTrackingDTO(invalidDTO);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('productData.totalUsd debe ser mayor a 0');
    });

    it('should reject DTO with invalid paymentData', () => {
      const invalidDTO = { 
        ...validCreateDTO, 
        paymentData: { ...validCreateDTO.paymentData, method: 'Invalid' as never }
      };
      const result = TrackingDTOValidator.validateCreateTrackingDTO(invalidDTO);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('paymentData.method debe ser PayPal o Flow');
    });
  });

  describe('validateProductData', () => {
    
    it('should validate correct product data', () => {
      const errors = TrackingDTOValidator.validateProductData(validCreateDTO.productData);
      expect(errors).toHaveLength(0);
    });

    it('should reject product data with zero totalUsd', () => {
      const invalidData = { ...validCreateDTO.productData, totalUsd: 0 };
      const errors = TrackingDTOValidator.validateProductData(invalidData);
      expect(errors).toContain('productData.totalUsd debe ser mayor a 0');
    });

    it('should reject product data with zero numberOfTrackers', () => {
      const invalidData = { ...validCreateDTO.productData, numberOfTrackers: 0 };
      const errors = TrackingDTOValidator.validateProductData(invalidData);
      expect(errors).toContain('productData.numberOfTrackers debe ser mayor a 0');
    });

    it('should reject product data with empty sensor', () => {
      const invalidData = { ...validCreateDTO.productData, sensor: '' };
      const errors = TrackingDTOValidator.validateProductData(invalidData);
      expect(errors).toContain('productData.sensor es requerido');
    });
  });

  describe('validatePaymentData', () => {
    
    it('should validate correct payment data', () => {
      const errors = TrackingDTOValidator.validatePaymentData(validCreateDTO.paymentData);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid payment method', () => {
      const invalidData = { ...validCreateDTO.paymentData, method: 'Bitcoin' as never };
      const errors = TrackingDTOValidator.validatePaymentData(invalidData);
      expect(errors).toContain('paymentData.method debe ser PayPal o Flow');
    });

    it('should reject empty transaction ID', () => {
      const invalidData = { ...validCreateDTO.paymentData, transactionId: '' };
      const errors = TrackingDTOValidator.validatePaymentData(invalidData);
      expect(errors).toContain('paymentData.transactionId es requerido');
    });

    it('should reject invalid status', () => {
      const invalidData = { ...validCreateDTO.paymentData, status: 'UNKNOWN' as never };
      const errors = TrackingDTOValidator.validatePaymentData(invalidData);
      expect(errors).toContain('paymentData.status debe ser PENDING, COMPLETED o FAILED');
    });

    it('should reject invalid currency', () => {
      const invalidData = { ...validCreateDTO.paymentData, currency: 'EUR' as never };
      const errors = TrackingDTOValidator.validatePaymentData(invalidData);
      expect(errors).toContain('paymentData.currency debe ser USD o CLP');
    });
  });
});

describe('TrackingDTOConverter', () => {
  
  const validCreateDTO: CreateTrackingDTO = {
    nombreUsuario: 'test_user',
    userHash: 'hash_123',
    contacto: 'test@example.com',
    fechaLimite: '2024-12-31T23:59:59.000Z',
    paisEnvio: 'Chile',
    estadoPedido: OrderStatus.PENDING_PAYMENT,
    productData: {
      totalUsd: 500,
      numberOfTrackers: 6,
      sensor: 'ICM45686 + QMC6309',
      magnetometer: true,
      caseColor: 'white',
      coverColor: 'black',
      usbReceiverId: 'usb_3m',
      usbReceiverCost: 25,
      strapId: 'velcro',
      strapCost: 15,
      chargingDockId: 'no_dock',
      chargingDockCost: 0
    },
    userData: {
      email: 'test@example.com',
      address: '123 Test St',
      cityState: 'Santiago, RM',
      country: 'Chile',
      nombreUsuarioVrChat: 'TestVR'
    },
    paymentData: {
      method: 'PayPal',
      transactionId: 'txn_123',
      status: 'PENDING',
      currency: 'USD',
      amount: 500,
      paypalTransactionId: 'pp_txn_456'
    }
  };

  describe('createDTOToUserTracking', () => {
    
    it('should convert CreateTrackingDTO to UserTracking correctly', () => {
      const userTracking = TrackingDTOConverter.createDTOToUserTracking(validCreateDTO);
      
      // Verificar campos básicos
      expect(userTracking.nombreUsuario).toBe('test_user');
      expect(userTracking.userHash).toBe('hash_123');
      expect(userTracking.contacto).toBe('test@example.com');
      expect(userTracking.fechaLimite).toBe('2024-12-31T23:59:59.000Z');
      expect(userTracking.fechaEntrega).toBe('2024-12-31T23:59:59.000Z');
      expect(userTracking.paisEnvio).toBe('Chile');
      expect(userTracking.estadoPedido).toBe(OrderStatus.PENDING_PAYMENT);
      
      // Verificar datos del producto
      expect(userTracking.totalUsd).toBe(500);
      expect(userTracking.numeroTrackers).toBe(6);
      expect(userTracking.sensor).toBe('ICM45686 + QMC6309');
      expect(userTracking.magneto).toBe(true);
      expect(userTracking.colorCase).toBe('white');
      expect(userTracking.colorTapa).toBe('black');
      
      // Verificar datos de pago
      expect(userTracking.paymentMethod).toBe('PayPal');
      expect(userTracking.paymentTransactionId).toBe('txn_123');
      expect(userTracking.paypalTransactionId).toBe('pp_txn_456');
      expect(userTracking.paymentStatus).toBe('PENDING');
      expect(userTracking.paymentCurrency).toBe('USD');
      expect(userTracking.isPendingPayment).toBe(true);
      
      // Verificar dirección de envío
      expect(userTracking.shippingAddress).toEqual({
        address: '123 Test St',
        cityState: 'Santiago, RM',
        country: 'Chile'
      });
      
      // Verificar VRChat username
      expect(userTracking.vrchatUsername).toBe('TestVR');
      
      // Verificar extras
      expect(userTracking.extrasSeleccionados).toEqual({
        usbReceiver: { id: 'usb_3m', cost: 25 },
        strap: { id: 'velcro', cost: 15 },
        chargingDock: { id: 'no_dock', cost: 0 }
      });
      
      // Verificar porcentajes por defecto
      expect(userTracking.porcentajes).toEqual({
        placa: 0,
        straps: 0,
        cases: 0,
        baterias: 0
      });
      
      // Verificar que se establecen timestamps
      expect(userTracking.createdAt).toBeDefined();
      expect(userTracking.updatedAt).toBeDefined();
    });

    it('should handle DTO without userData', () => {
      const dtoWithoutUserData = { ...validCreateDTO };
      delete dtoWithoutUserData.userData;
      
      const userTracking = TrackingDTOConverter.createDTOToUserTracking(dtoWithoutUserData);
      
      expect(userTracking.shippingAddress).toBeUndefined();
      expect(userTracking.vrchatUsername).toBeUndefined();
    });

    it('should set abonadoUsd to 0 for PENDING payments', () => {
      const userTracking = TrackingDTOConverter.createDTOToUserTracking(validCreateDTO);
      expect(userTracking.abonadoUsd).toBe(0);
    });

    it('should set abonadoUsd to totalUsd for COMPLETED payments', () => {
      const completedDTO = {
        ...validCreateDTO,
        paymentData: { ...validCreateDTO.paymentData, status: 'COMPLETED' as const }
      };
      
      const userTracking = TrackingDTOConverter.createDTOToUserTracking(completedDTO);
      expect(userTracking.abonadoUsd).toBe(500);
    });
  });

  describe('applyUpdateDTO', () => {
    
    const existingTracking = TrackingDTOConverter.createDTOToUserTracking(validCreateDTO);
    
    it('should update payment status correctly', () => {
      const updateDTO: UpdateTrackingDTO = {
        id: 'tracking_123',
        paymentData: {
          status: 'COMPLETED',
          amount: 500,
          completedAt: '2024-01-15T10:00:00.000Z'
        }
      };
      
      const updated = TrackingDTOConverter.applyUpdateDTO(existingTracking, updateDTO);
      
      expect(updated.paymentStatus).toBe('COMPLETED');
      expect(updated.paymentAmount).toBe(500);
      expect(updated.paymentCompletedAt).toBe('2024-01-15T10:00:00.000Z');
      expect(updated.isPendingPayment).toBe(false);
      expect(updated.abonadoUsd).toBe(500);
    });

    it('should update order status correctly', () => {
      const updateDTO: UpdateTrackingDTO = {
        id: 'tracking_123',
        estadoPedido: OrderStatus.MANUFACTURING
      };
      
      const updated = TrackingDTOConverter.applyUpdateDTO(existingTracking, updateDTO);
      expect(updated.estadoPedido).toBe(OrderStatus.MANUFACTURING);
    });

    it('should update porcentajes correctly', () => {
      const updateDTO: UpdateTrackingDTO = {
        id: 'tracking_123',
        porcentajes: {
          placa: 50,
          straps: 75
        }
      };
      
      const updated = TrackingDTOConverter.applyUpdateDTO(existingTracking, updateDTO);
      expect(updated.porcentajes.placa).toBe(50);
      expect(updated.porcentajes.straps).toBe(75);
      expect(updated.porcentajes.cases).toBe(0); // Mantiene valores existentes
      expect(updated.porcentajes.baterias).toBe(0);
    });

    it('should update updatedAt timestamp', () => {
      const updateDTO: UpdateTrackingDTO = {
        id: 'tracking_123',
        estadoPedido: OrderStatus.SHIPPING
      };
      
      const updated = TrackingDTOConverter.applyUpdateDTO(existingTracking, updateDTO);
      expect(updated.updatedAt).toBeDefined();
      expect(new Date(updated.updatedAt!).getTime()).toBeGreaterThan(new Date(existingTracking.updatedAt!).getTime());
    });
  });
});

describe('Integration Tests', () => {
  
  it('should maintain data consistency through DTO conversion cycle', () => {
    const originalDTO: CreateTrackingDTO = {
      nombreUsuario: 'integration_test',
      contacto: 'integration@test.com',
      fechaLimite: '2024-12-31T23:59:59.000Z',
      paisEnvio: 'Argentina',
      estadoPedido: OrderStatus.WAITING,
      productData: {
        totalUsd: 750,
        numberOfTrackers: 8,
        sensor: 'ICM45686 + QMC6309',
        magnetometer: false,
        caseColor: 'black',
        coverColor: 'white',
        usbReceiverId: 'usb_5m',
        usbReceiverCost: 35,
        strapId: 'elastic',
        strapCost: 20,
        chargingDockId: 'wireless_dock',
        chargingDockCost: 50
      },
      paymentData: {
        method: 'Flow',
        transactionId: 'flow_12345',
        status: 'COMPLETED',
        currency: 'CLP',
        amount: 750000,
        flowOrderId: 98765
      }
    };
    
    // Convertir DTO a UserTracking
    const userTracking = TrackingDTOConverter.createDTOToUserTracking(originalDTO);
    
    // Verificar que todos los datos se preservaron correctamente
    expect(userTracking.nombreUsuario).toBe(originalDTO.nombreUsuario);
    expect(userTracking.contacto).toBe(originalDTO.contacto);
    expect(userTracking.totalUsd).toBe(originalDTO.productData.totalUsd);
    expect(userTracking.paymentMethod).toBe(originalDTO.paymentData.method);
    expect(userTracking.paymentFlowOrder).toBe(originalDTO.paymentData.flowOrderId);
    expect(userTracking.abonadoUsd).toBe(originalDTO.productData.totalUsd); // COMPLETED payment
    
    // Aplicar una actualización
    const updateDTO: UpdateTrackingDTO = {
      id: 'test_id',
      estadoPedido: OrderStatus.SHIPPING,
      porcentajes: {
        placa: 100,
        straps: 100,
        cases: 80,
        baterias: 90
      }
    };
    
    const updatedTracking = TrackingDTOConverter.applyUpdateDTO(userTracking, updateDTO);
    
    // Verificar que la actualización se aplicó correctamente
    expect(updatedTracking.estadoPedido).toBe(OrderStatus.SHIPPING);
    expect(updatedTracking.porcentajes.placa).toBe(100);
    expect(updatedTracking.porcentajes.cases).toBe(80);
    
    // Verificar que los datos originales se mantuvieron
    expect(updatedTracking.nombreUsuario).toBe(originalDTO.nombreUsuario);
    expect(updatedTracking.totalUsd).toBe(originalDTO.productData.totalUsd);
    expect(updatedTracking.paymentMethod).toBe(originalDTO.paymentData.method);
  });
});
