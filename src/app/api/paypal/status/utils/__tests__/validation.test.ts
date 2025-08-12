import { validateStatusRequest } from '../validation';

describe('PayPal Status Validation Utils', () => {
  describe('validateStatusRequest', () => {
    it('should return valid when transactionId is provided', () => {
      const params = {
        transactionId: 'txn_123',
        trackingId: null
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid when trackingId is provided', () => {
      const params = {
        transactionId: null,
        trackingId: 'tracking_123'
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid when both transactionId and trackingId are provided', () => {
      const params = {
        transactionId: 'txn_123',
        trackingId: 'tracking_123'
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid when neither transactionId nor trackingId are provided', () => {
      const params = {
        transactionId: null,
        trackingId: null
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Transaction ID or Tracking ID required');
    });

    it('should return invalid when both are undefined', () => {
      const params = {
        transactionId: undefined,
        trackingId: undefined
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Transaction ID or Tracking ID required');
    });

    it('should return invalid when both are empty strings', () => {
      const params = {
        transactionId: '',
        trackingId: ''
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Transaction ID or Tracking ID required');
    });

    it('should return valid when transactionId is empty but trackingId is provided', () => {
      const params = {
        transactionId: '',
        trackingId: 'tracking_123'
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid when trackingId is empty but transactionId is provided', () => {
      const params = {
        transactionId: 'txn_123',
        trackingId: ''
      };

      const result = validateStatusRequest(params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
