// Mock the dependencies first
jest.mock('@/lib/firebaseTrackingService');
jest.mock('@/lib/trackingManager');

import { createPendingTracking } from '../tracking';
import { PayPalProductData, UserData } from '../types';
import { TrackingManager } from '@/lib/trackingManager';
import { FirebaseTrackingService } from '@/lib/firebaseTrackingService';

const mockTrackingManager = TrackingManager as jest.MockedClass<typeof TrackingManager>;
const mockFirebaseTrackingService = FirebaseTrackingService as jest.MockedClass<typeof FirebaseTrackingService>;

describe('PayPal Create Tracking Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockTrackingManager.generateUserTracking as jest.Mock).mockReturnValue({
      id: 'tracking_123',
      nombreUsuario: 'paypal_txn_123',
      userHash: 'hash_123'
    });
    (mockFirebaseTrackingService.createTracking as jest.Mock).mockResolvedValue('tracking_id_123');
  });

  describe('createPendingTracking', () => {
    const mockUserData: UserData = {
      email: 'test@example.com',
      direccion: 'Test Address',
      ciudad: 'Test City',
      estado: 'Test State',
      pais: 'Chile'
    };

    const mockProductData: PayPalProductData = {
      totalUsd: 250,
      numberOfTrackers: 6,
      sensor: 'ICM45686 + QMC6309',
      magnetometer: true,
      caseColor: 'black',
      coverColor: 'white'
    };

    it('should create pending tracking with product data', async () => {
      const result = await createPendingTracking(
        'txn_123',
        'test@example.com',
        250,
        mockUserData,
        mockProductData
      );

      expect(mockTrackingManager.generateUserTracking).toHaveBeenCalledWith({
        nombreUsuario: 'paypal_txn_123',
        contacto: 'test@example.com',
        fechaLimite: expect.any(String),
        totalUsd: 250,
        abonadoUsd: 0,
        envioPagado: false,
        numeroTrackers: 6,
        sensor: 'ICM45686 + QMC6309',
        magneto: true,
        colorCase: 'black',
        colorTapa: 'white',
        paisEnvio: 'Chile',
        estadoPedido: 'pending_payment',
        porcentajes: {
          placa: 0,
          straps: 0,
          cases: 0,
          baterias: 0
        }
      });

      expect(mockFirebaseTrackingService.createTracking).toHaveBeenCalledWith({
        id: 'tracking_123',
        nombreUsuario: 'paypal_txn_123',
        userHash: 'hash_123',
        paymentMethod: 'PayPal',
        paymentTransactionId: 'txn_123',
        paymentStatus: 'PENDING',
        paymentCurrency: 'USD',
        shippingAddress: {
          direccion: 'Test Address',
          ciudad: 'Test City',
          estado: 'Test State',
          pais: 'Chile'
        },
        vrchatUsername: undefined,
        extrasSeleccionados: {
          usbReceiver: {
            id: 'usb_3m',
            cost: 0
          },
          strap: {
            id: 'velcro',
            cost: 0
          },
          chargingDock: {
            id: 'no_dock',
            cost: 0
          }
        }
      });

      expect(result).toBe('tracking_id_123');
    });

    it('should create pending tracking with default values when product data is not provided', async () => {
      const result = await createPendingTracking(
        'txn_456',
        'test@example.com',
        150,
        mockUserData
      );

      expect(mockTrackingManager.generateUserTracking).toHaveBeenCalledWith({
        nombreUsuario: 'paypal_txn_456',
        contacto: 'test@example.com',
        fechaLimite: expect.any(String),
        totalUsd: 150,
        abonadoUsd: 0,
        envioPagado: false,
        numeroTrackers: 6,
        sensor: 'ICM45686 + QMC6309',
        magneto: true,
        colorCase: 'white',
        colorTapa: 'white',
        paisEnvio: 'Chile',
        estadoPedido: 'pending_payment',
        porcentajes: {
          placa: 0,
          straps: 0,
          cases: 0,
          baterias: 0
        }
      });

      expect(result).toBe('tracking_id_123');
    });

    it('should use default country when not provided in userData', async () => {
      const userDataWithoutCountry = { ...mockUserData, pais: undefined };
      
      await createPendingTracking(
        'txn_789',
        'test@example.com',
        200,
        userDataWithoutCountry,
        mockProductData
      );

      expect(mockTrackingManager.generateUserTracking).toHaveBeenCalledWith(
        expect.objectContaining({
          paisEnvio: 'Chile'
        })
      );
    });

    it('should set fechaLimite to 30 days in the future', async () => {
      const beforeCall = Date.now();
      
      await createPendingTracking(
        'txn_time',
        'test@example.com',
        100,
        mockUserData,
        mockProductData
      );

      const callArgs = (mockTrackingManager.generateUserTracking as jest.Mock).mock.calls[0][0];
      const fechaLimite = new Date(callArgs.fechaLimite);
      const expectedDate = new Date(beforeCall + 30 * 24 * 60 * 60 * 1000);
      
      // Allow for small time differences in test execution
      expect(Math.abs(fechaLimite.getTime() - expectedDate.getTime())).toBeLessThan(1000);
    });
  });
});
