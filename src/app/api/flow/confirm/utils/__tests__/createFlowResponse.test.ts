import { NextResponse } from 'next/server';
import { createFlowResponse } from '../createFlowResponse';
import { FlowPaymentStatusResponse } from '@/lib/flowService';

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

describe('createFlowResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPaymentStatus: FlowPaymentStatusResponse = {
    flowOrder: 12345,
    commerceOrder: 'ORDER-001',
    requestDate: '2023-08-10T10:00:00Z',
    status: 1,
    subject: 'Test Payment',
    currency: 'CLP',
    amount: 10000,
    payer: 'test@example.com'
  };

  it('should create successful response', () => {
    const result = createFlowResponse(true, 'Payment confirmed', mockPaymentStatus);

    expect(mockedNextResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Payment confirmed',
      flowOrder: 12345,
      commerceOrder: 'ORDER-001',
      paymentStatus: 1
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    expect(result).toEqual({
      data: {
        status: 'success',
        message: 'Payment confirmed',
        flowOrder: 12345,
        commerceOrder: 'ORDER-001',
        paymentStatus: 1
      },
      options: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      },
      type: 'mocked-response'
    });
  });

  it('should create error response', () => {
    const result = createFlowResponse(false, 'Payment failed', mockPaymentStatus);

    expect(mockedNextResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Payment failed',
      flowOrder: 12345,
      commerceOrder: 'ORDER-001',
      paymentStatus: 1
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

    expect(result).toEqual({
      data: {
        status: 'error',
        message: 'Payment failed',
        flowOrder: 12345,
        commerceOrder: 'ORDER-001',
        paymentStatus: 1
      },
      options: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      },
      type: 'mocked-response'
    });
  });

  it('should always return status 200 regardless of success/failure', () => {
    createFlowResponse(true, 'Success', mockPaymentStatus);
    expect(mockedNextResponse.json).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({ status: 200 })
    );

    createFlowResponse(false, 'Error', mockPaymentStatus);
    expect(mockedNextResponse.json).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({ status: 200 })
    );
  });

  it('should include correct CORS headers', () => {
    createFlowResponse(true, 'Test', mockPaymentStatus);

    expect(mockedNextResponse.json).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        })
      })
    );
  });

  it('should handle different status codes in payment data', () => {
    const paymentStatusWithError = { ...mockPaymentStatus, status: 2 };
    createFlowResponse(false, 'Payment rejected', paymentStatusWithError);

    expect(mockedNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentStatus: 2
      }),
      expect.any(Object)
    );
  });

  it('should handle long commerce order names', () => {
    const paymentStatusLongOrder = { 
      ...mockPaymentStatus, 
      commerceOrder: 'VERY-LONG-COMMERCE-ORDER-NAME-WITH-LOTS-OF-CHARACTERS-12345'
    };
    createFlowResponse(true, 'Success', paymentStatusLongOrder);

    expect(mockedNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        commerceOrder: 'VERY-LONG-COMMERCE-ORDER-NAME-WITH-LOTS-OF-CHARACTERS-12345'
      }),
      expect.any(Object)
    );
  });
});
