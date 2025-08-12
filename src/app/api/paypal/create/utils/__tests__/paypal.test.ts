import { createPayPalCustomData, buildPayPalUrl } from '../paypal';
import { UserData, PayPalProductData } from '../types';

describe('PayPal Create PayPal Utils', () => {
  describe('createPayPalCustomData', () => {
    const mockUserData: UserData = {
      email: 'test@example.com',
      direccion: 'Test Address',
      ciudad: 'Test City',
      estado: 'Test State',
      pais: 'Test Country',
      nombreUsuarioVrChat: 'TestUser'
    };

    const mockProductData: PayPalProductData = {
      numberOfTrackers: 6,
      totalUsd: 250
    };

    it('should create custom data with all fields', () => {
      const result = createPayPalCustomData(
        'txn_123',
        'test@example.com',
        mockUserData,
        mockProductData,
        250
      );

      const parsedResult = JSON.parse(result);
      expect(parsedResult.txnId).toBe('txn_123');
      expect(parsedResult.email).toBe('test@example.com');
      expect(parsedResult.vrchat).toBe('TestUser');
      expect(parsedResult.trackers).toBe(6);
      expect(parsedResult.amount).toBe(250);
    });

    it('should use default values when productData is undefined', () => {
      const result = createPayPalCustomData(
        'txn_456',
        'test@example.com',
        mockUserData,
        undefined,
        150
      );

      const parsedResult = JSON.parse(result);
      expect(parsedResult.trackers).toBe(6);
      expect(parsedResult.amount).toBe(150);
    });

    it('should handle empty vrchat username', () => {
      const userDataWithoutVrChat = { ...mockUserData, nombreUsuarioVrChat: undefined };
      const result = createPayPalCustomData(
        'txn_789',
        'test@example.com',
        userDataWithoutVrChat,
        mockProductData,
        300
      );

      const parsedResult = JSON.parse(result);
      expect(parsedResult.vrchat).toBe('');
    });

    it('should warn when custom data exceeds 256 characters', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const longUserData = {
        ...mockUserData,
        nombreUsuarioVrChat: 'A'.repeat(200) // Very long username to exceed limit
      };

      createPayPalCustomData(
        'txn_very_long_transaction_id_that_makes_the_string_longer',
        'very.long.email.address.that.exceeds.normal.length@example.com',
        longUserData,
        mockProductData,
        999999
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom data size:'),
        expect.any(Number),
        'characters (limit: 256)'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('buildPayPalUrl', () => {
    const mockUrls = {
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      notifyUrl: 'https://example.com/notify'
    };

    it('should build correct PayPal URL with all parameters', () => {
      const result = buildPayPalUrl(
        'https://www.paypal.com/cgi-bin/webscr',
        'business@example.com',
        'Test Product',
        99.99,
        '{"test":"data"}',
        mockUrls
      );

      expect(result).toContain('https://www.paypal.com/cgi-bin/webscr');
      expect(result).toContain('cmd=_xclick');
      expect(result).toContain('business=business%40example.com');
      expect(result).toContain('item_name=Test+Product');
      expect(result).toContain('amount=99.99');
      expect(result).toContain('currency_code=USD');
      expect(result).toContain('custom=%7B%22test%22%3A%22data%22%7D');
      expect(result).toContain('return=https%3A%2F%2Fexample.com%2Fsuccess');
      expect(result).toContain('cancel_return=https%3A%2F%2Fexample.com%2Fcancel');
      expect(result).toContain('notify_url=https%3A%2F%2Fexample.com%2Fnotify');
    });

    it('should handle decimal amounts correctly', () => {
      const result = buildPayPalUrl(
        'https://www.sandbox.paypal.com/cgi-bin/webscr',
        'test@example.com',
        'Product',
        123.456,
        '{}',
        mockUrls
      );

      expect(result).toContain('amount=123.46');
    });

    it('should handle special characters in description', () => {
      const result = buildPayPalUrl(
        'https://www.paypal.com/cgi-bin/webscr',
        'business@example.com',
        'Test & Special Chars!',
        50,
        '{}',
        mockUrls
      );

      expect(result).toContain('item_name=Test+%26+Special+Chars%21');
    });
  });
});
