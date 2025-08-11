import { NextRequest } from 'next/server';
import { handlePostConfirmation } from '../confirmationHandler';
import * as requestLoggerModule from '../requestLogger';
import * as requestProcessorModule from '../requestProcessor';
import * as paymentProcessorModule from '../paymentProcessor';
import * as errorHandlerModule from '../errorHandler';
import * as createFlowResponseModule from '../createFlowResponse';

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

// Mock all dependencies
jest.mock('../requestLogger');
jest.mock('../requestProcessor');
jest.mock('../paymentProcessor');
jest.mock('../errorHandler');
jest.mock('../createFlowResponse');

const mockedLogRequestInfo = jest.mocked(requestLoggerModule.logRequestInfo);
const mockedCreateErrorResponse = jest.mocked(requestLoggerModule.createErrorResponse);
const mockedProcessFlowRequest = jest.mocked(requestProcessorModule.processFlowRequest);
const mockedValidateToken = jest.mocked(requestProcessorModule.validateToken);
const mockedProcessPaymentVerification = jest.mocked(paymentProcessorModule.processPaymentVerification);
const mockedLogSuccessfulPayment = jest.mocked(paymentProcessorModule.logSuccessfulPayment);
const mockedLogFailedPayment = jest.mocked(paymentProcessorModule.logFailedPayment);
const mockedLogFinalResponse = jest.mocked(paymentProcessorModule.logFinalResponse);
const mockedLogVerificationError = jest.mocked(errorHandlerModule.logVerificationError);
const mockedLogCriticalError = jest.mocked(errorHandlerModule.logCriticalError);
const mockedLogEndpointCompletion = jest.mocked(errorHandlerModule.logEndpointCompletion);
const mockedCreateFlowResponse = jest.mocked(createFlowResponseModule.createFlowResponse);

