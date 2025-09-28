import { validatePayPalCreateRequest, validatePayPalBusinessEmail } from '../validation';

describe('PayPal Create Validation Utils', () => {
  describe('validatePayPalCreateRequest', () => {
    it('should return valid when all required fields are present', () => {
      const body = {
        email: 'test@example.com',
        amount: 100,
        transactionId: 'txn_123',
        userData: {
          direccion: 'Test Address',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid when email is missing', () => {
      const body = {
        email: '',
        amount: 100,
        transactionId: 'txn_123',
        userData: {
          direccion: 'Test Address',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email, amount y transactionId son requeridos');
    });

    it('should return invalid when amount is missing', () => {
      const body = {
        email: 'test@example.com',
        amount: 0,
        transactionId: 'txn_123',
        userData: {
          direccion: 'Test Address',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email, amount y transactionId son requeridos');
    });

    it('should return invalid when transactionId is missing', () => {
      const body = {
        email: 'test@example.com',
        amount: 100,
        transactionId: '',
        userData: {
          direccion: 'Test Address',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email, amount y transactionId son requeridos');
    });

    it('should return invalid when userData is missing', () => {
      const body = {
        email: 'test@example.com',
        amount: 100,
        transactionId: 'txn_123',
        userData: {
          direccion: '',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Datos de usuario incompletos');
    });

    it('should return invalid when userData.direccion is missing', () => {
      const body = {
        email: 'test@example.com',
        amount: 100,
        transactionId: 'txn_123',
        userData: {
          direccion: '',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Datos de usuario incompletos');
    });

    it('should return invalid when vrchat username is missing', () => {
      const body = {
        email: 'test@example.com',
        amount: 100,
        transactionId: 'txn_123',
        userData: {
          direccion: 'Test Address',
          nombreUsuarioVrChat: ''
        }
      };

      const result = validatePayPalCreateRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nombre de usuario VRChat es requerido');
    });
  });

  describe('validatePayPalBusinessEmail', () => {
    it('should return valid for a properly configured email', () => {
      const result = validatePayPalBusinessEmail('business@example.com');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for the default placeholder email', () => {
      const result = validatePayPalBusinessEmail('tu-email@paypal.com');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PayPal business email no configurado');
    });
  });
});
