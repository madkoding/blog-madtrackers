import { 
  createOrderDetails, 
  sendPurchaseConfirmationEmail 
} from '../email';
import { EmailService } from '@/lib/emailService';

// Mock EmailService
jest.mock('@/lib/emailService');

// Mock Resend completely
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('PayPal Success Email Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  describe('createOrderDetails', () => {
    const mockUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      pais: 'Chile',
      direccion: 'Av. Principal 123',
      ciudad: 'Santiago',
      estado: 'Metropolitana',
      nombreUsuarioVrChat: 'john_vr'
    };

    const mockProductData = {
      numberOfTrackers: 3,
      sensor: 'ICM45686',
      magnetometer: true,
      caseColor: 'blue',
      coverColor: 'red'
    };

    it('should create order details with all parameters', () => {
      const result = createOrderDetails(
        'txn_123456789',
        '150.00',
        'USD',
        mockUserData,
        mockProductData
      );

      expect(result).toEqual({
        transactionId: 'txn_123456789',
        amount: 150.00,
        currency: 'USD',
        trackers: 3,
        sensor: 'ICM45686',
        colors: {
          case: 'blue',
          tapa: 'red'
        },
        shippingAddress: {
          direccion: 'Av. Principal 123',
          ciudad: 'Santiago',
          estado: 'Metropolitana',
          pais: 'Chile'
        },
        paymentMethod: 'PayPal',
        orderDate: expect.any(String)
      });
    });

    it('should create order details with default product values when no productData provided', () => {
      const result = createOrderDetails(
        'txn_987654321',
        '100.00',
        'CLP',
        mockUserData
      );

      expect(result).toEqual({
        transactionId: 'txn_987654321',
        amount: 100.00,
        currency: 'CLP',
        trackers: 5,
        sensor: 'ICM45686 + QMC6309',
        colors: {
          case: 'black',
          tapa: 'black'
        },
        shippingAddress: {
          direccion: 'Av. Principal 123',
          ciudad: 'Santiago',
          estado: 'Metropolitana',
          pais: 'Chile'
        },
        paymentMethod: 'PayPal',
        orderDate: expect.any(String)
      });
    });

    it('should use USD as default currency when undefined', () => {
      const result = createOrderDetails(
        'txn_default',
        '75.50',
        undefined,
        mockUserData
      );

      expect(result.currency).toBe('USD');
    });

    it('should handle partial product data', () => {
      const partialProductData = {
        numberOfTrackers: 2,
        caseColor: 'white'
      };

      const result = createOrderDetails(
        'txn_partial',
        '80.00',
        'EUR',
        mockUserData,
        partialProductData
      );

      expect(result.trackers).toBe(2);
      expect(result.colors.case).toBe('white');
      expect(result.colors.tapa).toBe('black'); // default
      expect(result.sensor).toBe('ICM45686 + QMC6309'); // default
    });

    it('should format orderDate in Spanish Chilean format', () => {
      const result = createOrderDetails(
        'txn_date',
        '50.00',
        'USD',
        mockUserData
      );

      expect(result.orderDate).toMatch(/\d{1,2} de \w+ de \d{4}, \d{2}:\d{2}/);
    });

    it('should preserve user data in shipping address', () => {
      const customUserData = {
        ...mockUserData,
        direccion: 'Calle Nueva 456',
        ciudad: 'Valparaíso',
        estado: 'Valparaíso',
        pais: 'Chile'
      };

      const result = createOrderDetails(
        'txn_shipping',
        '120.00',
        'USD',
        customUserData
      );

      expect(result.shippingAddress).toEqual({
        direccion: 'Calle Nueva 456',
        ciudad: 'Valparaíso',
        estado: 'Valparaíso',
        pais: 'Chile'
      });
    });
  });

  describe('sendPurchaseConfirmationEmail', () => {
    const mockUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      pais: 'Chile',
      direccion: 'Av. Principal 123',
      ciudad: 'Santiago',
      estado: 'Metropolitana',
      nombreUsuarioVrChat: 'john_vr'
    };

    const mockOrderDetails = {
      transactionId: 'txn_123456789',
      amount: 150.00,
      currency: 'USD',
      trackers: 3,
      sensor: 'ICM45686',
      colors: {
        case: 'blue',
        tapa: 'red'
      },
      shippingAddress: {
        direccion: 'Av. Principal 123',
        ciudad: 'Santiago',
        estado: 'Metropolitana',
        pais: 'Chile'
      },
      paymentMethod: 'PayPal',
      orderDate: '15 de enero de 2023, 10:30'
    };

    it('should send purchase confirmation email successfully', async () => {
      (EmailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(true);

      await sendPurchaseConfirmationEmail(mockUserData, 'hash_123', mockOrderDetails);

      expect(EmailService.sendPurchaseConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'john_vr',
        'hash_123',
        mockOrderDetails
      );

      expect(mockConsoleLog).toHaveBeenCalledWith('📧 [PAYPAL SUCCESS] Sending purchase confirmation email...');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ [PAYPAL SUCCESS] Purchase confirmation email sent successfully');
    });

    it('should handle missing VRChat username gracefully', async () => {
      const userDataWithoutVR = {
        ...mockUserData,
        nombreUsuarioVrChat: undefined
      };

      (EmailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(true);

      await sendPurchaseConfirmationEmail(userDataWithoutVR, 'hash_456', mockOrderDetails);

      expect(EmailService.sendPurchaseConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Usuario',
        'hash_456',
        mockOrderDetails
      );
    });

    it('should handle empty VRChat username gracefully', async () => {
      const userDataWithEmptyVR = {
        ...mockUserData,
        nombreUsuarioVrChat: ''
      };

      (EmailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(true);

      await sendPurchaseConfirmationEmail(userDataWithEmptyVR, 'hash_789', mockOrderDetails);

      expect(EmailService.sendPurchaseConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Usuario',
        'hash_789',
        mockOrderDetails
      );
    });

    it('should handle email service returning false', async () => {
      (EmailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(false);

      await sendPurchaseConfirmationEmail(mockUserData, 'hash_fail', mockOrderDetails);

      expect(mockConsoleWarn).toHaveBeenCalledWith('⚠️ [PAYPAL SUCCESS] Failed to send purchase confirmation email');
    });

    it('should handle email service throwing error', async () => {
      const error = new Error('Email service unavailable');
      (EmailService.sendPurchaseConfirmation as jest.Mock).mockRejectedValue(error);

      await sendPurchaseConfirmationEmail(mockUserData, 'hash_error', mockOrderDetails);

      expect(mockConsoleError).toHaveBeenCalledWith('❌ [PAYPAL SUCCESS] Error sending purchase confirmation email:', error);
    });

    it('should not throw error when email fails', async () => {
      const error = new Error('Network error');
      (EmailService.sendPurchaseConfirmation as jest.Mock).mockRejectedValue(error);

      // Should not throw
      await expect(sendPurchaseConfirmationEmail(mockUserData, 'hash_network', mockOrderDetails))
        .resolves.toBeUndefined();
    });

    it('should log sending email attempt', async () => {
      (EmailService.sendPurchaseConfirmation as jest.Mock).mockResolvedValue(true);

      await sendPurchaseConfirmationEmail(mockUserData, 'hash_log', mockOrderDetails);

      expect(mockConsoleLog).toHaveBeenCalledWith('📧 [PAYPAL SUCCESS] Sending purchase confirmation email...');
    });
  });
});