describe('confirmationHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = {
    url: 'https://example.com/api/flow/confirm',
    method: 'POST'
  } as NextRequest;

  const mockContext = {
    body: { amount: 100 },
    searchParams: new URLSearchParams('token=test-token'),
    token: 'test-token',
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    url: 'https://example.com/api/flow/confirm'
  };

  const mockPaymentStatus = {
    flowOrder: 12345,
    commerceOrder: 'ORDER-001',
    requestDate: '2023-08-10T10:00:00Z',
    status: 1,
    subject: 'Test Payment',
    currency: 'CLP',
    amount: 10000,
    payer: 'test@example.com'
  };

  const mockSuccessResponse = { type: 'success-response' };

  describe('successful flow', () => {
    it('should handle successful payment confirmation', async () => {
      // Setup mocks for successful flow
      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockResolvedValue({
        paymentStatus: mockPaymentStatus,
        analysis: { isSuccess: true, message: 'Payment confirmed' }
      });
      mockedCreateFlowResponse.mockReturnValue(mockSuccessResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      // Verify the flow
      expect(mockedLogRequestInfo).toHaveBeenCalledWith(mockRequest);
      expect(mockedProcessFlowRequest).toHaveBeenCalledWith(mockRequest);
      expect(mockedValidateToken).toHaveBeenCalledWith('test-token');
      expect(mockedProcessPaymentVerification).toHaveBeenCalledWith('test-token');
      expect(mockedLogSuccessfulPayment).toHaveBeenCalledWith(mockPaymentStatus);
      expect(mockedLogFinalResponse).toHaveBeenCalledWith(true);
      expect(mockedCreateFlowResponse).toHaveBeenCalledWith(
        true,
        'Payment confirmed',
        mockPaymentStatus
      );
      expect(mockedLogEndpointCompletion).toHaveBeenCalled();

      expect(result).toBe(mockSuccessResponse);
    });

    it('should handle failed payment confirmation', async () => {
      const failedPaymentStatus = { ...mockPaymentStatus, status: 2 };
      const mockErrorResponse = { type: 'error-response' };

      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockResolvedValue({
        paymentStatus: failedPaymentStatus,
        analysis: { isSuccess: false, message: 'Payment rejected' }
      });
      mockedCreateFlowResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogFailedPayment).toHaveBeenCalledWith(
        failedPaymentStatus,
        'Payment rejected'
      );
      expect(mockedLogFinalResponse).toHaveBeenCalledWith(false);
      expect(mockedCreateFlowResponse).toHaveBeenCalledWith(
        false,
        'Payment rejected',
        failedPaymentStatus
      );

      expect(result).toBe(mockErrorResponse);
    });
  });

  describe('token validation failure', () => {
    it('should handle missing token', async () => {
      const contextWithoutToken = { 
        ...mockContext, 
        token: null,
        searchParams: new URLSearchParams() // Empty search params for missing token
      };
      const mockErrorResponse = { type: 'token-error-response' };

      mockedProcessFlowRequest.mockResolvedValue(contextWithoutToken);
      mockedValidateToken.mockReturnValue(false);
      mockedCreateErrorResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedValidateToken).toHaveBeenCalledWith(null);
      expect(mockedCreateErrorResponse).toHaveBeenCalledWith(
        'No token provided',
        undefined,
        {
          requestDetails: {
            body: mockContext.body,
            searchParams: {}, // Empty object for empty URLSearchParams
            headers: mockContext.headers
          }
        }
      );
      expect(mockedLogEndpointCompletion).toHaveBeenCalled();

      // Should not call payment verification
      expect(mockedProcessPaymentVerification).not.toHaveBeenCalled();

      expect(result).toBe(mockErrorResponse);
    });
  });

  describe('payment verification errors', () => {
    it('should handle payment verification failure', async () => {
      const verificationError = new Error('Flow API connection failed');
      const mockErrorResponse = { type: 'verification-error-response' };

      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockRejectedValue(verificationError);
      mockedCreateErrorResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogVerificationError).toHaveBeenCalledWith(
        verificationError,
        'test-token'
      );
      expect(mockedCreateErrorResponse).toHaveBeenCalledWith(
        'Error verifying payment status',
        'Flow API connection failed',
        { token: 'test-token' }
      );
      expect(mockedLogEndpointCompletion).toHaveBeenCalled();

      expect(result).toBe(mockErrorResponse);
    });

    it('should handle non-Error objects in verification failure', async () => {
      const verificationError = 'String error';
      const mockErrorResponse = { type: 'verification-error-response' };

      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockRejectedValue(verificationError);
      mockedCreateErrorResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogVerificationError).toHaveBeenCalledWith(
        verificationError,
        'test-token'
      );
      expect(mockedCreateErrorResponse).toHaveBeenCalledWith(
        'Error verifying payment status',
        'Unknown error',
        { token: 'test-token' }
      );

      expect(result).toBe(mockErrorResponse);
    });
  });

  describe('critical errors', () => {
    it('should handle request processing failure', async () => {
      const processingError = new Error('Request parsing failed');
      const mockErrorResponse = { type: 'critical-error-response' };

      mockedProcessFlowRequest.mockRejectedValue(processingError);
      mockedCreateErrorResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogCriticalError).toHaveBeenCalledWith(processingError);
      expect(mockedCreateErrorResponse).toHaveBeenCalledWith(
        'Internal server error',
        'Request parsing failed'
      );
      expect(mockedLogEndpointCompletion).toHaveBeenCalled();

      expect(result).toBe(mockErrorResponse);
    });

    it('should handle unknown errors in main try block', async () => {
      const unknownError = { message: 'Unknown error object' };
      const mockErrorResponse = { type: 'critical-error-response' };

      mockedProcessFlowRequest.mockRejectedValue(unknownError);
      mockedCreateErrorResponse.mockReturnValue(mockErrorResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogCriticalError).toHaveBeenCalledWith(unknownError);
      expect(mockedCreateErrorResponse).toHaveBeenCalledWith(
        'Internal server error',
        'Unknown error'
      );

      expect(result).toBe(mockErrorResponse);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete successful flow with payment data', async () => {
      const paymentStatusWithData = {
        ...mockPaymentStatus,
        paymentData: {
          date: '2023-08-10T10:00:00Z',
          media: 'VISA',
          conversionDate: '2023-08-10T10:00:00Z',
          conversionRate: 1,
          amount: 10000,
          currency: 'CLP',
          fee: 100,
          balance: 9900,
          transferDate: '2023-08-10T10:00:00Z'
        }
      };

      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockResolvedValue({
        paymentStatus: paymentStatusWithData,
        analysis: { isSuccess: true, message: 'Payment confirmed with data' }
      });
      mockedCreateFlowResponse.mockReturnValue(mockSuccessResponse as any);

      const result = await handlePostConfirmation(mockRequest);

      expect(mockedLogSuccessfulPayment).toHaveBeenCalledWith(paymentStatusWithData);
      expect(mockedCreateFlowResponse).toHaveBeenCalledWith(
        true,
        'Payment confirmed with data',
        paymentStatusWithData
      );

      expect(result).toBe(mockSuccessResponse);
    });

    it('should handle all steps being called in correct order', async () => {
      mockedProcessFlowRequest.mockResolvedValue(mockContext);
      mockedValidateToken.mockReturnValue(true);
      mockedProcessPaymentVerification.mockResolvedValue({
        paymentStatus: mockPaymentStatus,
        analysis: { isSuccess: true, message: 'Success' }
      });
      mockedCreateFlowResponse.mockReturnValue(mockSuccessResponse as any);

      await handlePostConfirmation(mockRequest);

      // Verify order of calls
      const allCalls = [
        mockedLogRequestInfo.mock.invocationCallOrder[0],
        mockedProcessFlowRequest.mock.invocationCallOrder[0],
        mockedValidateToken.mock.invocationCallOrder[0],
        mockedProcessPaymentVerification.mock.invocationCallOrder[0],
        mockedLogSuccessfulPayment.mock.invocationCallOrder[0],
        mockedLogFinalResponse.mock.invocationCallOrder[0],
        mockedCreateFlowResponse.mock.invocationCallOrder[0],
        mockedLogEndpointCompletion.mock.invocationCallOrder[0]
      ];

      // Each subsequent call should have a higher call order
      for (let i = 1; i < allCalls.length; i++) {
        expect(allCalls[i]).toBeGreaterThan(allCalls[i - 1]);
      }
    });
  });
});
