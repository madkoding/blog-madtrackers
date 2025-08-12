import { formatSuccessResponse, formatErrorResponse } from '../response';

describe('PayPal Success Response Utils', () => {
  describe('formatSuccessResponse', () => {
    it('should format success response correctly', () => {
      const userHash = 'hash_123';
      const username = 'test_user';

      const result = formatSuccessResponse(userHash, username);

      expect(result).toEqual({
        success: true,
        trackingId: 'hash_123',
        username: 'test_user',
        userHash: 'hash_123',
        message: 'Payment processed and tracking created successfully'
      });
    });

    it('should handle empty string inputs', () => {
      const result = formatSuccessResponse('', '');

      expect(result).toEqual({
        success: true,
        trackingId: '',
        username: '',
        userHash: '',
        message: 'Payment processed and tracking created successfully'
      });
    });

    it('should maintain consistent structure', () => {
      const result = formatSuccessResponse('any_hash', 'any_user');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('trackingId');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('userHash');
      expect(result).toHaveProperty('message');
      expect(Object.keys(result)).toHaveLength(5);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response with Error object', () => {
      const error = new Error('Test error message');

      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Test error message'
      });
    });

    it('should format error response with string error', () => {
      const error = 'String error message';

      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Unknown error'
      });
    });

    it('should format error response with number error', () => {
      const error = 404;

      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Unknown error'
      });
    });

    it('should format error response with null error', () => {
      const result = formatErrorResponse(null);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Unknown error'
      });
    });

    it('should format error response with undefined error', () => {
      const result = formatErrorResponse(undefined);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Unknown error'
      });
    });

    it('should format error response with object error', () => {
      const error = { message: 'Object error', code: 500 };

      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
        details: 'Unknown error'
      });
    });

    it('should maintain consistent structure for all error types', () => {
      const errors = [
        new Error('Test'),
        'string error',
        null,
        undefined,
        { custom: 'error' },
        42
      ];

      errors.forEach(error => {
        const result = formatErrorResponse(error);
        
        expect(result).toHaveProperty('success', false);
        expect(result).toHaveProperty('error', 'Internal server error');
        expect(result).toHaveProperty('details');
        expect(typeof result.details).toBe('string');
        expect(Object.keys(result)).toHaveLength(3);
      });
    });

    it('should preserve Error message in details', () => {
      const specificError = new Error('Very specific error message');

      const result = formatErrorResponse(specificError);

      expect(result.details).toBe('Very specific error message');
    });

    it('should handle Error without message', () => {
      const errorWithoutMessage = new Error();

      const result = formatErrorResponse(errorWithoutMessage);

      expect(result.details).toBe('');
    });

    it('should handle custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError('Custom error message');
      const result = formatErrorResponse(customError);

      expect(result.details).toBe('Custom error message');
    });
  });
});
