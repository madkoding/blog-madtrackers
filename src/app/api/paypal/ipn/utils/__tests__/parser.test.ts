import { parseCustomData, isPaymentCompleted } from '../parser';

describe('PayPal IPN Parser Utils', () => {
  describe('parseCustomData', () => {
    it('should parse valid JSON custom data', () => {
      const customField = '{"txnId":"123","email":"test@example.com","vrchat":"TestUser","trackers":6,"amount":250}';
      
      const result = parseCustomData(customField);

      expect(result).toEqual({
        txnId: '123',
        email: 'test@example.com',
        vrchat: 'TestUser',
        trackers: 6,
        amount: 250
      });
    });

    it('should return null for invalid JSON', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = parseCustomData('invalid json string');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [PAYPAL IPN] Error parsing custom data:',
        expect.any(SyntaxError)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return null when txnId is missing', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const customField = '{"email":"test@example.com","vrchat":"TestUser"}';
      
      const result = parseCustomData(customField);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '⚠️ [PAYPAL IPN] No transaction ID found in custom field'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return null when txnId is empty string', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const customField = '{"txnId":"","email":"test@example.com"}';
      
      const result = parseCustomData(customField);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '⚠️ [PAYPAL IPN] No transaction ID found in custom field'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle minimal valid custom data', () => {
      const customField = '{"txnId":"minimal_test"}';
      
      const result = parseCustomData(customField);

      expect(result).toEqual({
        txnId: 'minimal_test'
      });
    });

    it('should log custom data when processing', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const customField = '{"txnId":"test_log"}';
      
      parseCustomData(customField);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📋 [PAYPAL IPN] Processing custom data:',
        customField
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('isPaymentCompleted', () => {
    it('should return true for Completed payment status', () => {
      expect(isPaymentCompleted('Completed')).toBe(true);
    });

    it('should return false for non-Completed payment status', () => {
      expect(isPaymentCompleted('Pending')).toBe(false);
      expect(isPaymentCompleted('Failed')).toBe(false);
      expect(isPaymentCompleted('Denied')).toBe(false);
      expect(isPaymentCompleted('Canceled_Reversal')).toBe(false);
    });

    it('should return false for null payment status', () => {
      expect(isPaymentCompleted(null)).toBe(false);
    });

    it('should return false for undefined payment status', () => {
      expect(isPaymentCompleted(null)).toBe(false);
    });

    it('should return false for empty string payment status', () => {
      expect(isPaymentCompleted('')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isPaymentCompleted('completed')).toBe(false);
      expect(isPaymentCompleted('COMPLETED')).toBe(false);
      expect(isPaymentCompleted('Completed')).toBe(true);
    });
  });
});
