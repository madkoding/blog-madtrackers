import { getPayPalStatus } from '../status';

describe('PayPal Status Utils', () => {
  describe('getPayPalStatus', () => {
    it('should return successful payment status', () => {
      const result = getPayPalStatus();

      expect(result).toEqual({
        status: 1,
        statusText: 'Pagado',
        isPaymentSuccessful: true
      });
    });

    it('should always return the same consistent result', () => {
      const result1 = getPayPalStatus();
      const result2 = getPayPalStatus();

      expect(result1).toEqual(result2);
      expect(result1.status).toBe(1);
      expect(result1.statusText).toBe('Pagado');
      expect(result1.isPaymentSuccessful).toBe(true);
    });

    it('should have correct property types', () => {
      const result = getPayPalStatus();

      expect(typeof result.status).toBe('number');
      expect(typeof result.statusText).toBe('string');
      expect(typeof result.isPaymentSuccessful).toBe('boolean');
    });
  });
});
