import { 
  formatSuccessResponse, 
  formatNotFoundResponse, 
  formatErrorResponse 
} from '../response';
import { TrackingData, PayPalPaymentStatus } from '../types';

describe('PayPal Status Response Utils', () => {
  describe('formatSuccessResponse', () => {
    const mockTracking: TrackingData = {
      id: 'tracking_123',
      userHash: 'hash_123',
      paymentTransactionId: 'txn_123',
      paymentMethod: 'PayPal',
      paymentStatus: 'COMPLETED',
      estadoPedido: 'MANUFACTURING',
      abonadoUsd: 99.99,
      totalUsd: 99.99,
      paymentCurrency: 'USD',
      contacto: 'test@example.com',
      nombreUsuario: 'test_user',
      createdAt: '2023-08-12T10:00:00Z'
    };

    const mockPayPalStatus: PayPalPaymentStatus = {
      status: 1,
      statusText: 'Pagado',
      isPaymentSuccessful: true
    };

    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should format success response correctly', () => {
      const result = formatSuccessResponse(mockTracking, mockPayPalStatus);

      expect(result).toEqual({
        success: true,
        payment: {
          transactionId: 'txn_123',
          status: 1,
          statusText: 'Pagado',
          isPaymentSuccessful: true,
          amount: '99.99',
          currency: 'USD',
          payer: 'test@example.com',
          paymentMethod: 'PayPal',
          trackingId: 'hash_123',
          username: 'test_user',
          orderDate: '2023-08-12T10:00:00Z'
        },
        timestamp: expect.any(String)
      });
    });

    it('should use totalUsd when abonadoUsd is not available', () => {
      const trackingWithoutAbonado = { ...mockTracking, abonadoUsd: undefined };
      
      const result = formatSuccessResponse(trackingWithoutAbonado, mockPayPalStatus);

      expect(result.payment?.amount).toBe('99.99');
    });

    it('should use default amount when both abonadoUsd and totalUsd are not available', () => {
      const trackingWithoutAmounts = { 
        ...mockTracking, 
        abonadoUsd: undefined, 
        totalUsd: undefined 
      };
      
      const result = formatSuccessResponse(trackingWithoutAmounts, mockPayPalStatus);

      expect(result.payment?.amount).toBe('0');
    });

    it('should use default currency when paymentCurrency is not available', () => {
      const trackingWithoutCurrency = { ...mockTracking, paymentCurrency: undefined };
      
      const result = formatSuccessResponse(trackingWithoutCurrency, mockPayPalStatus);

      expect(result.payment?.currency).toBe('USD');
    });

    it('should handle empty string values gracefully', () => {
      const trackingWithEmptyValues = {
        ...mockTracking,
        paymentTransactionId: '',
        contacto: '',
        userHash: '',
        nombreUsuario: '',
        createdAt: ''
      };
      
      const result = formatSuccessResponse(trackingWithEmptyValues, mockPayPalStatus);

      expect(result.payment?.transactionId).toBe('');
      expect(result.payment?.payer).toBe('');
      expect(result.payment?.trackingId).toBe('');
      expect(result.payment?.username).toBe('');
      expect(result.payment?.orderDate).toBe('');
    });

    it('should log response preparation', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      formatSuccessResponse(mockTracking, mockPayPalStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith('📤 [PAYPAL STATUS] Preparing response...');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📊 [PAYPAL STATUS] Response data:',
        expect.any(String)
      );
    });

    it('should include current timestamp', () => {
      const beforeCall = Date.now();
      const result = formatSuccessResponse(mockTracking, mockPayPalStatus);
      const afterCall = Date.now();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('formatNotFoundResponse', () => {
    it('should format not found response correctly', () => {
      const result = formatNotFoundResponse();

      expect(result).toEqual({
        success: false,
        error: 'No tracking found for this PayPal payment',
        timestamp: expect.any(String)
      });
    });

    it('should include current timestamp', () => {
      const beforeCall = Date.now();
      const result = formatNotFoundResponse();
      const afterCall = Date.now();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response with Error object', () => {
      const error = new Error('Test error message');
      
      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Test error message',
        timestamp: expect.any(String)
      });
    });

    it('should format error response with string error', () => {
      const error = 'String error message';
      
      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Error interno del servidor',
        timestamp: expect.any(String)
      });
    });

    it('should format error response with unknown error type', () => {
      const error = { unknown: 'error' };
      
      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Error interno del servidor',
        timestamp: expect.any(String)
      });
    });

    it('should format error response with null error', () => {
      const result = formatErrorResponse(null);

      expect(result).toEqual({
        success: false,
        error: 'Error interno del servidor',
        timestamp: expect.any(String)
      });
    });

    it('should include current timestamp', () => {
      const beforeCall = Date.now();
      const result = formatErrorResponse(new Error('Test'));
      const afterCall = Date.now();

      const timestamp = new Date(result.timestamp).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeCall);
      expect(timestamp).toBeLessThanOrEqual(afterCall);
    });
  });
});
