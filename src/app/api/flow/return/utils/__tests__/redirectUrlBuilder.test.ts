import { RedirectUrlBuilder } from '../redirectUrlBuilder';
import { NextRequest } from 'next/server';

describe('RedirectUrlBuilder', () => {
  const mockRequest = {
    nextUrl: {
      origin: 'http://localhost:3000'
    }
  } as NextRequest;

  beforeEach(() => {
    // Limpiar variables de entorno
    delete process.env.NEXT_PUBLIC_BASE_URL;
    
    // Suprimir logs durante las pruebas
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('buildRedirectInfo', () => {
    it('should build redirect info with valid token', () => {
      const result = RedirectUrlBuilder.buildRedirectInfo(
        mockRequest,
        '/payment-success',
        'valid_token',
        'POST'
      );

      expect(result.redirectPath).toBe('/payment-success');
      expect(result.baseUrl).toBe('http://localhost:3000');
      expect(result.token).toBe('valid_token');
      expect(result.redirectUrl).toContain('flow=true');
      expect(result.redirectUrl).toContain('token=valid_token');
    });

    it('should build redirect info without token when token is null', () => {
      const result = RedirectUrlBuilder.buildRedirectInfo(
        mockRequest,
        '/payment-cancel',
        null,
        'GET'
      );

      expect(result.redirectPath).toBe('/payment-cancel');
      expect(result.token).toBeNull();
      expect(result.redirectUrl).toContain('flow=true');
      expect(result.redirectUrl).not.toContain('token=');
    });

    it('should build redirect info without token when token is "null" string', () => {
      const result = RedirectUrlBuilder.buildRedirectInfo(
        mockRequest,
        '/payment-success',
        'null',
        'POST'
      );

      expect(result.token).toBeNull();
      expect(result.redirectUrl).not.toContain('token=');
    });

    it('should build redirect info without token when token is "undefined" string', () => {
      const result = RedirectUrlBuilder.buildRedirectInfo(
        mockRequest,
        '/payment-success',
        'undefined',
        'POST'
      );

      expect(result.token).toBeNull();
      expect(result.redirectUrl).not.toContain('token=');
    });

    it('should use environment variable for base URL when available', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';

      const result = RedirectUrlBuilder.buildRedirectInfo(
        mockRequest,
        '/payment-success',
        'token123',
        'POST'
      );

      expect(result.baseUrl).toBe('https://example.com');
      expect(result.redirectUrl).toContain('https://example.com');
    });
  });

  describe('buildFallbackRedirectInfo', () => {
    it('should build fallback redirect info', () => {
      const result = RedirectUrlBuilder.buildFallbackRedirectInfo(mockRequest, 'POST');

      expect(result.redirectPath).toBe('/payment-success');
      expect(result.token).toBeNull();
      expect(result.baseUrl).toBe('http://localhost:3000');
      expect(result.redirectUrl).toContain('flow=true');
      expect(result.redirectUrl).not.toContain('token=');
    });

    it('should use environment variable for base URL in fallback', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://fallback.com';

      const result = RedirectUrlBuilder.buildFallbackRedirectInfo(mockRequest, 'GET');

      expect(result.baseUrl).toBe('https://fallback.com');
      expect(result.redirectUrl).toContain('https://fallback.com');
    });
  });
});
