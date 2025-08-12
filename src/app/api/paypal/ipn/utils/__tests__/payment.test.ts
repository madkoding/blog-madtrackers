import { processCompletedPayment } from '../payment';
import { PayPalIPNData } from '../types';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

// Mock the dependencies
jest.mock('../parser');
jest.mock('../tracking');
jest.mock('../email');

import { parseCustomData } from '../parser';
import { updateTrackingFromPayment } from '../tracking';
import { createOrderDetails, sendPurchaseConfirmationEmail } from '../email';

const mockParseCustomData = parseCustomData as jest.MockedFunction<typeof parseCustomData>;
const mockUpdateTrackingFromPayment = updateTrackingFromPayment as jest.MockedFunction<typeof updateTrackingFromPayment>;
const mockCreateOrderDetails = createOrderDetails as jest.MockedFunction<typeof createOrderDetails>;
const mockSendPurchaseConfirmationEmail = sendPurchaseConfirmationEmail as jest.MockedFunction<typeof sendPurchaseConfirmationEmail>;

describe('PayPal IPN Payment Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processCompletedPayment', () => {
    const mockIPNData: PayPalIPNData = {
      payment_status: 'Completed',
      txn_id: 'paypal_123',
      payer_email: 'test@example.com',
      mc_gross: '99.99',
      mc_currency: 'USD',
      custom: '{"txnId":"custom_123","email":"test@example.com","amount":99.99}'
    };

    const mockCustomData = {
      txnId: 'custom_123',
      email: 'test@example.com',
      vrchat: 'testuser',
      trackers: 5,
      amount: 99.99
    };

    const mockExistingTracking = {
      id: 'tracking_123',
      contacto: 'test@example.com',
      userHash: 'hash_123'
    };

    const mockOrderDetails = {
      transactionId: 'custom_123',
      amount: 99.99,
      currency: 'USD',
      trackers: 5,
      sensor: 'BMI160',
      colors: {
        case: 'Black',
        tapa: 'Red'
      },
      shippingAddress: {
        direccion: 'Test Address',
        ciudad: 'Test City',
        estado: 'Test State',
        pais: 'Test Country'
      },
      paymentMethod: 'PayPal',
      orderDate: '2024-01-01'
    };

    it('should process completed payment successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockParseCustomData.mockReturnValue(mockCustomData);
      mockUpdateTrackingFromPayment.mockResolvedValue(mockExistingTracking);
      mockCreateOrderDetails.mockReturnValue(mockOrderDetails);
      mockSendPurchaseConfirmationEmail.mockResolvedValue(true);

      const result = await processCompletedPayment(mockIPNData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🎉 [PAYPAL IPN] Payment completed successfully! Transaction ID:',
        'paypal_123'
      );
      expect(mockParseCustomData).toHaveBeenCalledWith(mockIPNData.custom);
      expect(mockUpdateTrackingFromPayment).toHaveBeenCalledWith(mockCustomData, mockIPNData);
      expect(mockCreateOrderDetails).toHaveBeenCalledWith(mockExistingTracking, mockCustomData, mockIPNData);
      expect(mockSendPurchaseConfirmationEmail).toHaveBeenCalledWith(mockExistingTracking, mockOrderDetails);
      expect(result).toBe(true);

      consoleLogSpy.mockRestore();
    });

    it('should return false when no custom data is provided', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const ipnDataWithoutCustom = { ...mockIPNData, custom: null };

      const result = await processCompletedPayment(ipnDataWithoutCustom);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '⚠️ [PAYPAL IPN] No custom data received'
      );
      expect(result).toBe(false);
      expect(mockParseCustomData).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should return false when custom data parsing fails', async () => {
      mockParseCustomData.mockReturnValue(null);

      const result = await processCompletedPayment(mockIPNData);

      expect(mockParseCustomData).toHaveBeenCalledWith(mockIPNData.custom);
      expect(result).toBe(false);
      expect(mockUpdateTrackingFromPayment).not.toHaveBeenCalled();
    });

    it('should return false when tracking update fails', async () => {
      mockParseCustomData.mockReturnValue(mockCustomData);
      mockUpdateTrackingFromPayment.mockResolvedValue(null);

      const result = await processCompletedPayment(mockIPNData);

      expect(mockUpdateTrackingFromPayment).toHaveBeenCalledWith(mockCustomData, mockIPNData);
      expect(result).toBe(false);
      expect(mockCreateOrderDetails).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      
      mockParseCustomData.mockImplementation(() => {
        throw error;
      });

      const result = await processCompletedPayment(mockIPNData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ [PAYPAL IPN] Error processing completed payment:',
        error
      );
      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should return false if email sending fails', async () => {
      mockParseCustomData.mockReturnValue(mockCustomData);
      mockUpdateTrackingFromPayment.mockResolvedValue(mockExistingTracking);
      mockCreateOrderDetails.mockReturnValue(mockOrderDetails);
      mockSendPurchaseConfirmationEmail.mockRejectedValue(new Error('Email error'));

      const result = await processCompletedPayment(mockIPNData);

      expect(result).toBe(false); // Should return false when email fails
      expect(mockSendPurchaseConfirmationEmail).toHaveBeenCalled();
    });
  });
});
