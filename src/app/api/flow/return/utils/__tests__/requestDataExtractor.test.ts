import { RequestDataExtractor } from '../requestDataExtractor';
import { NextRequest } from 'next/server';

describe('RequestDataExtractor', () => {
  describe('extractRequestData', () => {
    it('should extract data from POST request with form body', () => {
      // Mock NextRequest
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('token=url123') // Usar 'token' no 'url_token'
        }
      } as NextRequest;

      const body = { token: 'body123', other: 'value' };
      
      const result = RequestDataExtractor.extractRequestData(mockRequest, body, 'POST');
      
      expect(result.body).toEqual(body);
      expect(result.searchParams).toEqual({ token: 'url123' });
      expect(result.token).toBe('url123'); // URL token tiene prioridad
    });

    it('should prioritize URL token over body token', () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('token=url_token')
        }
      } as NextRequest;

      const body = { token: 'body_token' };
      
      const result = RequestDataExtractor.extractRequestData(mockRequest, body, 'POST');
      
      expect(result.token).toBe('url_token');
    });

    it('should use body token when URL token is not present', () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('')
        }
      } as NextRequest;

      const body = { token: 'body_token' };
      
      const result = RequestDataExtractor.extractRequestData(mockRequest, body, 'POST');
      
      expect(result.token).toBe('body_token');
    });

    it('should return null token when neither URL nor body token is present', () => {
      const mockRequest = {
        nextUrl: {
          searchParams: new URLSearchParams('')
        }
      } as NextRequest;

      const body = {};
      
      const result = RequestDataExtractor.extractRequestData(mockRequest, body, 'POST');
      
      expect(result.token).toBeNull();
    });
  });

  describe('isValidToken', () => {
    it('should return true for valid token', () => {
      expect(RequestDataExtractor.isValidToken('valid_token')).toBe(true);
    });

    it('should return false for null token', () => {
      expect(RequestDataExtractor.isValidToken(null)).toBe(false);
    });

    it('should return false for "null" string token', () => {
      expect(RequestDataExtractor.isValidToken('null')).toBe(false);
    });

    it('should return false for "undefined" string token', () => {
      expect(RequestDataExtractor.isValidToken('undefined')).toBe(false);
    });

    it('should return false for empty string token', () => {
      expect(RequestDataExtractor.isValidToken('')).toBe(false);
    });
  });
});
