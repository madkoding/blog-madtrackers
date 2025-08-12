import { 
  createTrackingData, 
  createEnhancedTrackingData,
  createTrackingInFirebase,
  logTrackingCreated 
} from '../tracking';
import { TrackingManager } from '@/lib/trackingManager';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';
import { OrderStatus, UserTracking } from '@/interfaces/tracking';

// Mock dependencies
jest.mock('@/lib/trackingManager');
jest.mock('@/lib/firebaseTrackingService');

// Mock console.log para logTrackingCreated
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

// Helper para crear un mock completo de UserTracking
const createMockUserTracking = (overrides: Partial<UserTracking> = {}): UserTracking => ({
  nombreUsuario: 'testuser',
  contacto: 'test@example.com',
  userHash: 'hash_123',
  fechaEntrega: new Date().toISOString(),
  totalUsd: 150.00,
  abonadoUsd: 0,
  envioPagado: false,
  numeroTrackers: 5,
  sensor: 'ICM45686',
  magneto: false,
  porcentajes: {
    placa: 0,
    straps: 0,
    cases: 0,
    baterias: 0
  },
  colorCase: 'black',
  colorTapa: 'black',
  paisEnvio: 'Chile',
  estadoPedido: OrderStatus.WAITING,
  ...overrides
});

