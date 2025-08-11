import { getStatusMessage } from '../getStatusMessage';
import { FlowPaymentStatusResponse } from '@/lib/flowService';

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('getStatusMessage', () => {
  describe('status codes without payment data', () => {
    it('should return success for status 1', () => {
      const result = getStatusMessage(1);

      expect(result).toEqual({
        isSuccess: true,
        message: 'Payment confirmed successfully'
      });
    });

    it('should return error for status 2', () => {
      const result = getStatusMessage(2);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment rejected'
      });
    });

    it('should return error for status 3', () => {
      const result = getStatusMessage(3);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment pending'
      });
    });

    it('should return error for status 4', () => {
      const result = getStatusMessage(4);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment cancelled'
      });
    });

    it('should return error for unknown status', () => {
      const result = getStatusMessage(99);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Unknown payment status: 99'
      });
    });
  });

  describe('status codes with payment data override', () => {
    it('should override status 2 when complete payment data is present', () => {
      const paymentData: FlowPaymentStatusResponse['paymentData'] = {
        date: '2023-08-10T10:00:00Z',
        media: 'VISA',
        conversionDate: '2023-08-10T10:00:00Z',
        conversionRate: 1,
        amount: 10000,
        currency: 'CLP',
        fee: 100,
        balance: 9900,
        transferDate: '2023-08-10T10:00:00Z'
      };

      const result = getStatusMessage(2, paymentData);

      expect(result).toEqual({
        isSuccess: true,
        message: 'Payment confirmed successfully (verified by paymentData)'
      });
    });

    it('should override status 3 when complete payment data is present', () => {
      const paymentData: FlowPaymentStatusResponse['paymentData'] = {
        date: '2023-08-10T10:00:00Z',
        media: 'MASTERCARD',
        conversionDate: '2023-08-10T10:00:00Z',
        conversionRate: 1,
        amount: 5000,
        currency: 'CLP',
        fee: 50,
        balance: 4950,
        transferDate: '2023-08-10T10:00:00Z'
      };

      const result = getStatusMessage(3, paymentData);

      expect(result).toEqual({
        isSuccess: true,
        message: 'Payment confirmed successfully (verified by paymentData)'
      });
    });

    it('should not override when payment data is incomplete (no date)', () => {
      const paymentData: Partial<FlowPaymentStatusResponse['paymentData']> = {
        media: 'VISA',
        amount: 10000,
        fee: 100,
        balance: 9900
      };

      const result = getStatusMessage(2, paymentData as FlowPaymentStatusResponse['paymentData']);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment rejected'
      });
    });

    it('should not override when payment data is incomplete (no media)', () => {
      const paymentData: Partial<FlowPaymentStatusResponse['paymentData']> = {
        date: '2023-08-10T10:00:00Z',
        amount: 10000,
        fee: 100,
        balance: 9900
      };

      const result = getStatusMessage(2, paymentData as FlowPaymentStatusResponse['paymentData']);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment rejected'
      });
    });

    it('should not override when payment data is incomplete (no amount)', () => {
      const paymentData: Partial<FlowPaymentStatusResponse['paymentData']> = {
        date: '2023-08-10T10:00:00Z',
        media: 'VISA',
        fee: 100,
        balance: 9900
      };

      const result = getStatusMessage(2, paymentData as FlowPaymentStatusResponse['paymentData']);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment rejected'
      });
    });

    it('should not override status 1 even with payment data', () => {
      const paymentData: FlowPaymentStatusResponse['paymentData'] = {
        date: '2023-08-10T10:00:00Z',
        media: 'VISA',
        conversionDate: '2023-08-10T10:00:00Z',
        conversionRate: 1,
        amount: 10000,
        currency: 'CLP',
        fee: 100,
        balance: 9900,
        transferDate: '2023-08-10T10:00:00Z'
      };

      const result = getStatusMessage(1, paymentData);

      expect(result).toEqual({
        isSuccess: true,
        message: 'Payment confirmed successfully (verified by paymentData)'
      });
    });

    it('should handle payment data with zero values', () => {
      const paymentData: FlowPaymentStatusResponse['paymentData'] = {
        date: '2023-08-10T10:00:00Z',
        media: 'VISA',
        conversionDate: '2023-08-10T10:00:00Z',
        conversionRate: 1,
        amount: 0,
        currency: 'CLP',
        fee: 0,
        balance: 0,
        transferDate: '2023-08-10T10:00:00Z'
      };

      const result = getStatusMessage(2, paymentData);

      expect(result).toEqual({
        isSuccess: false,
        message: 'Payment rejected'
      });
    });

    it('should handle payment data with undefined fee and balance', () => {
      const paymentData = {
        date: '2023-08-10T10:00:00Z',
        media: 'VISA',
        conversionDate: '2023-08-10T10:00:00Z',
        conversionRate: 1,
        amount: 10000,
        currency: 'CLP',
        transferDate: '2023-08-10T10:00:00Z'
      } as FlowPaymentStatusResponse['paymentData'];

      const result = getStatusMessage(2, paymentData);

      expect(result).toEqual({
        isSuccess: true,
        message: 'Payment confirmed successfully (verified by paymentData)'
      });
    });
  });
});
