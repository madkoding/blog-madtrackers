import { getPayPalConfiguration, getPayPalReturnUrls } from '../config';

describe('PayPal Create Config Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getPayPalConfiguration', () => {
    it('should return production configuration when environment is live', () => {
      process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = 'live';
      process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'business@example.com';

      const config = getPayPalConfiguration();

      expect(config.isProduction).toBe(true);
      expect(config.paypalBusinessEmail).toBe('business@example.com');
      expect(config.baseUrl).toBe('https://www.paypal.com/cgi-bin/webscr');
    });

    it('should return sandbox configuration when environment is not live', () => {
      process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = 'sandbox';
      process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'sandbox@example.com';

      const config = getPayPalConfiguration();

      expect(config.isProduction).toBe(false);
      expect(config.paypalBusinessEmail).toBe('sandbox@example.com');
      expect(config.baseUrl).toBe('https://www.sandbox.paypal.com/cgi-bin/webscr');
    });

    it('should default to sandbox configuration when environment is not set', () => {
      delete process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;
      process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL = 'test@example.com';

      const config = getPayPalConfiguration();

      expect(config.isProduction).toBe(false);
      expect(config.baseUrl).toBe('https://www.sandbox.paypal.com/cgi-bin/webscr');
    });

    it('should use default email when business email is not set', () => {
      delete process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL;

      const config = getPayPalConfiguration();

      expect(config.paypalBusinessEmail).toBe('tu-email@paypal.com');
    });
  });

  describe('getPayPalReturnUrls', () => {
    it('should generate correct URLs with custom base URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';

      const urls = getPayPalReturnUrls('txn_123');

      expect(urls.returnUrl).toBe('https://example.com/payment-success?paypal=true&transactionId=txn_123');
      expect(urls.cancelUrl).toBe('https://example.com/payment-cancel');
      expect(urls.notifyUrl).toBe('https://example.com/api/paypal/ipn');
    });

    it('should use localhost when base URL is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;

      const urls = getPayPalReturnUrls('txn_456');

      expect(urls.returnUrl).toBe('http://localhost:3000/payment-success?paypal=true&transactionId=txn_456');
      expect(urls.cancelUrl).toBe('http://localhost:3000/payment-cancel');
      expect(urls.notifyUrl).toBe('http://localhost:3000/api/paypal/ipn');
    });
  });
});
