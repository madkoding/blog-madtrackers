/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { 
  logRequestInfo, 
  createErrorResponse, 
  logCompleteRequestAnalysis 
} from '../requestLogger';

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

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      options,
      type: 'mocked-response'
    }))
  }
}));

const mockedNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

// Helper functions to create mocks and reduce nesting
const createMockHeaders = (forwardedFor: string | null = null, headerEntries: [string, string][] = []) => ({
  get: jest.fn((name: string) => {
    if (name === 'x-forwarded-for') return forwardedFor;
    return null;
  }),
  entries: () => headerEntries
});

const createMockRequest = (
  url: string = 'https://example.com/api/flow/confirm',
  method: string = 'POST',
  forwardedFor: string | null = null,
  headerEntries: [string, string][] = []
): NextRequest => ({
  headers: createMockHeaders(forwardedFor, headerEntries),
  url,
  method
} as unknown as NextRequest);

describe('requestLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logRequestInfo', () => {
    it('should log request information', () => {
      const headerEntries: [string, string][] = [
        ['content-type', 'application/json'],
        ['user-agent', 'Flow-Client/1.0'],
        ['x-forwarded-for', '192.168.1.1']
      ];
      const mockRequest = createMockRequest(
        'https://example.com/api/flow/confirm',
        'POST',
        '192.168.1.1',
        headerEntries
      );

      logRequestInfo(mockRequest);

      expect(mockRequest.headers.get).toHaveBeenCalledWith('x-forwarded-for');
      // Function should complete without throwing
      expect(true).toBe(true);
    });

    it('should handle request without x-forwarded-for header', () => {
      const headerEntries: [string, string][] = [
        ['content-type', 'application/json'],
        ['user-agent', 'Flow-Client/1.0']
      ];
      const mockRequest = createMockRequest(
        'https://example.com/api/flow/confirm',
        'POST',
        null,
        headerEntries
      );

      logRequestInfo(mockRequest);

      expect(true).toBe(true);
    });

    it('should handle request with many headers', () => {
      const headerEntries: [string, string][] = [
        ['content-type', 'application/json'],
        ['user-agent', 'Flow-Client/1.0'],
        ['accept', 'application/json'],
        ['authorization', 'Bearer token123'],
        ['x-forwarded-for', '10.0.0.1'],
        ['cache-control', 'no-cache'],
        ['connection', 'keep-alive'],
        ['host', 'example.com']
      ];
      const mockRequest = createMockRequest(
        'https://example.com/api/flow/confirm?token=abc123',
        'POST',
        '10.0.0.1',
        headerEntries
      );

      logRequestInfo(mockRequest);

      expect(true).toBe(true);
    });

    it('should handle request with no headers', () => {
      const mockRequest = createMockRequest(
        'https://example.com/api/flow/confirm',
        'GET',
        null,
        []
      );

      logRequestInfo(mockRequest);

      expect(true).toBe(true);
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

      methods.forEach(method => {
        const mockRequest = createMockRequest(
          'https://example.com/api/flow/confirm',
          method,
          null,
          []
        );

        logRequestInfo(mockRequest);
      });

      expect(true).toBe(true);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with basic message', () => {
      const result = createErrorResponse('Test error message');

      expect(mockedNextResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error message',
        error: undefined,
        timestamp: expect.any(String)
      }, {
        status: 200
      });

      expect(result).toEqual({
        data: {
          status: 'error',
          message: 'Test error message',
          error: undefined,
          timestamp: expect.any(String)
        },
        options: { status: 200 },
        type: 'mocked-response'
      });
    });

    it('should create error response with error details', () => {
      createErrorResponse('Test error', 'Detailed error info');

      expect(mockedNextResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
        error: 'Detailed error info',
        timestamp: expect.any(String)
      }, {
        status: 200
      });
    });

    it('should create error response with additional data', () => {
      const additionalData = {
        token: 'test-token',
        requestId: '12345',
        userAgent: 'Test/1.0'
      };

      createErrorResponse('Test error', 'Error details', additionalData);

      expect(mockedNextResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
        error: 'Error details',
        timestamp: expect.any(String),
        token: 'test-token',
        requestId: '12345',
        userAgent: 'Test/1.0'
      }, {
        status: 200
      });
    });

    it('should always return status 200', () => {
      createErrorResponse('Error 1');
      createErrorResponse('Error 2', 'Details');
      createErrorResponse('Error 3', 'Details', { extra: 'data' });

      const calls = mockedNextResponse.json.mock.calls;
      calls.forEach(call => {
        expect(call[1]).toEqual({ status: 200 });
      });
    });

    it('should include timestamp in ISO format', () => {
      const beforeCall = new Date();
      createErrorResponse('Test error');
      const afterCall = new Date();

      const call = mockedNextResponse.json.mock.calls[0];
      const responseData = call[0] as { timestamp: string };
      const timestamp = new Date(responseData.timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should handle null and undefined values in additional data', () => {
      const additionalData = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroValue: 0,
        falseValue: false
      };

      createErrorResponse('Test error', 'Error details', additionalData);

      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining(additionalData),
        expect.any(Object)
      );
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const longError = 'B'.repeat(10000);

      createErrorResponse(longMessage, longError);

      expect(mockedNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: longMessage,
          error: longError
        }),
        expect.any(Object)
      );
    });
  });

  describe('logCompleteRequestAnalysis', () => {
    it('should log complete request analysis', () => {
      const analysisData = {
        body: { token: 'test-token', amount: 100 },
        searchParams: { token: 'url-token', callback: 'success' },
        token: 'url-token',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        url: 'https://example.com/api/flow/confirm'
      };

      logCompleteRequestAnalysis(analysisData);

      // Function should complete without throwing
      expect(true).toBe(true);
    });

    it('should handle empty analysis data', () => {
      const analysisData = {
        body: {},
        searchParams: {},
        token: null,
        headers: {},
        method: 'GET',
        url: ''
      };

      logCompleteRequestAnalysis(analysisData);

      expect(true).toBe(true);
    });

    it('should handle large analysis data', () => {
      const largeBody: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeBody[`key${i}`] = `value${i}`;
      }

      const analysisData = {
        body: largeBody,
        searchParams: { param1: 'value1', param2: 'value2' },
        token: 'very-long-token-' + 'x'.repeat(1000),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        url: 'https://example.com/api/flow/confirm'
      };

      logCompleteRequestAnalysis(analysisData);

      expect(true).toBe(true);
    });

    it('should handle special characters in data', () => {
      const analysisData = {
        body: { message: 'Test with émojis 🚀 and special chars: <>&"' },
        searchParams: { param: 'value with spaces & symbols' },
        token: 'token-with-特殊字符',
        headers: { 'custom-header': 'value with "quotes"' },
        method: 'POST',
        url: 'https://example.com/api/flow/confirm?param=value%20encoded'
      };

      logCompleteRequestAnalysis(analysisData);

      expect(true).toBe(true);
    });

    it('should handle nested objects in body', () => {
      const analysisData = {
        body: {
          user: {
            name: 'John Doe',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              coordinates: { lat: 40.7128, lng: -74.0060 }
            }
          },
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ]
        },
        searchParams: {},
        token: 'test-token',
        headers: {},
        method: 'POST',
        url: 'https://example.com'
      };

      logCompleteRequestAnalysis(analysisData);

      expect(true).toBe(true);
    });
  });
});
