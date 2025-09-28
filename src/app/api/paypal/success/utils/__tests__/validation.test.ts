import { validateSuccessRequest } from '../validation';

describe('PayPal Success Validation Utils', () => {
  describe('validateSuccessRequest', () => {
    const validUserData = {
      email: 'test@example.com',
      direccion: 'Test Address',
      ciudad: 'Test City',
      estado: 'Test State',
      pais: 'Test Country',
      nombreUsuarioVrChat: 'TestVR'
    };

    it('should return valid when all required fields are present', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid when transactionId is missing', () => {
      const body = {
        transactionId: '',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters: transactionId, payerEmail, amount, userData');
    });

    it('should return invalid when payerEmail is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: '',
        amount: '99.99',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters: transactionId, payerEmail, amount, userData');
    });

    it('should return invalid when amount is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters: transactionId, payerEmail, amount, userData');
    });

    it('should return invalid when userData is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: {
          email: '',
          direccion: 'Test Address',
          ciudad: 'Test City',
          estado: 'Test State',
          pais: 'Test Country',
          nombreUsuarioVrChat: 'TestVR'
        }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when userData.email is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: { ...validUserData, email: '' }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when userData.direccion is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: { ...validUserData, direccion: '' }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when userData.ciudad is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: { ...validUserData, ciudad: undefined }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when userData.estado is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: { ...validUserData, estado: undefined }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when userData.pais is missing', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: { ...validUserData, pais: undefined }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required userData fields');
    });

    it('should return invalid when vrchat username is missing or empty', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: {
          ...validUserData,
          nombreUsuarioVrChat: ' '
        }
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing VRChat username');
    });

    it('should handle empty string values as invalid', () => {
      const body = {
        transactionId: '',
        payerEmail: 'payer@example.com',
        amount: '99.99',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters: transactionId, payerEmail, amount, userData');
    });

    it('should handle null values as invalid', () => {
      const body = {
        transactionId: 'txn_123',
        payerEmail: '',
        amount: '99.99',
        userData: validUserData
      };

      const result = validateSuccessRequest(body);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters: transactionId, payerEmail, amount, userData');
    });
  });
});
