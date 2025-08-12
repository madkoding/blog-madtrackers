import { generateUsername, logProcessingStart, logValidationSuccess } from '../utils';
import { UserData } from '../types';

describe('PayPal Success Utils', () => {
  describe('generateUsername', () => {
    it('should generate username from email', () => {
      const email = 'test.user@example.com';
      
      const result = generateUsername(email);

      expect(result).toMatch(/^test\.user_\d{6}$/);
      expect(result.startsWith('test.user_')).toBe(true);
      expect(result.length).toBe(16); // 'test.user_' (10) + 6 digits
    });

    it('should handle email with plus sign', () => {
      const email = 'user+tag@example.com';
      
      const result = generateUsername(email);

      expect(result).toMatch(/^user\+tag_\d{6}$/);
      expect(result.startsWith('user+tag_')).toBe(true);
    });

    it('should handle simple email', () => {
      const email = 'user@example.com';
      
      const result = generateUsername(email);

      expect(result).toMatch(/^user_\d{6}$/);
      expect(result.startsWith('user_')).toBe(true);
    });

    it('should generate different usernames for same email when called at different times', async () => {
      const email = 'test@example.com';
      
      // Mock Date.now to return different values
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return callCount === 1 ? 1234567890123 : 1234567890124;
      });

      const result1 = generateUsername(email);
      const result2 = generateUsername(email);

      expect(result1).not.toBe(result2);
      expect(result1.split('_')[0]).toBe(result2.split('_')[0]); // Same base
      expect(result1.split('_')[1]).not.toBe(result2.split('_')[1]); // Different timestamp

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should handle edge case email formats', () => {
      const edgeEmails = [
        'a@b.com',
        'very.long.email.address@example.com',
        'email-with-dashes@example.com',
        'email_with_underscores@example.com'
      ];

      edgeEmails.forEach(email => {
        const result = generateUsername(email);
        const expectedBase = email.split('@')[0];
        expect(result.startsWith(expectedBase + '_')).toBe(true);
        expect(result).toMatch(new RegExp(`^${expectedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_\\d{6}$`));
      });
    });
  });

  describe('logProcessingStart', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should log processing start with body', () => {
      const body = { test: 'data' };
      
      logProcessingStart(body);

      expect(console.log).toHaveBeenCalledWith('🎉 [PAYPAL SUCCESS] Starting PayPal payment processing...');
      expect(console.log).toHaveBeenCalledWith('📄 [PAYPAL SUCCESS] Request body:', body);
    });

    it('should handle null body', () => {
      logProcessingStart(null);

      expect(console.log).toHaveBeenCalledWith('🎉 [PAYPAL SUCCESS] Starting PayPal payment processing...');
      expect(console.log).toHaveBeenCalledWith('📄 [PAYPAL SUCCESS] Request body:', null);
    });

    it('should handle complex body object', () => {
      const complexBody = {
        transactionId: 'txn_123',
        userData: {
          email: 'test@example.com',
          nested: { data: true }
        },
        array: [1, 2, 3]
      };
      
      logProcessingStart(complexBody);

      expect(console.log).toHaveBeenCalledWith('📄 [PAYPAL SUCCESS] Request body:', complexBody);
    });
  });

  describe('logValidationSuccess', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    const mockUserData: UserData = {
      email: 'test@example.com',
      direccion: 'Test Address',
      ciudad: 'Test City',
      estado: 'Test State',
      pais: 'Test Country',
      nombreUsuarioVrChat: 'TestUser'
    };

    it('should log validation success with all data', () => {
      logValidationSuccess('txn_123', 'payer@example.com', '99.99', mockUserData);

      expect(console.log).toHaveBeenCalledWith(
        '✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:',
        {
          transactionId: 'txn_123',
          payerEmail: 'payer@example.com',
          amount: '99.99',
          userData: {
            email: 'test@example.com',
            direccion: 'Test Address',
            ciudad: 'Test City',
            estado: 'Test State',
            pais: 'Test Country',
            nombreUsuarioVrChat: 'TestUser'
          }
        }
      );
    });

    it('should handle missing VRChat username', () => {
      const userDataWithoutVrChat = { ...mockUserData, nombreUsuarioVrChat: undefined };
      
      logValidationSuccess('txn_456', 'payer@example.com', '150.00', userDataWithoutVrChat);

      expect(console.log).toHaveBeenCalledWith(
        '✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:',
        expect.objectContaining({
          userData: expect.objectContaining({
            nombreUsuarioVrChat: 'N/A'
          })
        })
      );
    });

    it('should handle empty VRChat username', () => {
      const userDataWithEmptyVrChat = { ...mockUserData, nombreUsuarioVrChat: '' };
      
      logValidationSuccess('txn_789', 'payer@example.com', '200.00', userDataWithEmptyVrChat);

      expect(console.log).toHaveBeenCalledWith(
        '✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:',
        expect.objectContaining({
          userData: expect.objectContaining({
            nombreUsuarioVrChat: 'N/A'
          })
        })
      );
    });

    it('should handle various data types correctly', () => {
      logValidationSuccess('', '', '', mockUserData);

      expect(console.log).toHaveBeenCalledWith(
        '✅ [PAYPAL SUCCESS] Creating tracking for PayPal payment:',
        expect.objectContaining({
          transactionId: '',
          payerEmail: '',
          amount: ''
        })
      );
    });
  });
});