describe('PayPal Success Tracking Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
  });

  describe('createTrackingData', () => {
    const mockUserData = {
      email: 'test@example.com',
      pais: 'US',
      direccion: '123 Main St',
      ciudad: 'Springfield',
      estado: 'IL',
      nombreUsuarioVrChat: 'test_user'
    };

    const mockProductData = {
      numberOfTrackers: 3,
      sensor: 'ICM45686',
      magnetometer: true,
      caseColor: 'blue',
      coverColor: 'red'
    };

    beforeEach(() => {
      (TrackingManager.generateUserTracking as jest.Mock).mockReturnValue(
        createMockUserTracking({
          nombreUsuario: 'testuser',
          contacto: 'test@example.com',
          userHash: 'generated_hash'
        })
      );
    });

    it('should create tracking data with all parameters', () => {
      const result = createTrackingData('testuser', mockUserData, '150.00', mockProductData);

      expect(TrackingManager.generateUserTracking).toHaveBeenCalledWith({
        nombreUsuario: 'testuser',
        contacto: 'test@example.com',
        fechaLimite: expect.any(String),
        totalUsd: 150.00,
        abonadoUsd: 150.00,
        envioPagado: false,
        numeroTrackers: 3,
        sensor: 'ICM45686',
        magneto: true,
        colorCase: 'blue',
        colorTapa: 'red',
        paisEnvio: 'US',
        estadoPedido: OrderStatus.WAITING,
        porcentajes: {
          placa: 0,
          straps: 0,
          cases: 0,
          baterias: 0
        }
      });

      expect(result.nombreUsuario).toBe('testuser');
      expect(result.contacto).toBe('test@example.com');
      expect(result.userHash).toBe('generated_hash');
    });

    it('should create tracking data with minimal parameters', () => {
      createTrackingData('testuser', mockUserData, '75.00');

      const call = (TrackingManager.generateUserTracking as jest.Mock).mock.calls[0][0];
      expect(call.numeroTrackers).toBe(5); // default
      expect(call.sensor).toBe('ICM45686 + QMC6309'); // default
      expect(call.magneto).toBe(false); // default
      expect(call.colorCase).toBe('black'); // default
      expect(call.colorTapa).toBe('black'); // default
    });

    it('should handle partial product data', () => {
      const partialProductData = {
        numberOfTrackers: 2
      };

      createTrackingData('testuser', mockUserData, '100.00', partialProductData);

      const call = (TrackingManager.generateUserTracking as jest.Mock).mock.calls[0][0];
      expect(call.numeroTrackers).toBe(2);
      expect(call.sensor).toBe('ICM45686 + QMC6309'); // default
      expect(call.magneto).toBe(false); // default
      expect(call.colorCase).toBe('black'); // default
      expect(call.colorTapa).toBe('black'); // default
    });
  });

  describe('createEnhancedTrackingData', () => {
    const mockTrackingData = createMockUserTracking({
      nombreUsuario: 'testuser',
      contacto: 'test@example.com',
      userHash: 'hash_123'
    });

    const mockUserData = {
      email: 'test@example.com',
      pais: 'US',
      direccion: '123 Main St',
      ciudad: 'Springfield',
      estado: 'IL',
      nombreUsuarioVrChat: 'test_user'
    };

    it('should enhance tracking data with PayPal information', () => {
      const result = createEnhancedTrackingData(
        mockTrackingData,
        'trans_123',
        'pp_trans_456',
        '150.00',
        'USD',
        mockUserData
      );

      expect(result).toEqual({
        ...mockTrackingData,
        paymentMethod: 'PayPal',
        paymentTransactionId: 'trans_123',
        paypalTransactionId: 'pp_trans_456',
        paymentAmount: 150.00,
        paymentCurrency: 'USD',
        shippingAddress: {
          direccion: '123 Main St',
          ciudad: 'Springfield',
          estado: 'IL',
          pais: 'US'
        },
        vrchatUsername: 'test_user'
      });
    });

    it('should handle undefined paypalTransactionId', () => {
      const result = createEnhancedTrackingData(
        mockTrackingData,
        'trans_123',
        undefined,
        '100.00',
        'EUR',
        mockUserData
      );

      expect(result.paypalTransactionId).toBeUndefined();
      expect(result.paymentTransactionId).toBe('trans_123');
    });

    it('should use USD as default currency when undefined', () => {
      const result = createEnhancedTrackingData(
        mockTrackingData,
        'trans_123',
        'pp_trans_456',
        '75.00',
        undefined,
        mockUserData
      );

      expect(result.paymentCurrency).toBe('USD');
    });

    it('should preserve original tracking data properties', () => {
      const extendedTrackingData = createMockUserTracking({
        ...mockTrackingData,
        paymentMethod: 'custom_value' as any,
        paymentAmount: 42
      });

      const result = createEnhancedTrackingData(
        extendedTrackingData,
        'trans_123',
        'pp_trans_456',
        '200.00',
        'CAD',
        mockUserData
      );

      expect(result.paymentMethod).toBe('PayPal'); // Should be overridden
      expect(result.paymentAmount).toBe(200.00); // Should be overridden
      expect(result.nombreUsuario).toBe('testuser');
    });
  });

  describe('createTrackingInFirebase', () => {
    const mockEnhancedData = createMockUserTracking({
      nombreUsuario: 'testuser',
      paymentMethod: 'PayPal',
      userHash: 'hash_123'
    });

    it('should create tracking in Firebase and return ID', async () => {
      const expectedId = 'firebase_tracking_id_123';
      (FirebaseTrackingService.createTracking as jest.Mock).mockResolvedValue(expectedId);

      const result = await createTrackingInFirebase(mockEnhancedData);

      expect(FirebaseTrackingService.createTracking).toHaveBeenCalledWith(mockEnhancedData);
      expect(result).toBe(expectedId);
    });

    it('should handle Firebase creation failure', async () => {
      const error = new Error('Firebase connection failed');
      (FirebaseTrackingService.createTracking as jest.Mock).mockRejectedValue(error);

      await expect(createTrackingInFirebase(mockEnhancedData)).rejects.toThrow('Firebase connection failed');
    });
  });

  describe('logTrackingCreated', () => {
    const mockTrackingData = createMockUserTracking({
      nombreUsuario: 'testuser',
      userHash: 'hash_123'
    });

    it('should log tracking creation successfully', () => {
      logTrackingCreated('tracking_id_123', mockTrackingData, 'trans_456');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎯 [PAYPAL SUCCESS] Tracking created successfully:',
        {
          trackingId: 'tracking_id_123',
          username: 'testuser',
          userHash: 'hash_123',
          paymentMethod: 'PayPal',
          transactionId: 'trans_456'
        }
      );
    });

    it('should handle missing properties gracefully', () => {
      const incompleteData = createMockUserTracking({
        nombreUsuario: undefined as any,
        userHash: undefined
      });

      logTrackingCreated('tracking_id_456', incompleteData, 'trans_789');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎯 [PAYPAL SUCCESS] Tracking created successfully:',
        {
          trackingId: 'tracking_id_456',
          username: undefined,
          userHash: undefined,
          paymentMethod: 'PayPal',
          transactionId: 'trans_789'
        }
      );
    });
  });
});
