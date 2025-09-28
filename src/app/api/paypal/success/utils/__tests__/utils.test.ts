import { generateUsername, logProcessingStart, logValidationSuccess } from '../utils';
import { UserData } from '../types';

describe('PayPal Success Utils', () => {
  describe('generateUsername', () => {
    const userData = (nombreUsuarioVrChat: string) => ({ nombreUsuarioVrChat });

    it('should return trimmed vrchat username', () => {
      const result = generateUsername(userData('  Nat_yat  '));

      expect(result).toBe('Nat_yat');
    });

    it('should throw when vrchat username is empty', () => {
      expect(() => generateUsername(userData('   '))).toThrow('nombreUsuarioVrChat es requerido para generar el nombre de usuario');
    });

    it('should throw when vrchat username is undefined', () => {
      expect(() => generateUsername({ nombreUsuarioVrChat: undefined as unknown as string })).toThrow('nombreUsuarioVrChat es requerido para generar el nombre de usuario');
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
      logProcessingStart({});

      expect(console.log).toHaveBeenCalledWith('🎉 [PAYPAL SUCCESS] Starting PayPal payment processing...');
      expect(console.log).toHaveBeenCalledWith('📄 [PAYPAL SUCCESS] Request body:', {});
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
