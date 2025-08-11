import { validatePaymentData, buildSuccessResponse } from '../flowUrlBuilder';

describe('flowUrlBuilder', () => {
  describe('validatePaymentData', () => {
    it('should validate correct payment data with flowOrder as number', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        token: 'test-token-123',
        flowOrder: 12345
      };

      expect(validatePaymentData(paymentData)).toBe(true);
    });

    it('should validate correct payment data with flowOrder as string', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        token: 'test-token-123',
        flowOrder: '12345'
      };

      expect(validatePaymentData(paymentData)).toBe(true);
    });

    it('should reject invalid payment data - missing url', () => {
      const paymentData = {
        token: 'test-token-123',
        flowOrder: 12345
      };

      expect(validatePaymentData(paymentData)).toBe(false);
    });

    it('should reject invalid payment data - missing token', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        flowOrder: 12345
      };

      expect(validatePaymentData(paymentData)).toBe(false);
    });

    it('should reject invalid payment data - missing flowOrder', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        token: 'test-token-123'
      };

      expect(validatePaymentData(paymentData)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(validatePaymentData(null)).toBe(false);
      expect(validatePaymentData(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(validatePaymentData('string')).toBe(false);
      expect(validatePaymentData(123)).toBe(false);
      expect(validatePaymentData(true)).toBe(false);
    });
  });

  describe('buildSuccessResponse', () => {
    it('should build success response with flowOrder as number', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        token: 'test-token-123',
        flowOrder: 12345
      };
      const commerceOrder = 'TEST-ORDER-001';

      const result = buildSuccessResponse(paymentData, commerceOrder);

      expect(result).toEqual({
        success: true,
        paymentUrl: 'https://sandbox.flow.cl/app/web/pay.php?token=test-token-123',
        flowOrder: '12345', // Should be converted to string
        commerceOrder: 'TEST-ORDER-001',
        token: 'test-token-123',
        timestamp: expect.any(String)
      });
    });

    it('should build success response with flowOrder as string', () => {
      const paymentData = {
        url: 'https://sandbox.flow.cl/app/web/pay.php',
        token: 'test-token-123',
        flowOrder: '12345'
      };
      const commerceOrder = 'TEST-ORDER-001';

      const result = buildSuccessResponse(paymentData, commerceOrder);

      expect(result).toEqual({
        success: true,
        paymentUrl: 'https://sandbox.flow.cl/app/web/pay.php?token=test-token-123',
        flowOrder: '12345', // Should remain as string
        commerceOrder: 'TEST-ORDER-001',
        token: 'test-token-123',
        timestamp: expect.any(String)
      });
    });
  });
});
