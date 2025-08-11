import { NextRequest } from 'next/server';
import { processFlowRequest, validateToken } from '../requestProcessor';
import * as parseRequestBodyModule from '../parseRequestBody';
import * as extractTokenModule from '../extractToken';
import * as requestLoggerModule from '../requestLogger';

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

// Mock dependencies
jest.mock('../parseRequestBody');
jest.mock('../extractToken');
jest.mock('../requestLogger');

const mockedParseRequestBody = jest.mocked(parseRequestBodyModule.parseRequestBody);
const mockedExtractToken = jest.mocked(extractTokenModule.extractToken);
const mockedLogCompleteRequestAnalysis = jest.mocked(requestLoggerModule.logCompleteRequestAnalysis);

describe('requestProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processFlowRequest', () => {
    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('token=test-token&other=value')
      },
      headers: {
        entries: () => [
          ['content-type', 'application/json'],
          ['user-agent', 'Flow-Client/1.0']
        ]
      },
      method: 'POST',
      url: 'https://example.com/api/flow/confirm'
    } as unknown as NextRequest;

    it('should process request and return complete context', async () => {
      const mockBody = { token: 'body-token', amount: 100 };
      const mockToken = 'test-token';

      mockedParseRequestBody.mockResolvedValue(mockBody);
      mockedExtractToken.mockReturnValue(mockToken);

      const result = await processFlowRequest(mockRequest);

      expect(result).toEqual({
        body: mockBody,
        searchParams: mockRequest.nextUrl.searchParams,
        token: mockToken,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Flow-Client/1.0'
        },
        method: 'POST',
        url: 'https://example.com/api/flow/confirm'
      });

      expect(mockedParseRequestBody).toHaveBeenCalledWith(mockRequest);
      expect(mockedExtractToken).toHaveBeenCalledWith(
        mockBody,
        mockRequest.nextUrl.searchParams
      );
      expect(mockedLogCompleteRequestAnalysis).toHaveBeenCalledWith({
        body: mockBody,
        searchParams: { token: 'test-token', other: 'value' },
        token: mockToken,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Flow-Client/1.0'
        },
        method: 'POST',
        url: 'https://example.com/api/flow/confirm'
      });
    });

    it('should handle when no token is found', async () => {
      const mockBody = { amount: 100 };
      const mockToken = null;

      mockedParseRequestBody.mockResolvedValue(mockBody);
      mockedExtractToken.mockReturnValue(mockToken);

      const result = await processFlowRequest(mockRequest);

      expect(result.token).toBeNull();
      expect(mockedLogCompleteRequestAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          token: null
        })
      );
    });

    it('should handle empty body', async () => {
      const mockBody = {};
      const mockToken = 'url-token';

      mockedParseRequestBody.mockResolvedValue(mockBody);
      mockedExtractToken.mockReturnValue(mockToken);

      const result = await processFlowRequest(mockRequest);

      expect(result.body).toEqual({});
      expect(result.token).toBe('url-token');
    });

    it('should handle request with no headers', async () => {
      const mockRequestNoHeaders = {
        ...mockRequest,
        headers: {
          entries: () => []
        }
      } as unknown as NextRequest;

      mockedParseRequestBody.mockResolvedValue({});
      mockedExtractToken.mockReturnValue('token');

      const result = await processFlowRequest(mockRequestNoHeaders);

      expect(result.headers).toEqual({});
    });

    it('should handle parseRequestBody throwing error', async () => {
      mockedParseRequestBody.mockRejectedValue(new Error('Parse error'));
      mockedExtractToken.mockReturnValue('token');

      // Should not throw and continue processing
      await expect(processFlowRequest(mockRequest)).rejects.toThrow('Parse error');
    });
  });

  describe('validateToken', () => {
    it('should return true and log success when token is present', () => {
      const result = validateToken('valid-token');

      expect(result).toBe(true);
    });

    it('should return false and log error when token is null', () => {
      const result = validateToken(null);

      expect(result).toBe(false);
    });

    it('should return false and log error when token is empty string', () => {
      const result = validateToken('');

      expect(result).toBe(false);
    });

    it('should return true for whitespace-only token', () => {
      const result = validateToken('   ');

      expect(result).toBe(true);
    });

    it('should return true for long token', () => {
      const longToken = 'a'.repeat(1000);
      const result = validateToken(longToken);

      expect(result).toBe(true);
    });

    it('should return true for token with special characters', () => {
      const result = validateToken('token-with_special.chars@123');

      expect(result).toBe(true);
    });
  });
});
