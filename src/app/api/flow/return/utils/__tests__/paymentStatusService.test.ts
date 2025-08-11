import { PaymentStatusService } from '../paymentStatusService';

// Mock the flowService import
const mockGetPaymentStatus = jest.fn();

jest.mock('@/lib/flowService', () => ({
  getFlowService: jest.fn(() => ({
    getPaymentStatus: mockGetPaymentStatus
  }))
}));

describe('PaymentStatusService', () => {
  describe('verifyPaymentStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Suprimir logs durante las pruebas
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return success redirect for status 1 (paid)', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        status: 1,
        commerceOrder: 'test123'
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(1);
      expect(result.redirectPath).toBe('/payment-success');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return success redirect for status 2 (pending)', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        status: 2,
        commerceOrder: 'test123'
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(2);
      expect(result.redirectPath).toBe('/payment-success');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return cancel redirect for status 3 (rejected)', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        status: 3,
        commerceOrder: 'test123'
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(3);
      expect(result.redirectPath).toBe('/payment-cancel');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return cancel redirect for status 4 (cancelled)', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        status: 4,
        commerceOrder: 'test123'
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(4);
      expect(result.redirectPath).toBe('/payment-cancel');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return default redirect for unknown status', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        status: 999,
        commerceOrder: 'test123'
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(999);
      expect(result.redirectPath).toBe('/payment-success');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return default status when API call fails', async () => {
      mockGetPaymentStatus.mockRejectedValue(new Error('API Error'));

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(0);
      expect(result.redirectPath).toBe('/payment-success');
      expect(result.shouldRedirect).toBe(true);
    });

    it('should return default status when response has no status', async () => {
      mockGetPaymentStatus.mockResolvedValue({
        commerceOrder: 'test123'
        // no status field
      });

      const result = await PaymentStatusService.verifyPaymentStatus('test_token', 'POST');

      expect(result.status).toBe(0);
      expect(result.redirectPath).toBe('/payment-success');
      expect(result.shouldRedirect).toBe(true);
    });
  });
});
