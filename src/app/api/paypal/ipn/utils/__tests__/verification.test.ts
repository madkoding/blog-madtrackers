import { verifyIPNWithPayPal } from '../verification';

// Mock fetch
global.fetch = jest.fn();

describe('PayPal IPN Verification Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('verifyIPNWithPayPal', () => {
    const mockIPNBody = 'payment_status=Completed&txn_id=123&payer_email=test@example.com';

    it('should verify IPN successfully in sandbox environment', async () => {
      process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = 'sandbox';
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: () => Promise.resolve('VERIFIED')
      } as Response);

      const result = await verifyIPNWithPayPal(mockIPNBody);

      expect(fetch).toHaveBeenCalledWith(
        'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `cmd=_notify-validate&${mockIPNBody}`,
        }
      );

      expect(result.isVerified).toBe(true);
      expect(result.ipnData).toEqual({
        payment_status: 'Completed',
        txn_id: '123',
        payer_email: 'test@example.com',
        mc_gross: null,
        mc_currency: null,
        custom: null
      });
    });

    it('should verify IPN successfully in production environment', async () => {
      process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT = 'live';
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: () => Promise.resolve('VERIFIED')
      } as Response);

      await verifyIPNWithPayPal(mockIPNBody);

      expect(fetch).toHaveBeenCalledWith(
        'https://ipnpb.paypal.com/cgi-bin/webscr',
        expect.any(Object)
      );
    });

    it('should return false when verification fails', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: () => Promise.resolve('INVALID')
      } as Response);

      const result = await verifyIPNWithPayPal(mockIPNBody);

      expect(result.isVerified).toBe(false);
      expect(result.ipnData).toBeUndefined();
    });

    it('should handle fetch errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyIPNWithPayPal(mockIPNBody);

      expect(result.isVerified).toBe(false);
      expect(result.ipnData).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [PAYPAL IPN] Error verifying IPN:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should parse all IPN data fields correctly', async () => {
      const complexIPNBody = 'payment_status=Completed&txn_id=123&payer_email=test@example.com&mc_gross=99.99&mc_currency=USD&custom={"test":"data"}';
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: () => Promise.resolve('VERIFIED')
      } as Response);

      const result = await verifyIPNWithPayPal(complexIPNBody);

      expect(result.ipnData).toEqual({
        payment_status: 'Completed',
        txn_id: '123',
        payer_email: 'test@example.com',
        mc_gross: '99.99',
        mc_currency: 'USD',
        custom: '{"test":"data"}'
      });
    });

    it('should use sandbox environment as default', async () => {
      delete process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;
      
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        text: () => Promise.resolve('VERIFIED')
      } as Response);

      await verifyIPNWithPayPal(mockIPNBody);

      expect(fetch).toHaveBeenCalledWith(
        'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr',
        expect.any(Object)
      );
    });
  });
});
