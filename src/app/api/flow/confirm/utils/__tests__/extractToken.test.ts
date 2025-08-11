import { extractToken } from '../extractToken';

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeAll(() => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('extractToken', () => {
  it('should extract token from URL params when available', () => {
    const body = { token: 'body-token' };
    const searchParams = new URLSearchParams('token=url-token&other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBe('url-token');
  });

  it('should extract token from body when URL token is not available', () => {
    const body = { token: 'body-token' };
    const searchParams = new URLSearchParams('other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBe('body-token');
  });

  it('should return null when no token is available', () => {
    const body = { other: 'value' };
    const searchParams = new URLSearchParams('other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBeNull();
  });

  it('should return null when body token is not a string', () => {
    const body = { token: 123 };
    const searchParams = new URLSearchParams('other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBeNull();
  });

  it('should return null when body token is an object', () => {
    const body = { token: { nested: 'value' } };
    const searchParams = new URLSearchParams('other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBeNull();
  });

  it('should return null when body token is an array', () => {
    const body = { token: ['array', 'value'] };
    const searchParams = new URLSearchParams('other=value');

    const result = extractToken(body, searchParams);

    expect(result).toBeNull();
  });

  it('should prioritize URL token over body token', () => {
    const body = { token: 'body-token' };
    const searchParams = new URLSearchParams('token=url-token');

    const result = extractToken(body, searchParams);

    expect(result).toBe('url-token');
  });

    it('should handle empty strings in URL params', () => {
      const body = { token: 'body-token' };
      const searchParams = new URLSearchParams('token=');

      const result = extractToken(body, searchParams);

      // Empty string from URL should be returned over body token (because urlToken || ... treats '' as falsy)
      expect(result).toBe('body-token');
    });  it('should handle empty body object', () => {
    const body = {};
    const searchParams = new URLSearchParams('token=url-token');

    const result = extractToken(body, searchParams);

    expect(result).toBe('url-token');
  });

  it('should handle multiple tokens in URL (should get first one)', () => {
    const body = { token: 'body-token' };
    const searchParams = new URLSearchParams('token=first-token&token=second-token');

    const result = extractToken(body, searchParams);

    expect(result).toBe('first-token');
  });
});
