import { NextRequest } from 'next/server';
import { parseRequestBody } from '../parseRequestBody';

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

describe('parseRequestBody', () => {
  it('should parse JSON body correctly', async () => {
    const jsonData = { token: 'test-token', amount: 100 };
    const mockRequest = {
      text: jest.fn().mockResolvedValue(JSON.stringify(jsonData))
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual(jsonData);
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should parse form-urlencoded body correctly', async () => {
    const formData = 'token=test-token&amount=100&status=success';
    const mockRequest = {
      text: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({
      token: 'test-token',
      amount: '100',
      status: 'success'
    });
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should return empty object when body is empty', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue('')
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({});
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should return empty object when body is null', async () => {
    const mockRequest = {
      text: jest.fn().mockResolvedValue(null)
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({});
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid JSON gracefully', async () => {
    const invalidJson = '{ invalid json }';
    const mockRequest = {
      text: jest.fn().mockResolvedValue(invalidJson)
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({});
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should handle text that is not JSON or form-urlencoded', async () => {
    const plainText = 'just some plain text';
    const mockRequest = {
      text: jest.fn().mockResolvedValue(plainText)
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({});
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should handle request.text() throwing an error', async () => {
    const mockRequest = {
      text: jest.fn().mockRejectedValue(new Error('Network error'))
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({});
    expect(mockRequest.text).toHaveBeenCalledTimes(1);
  });

  it('should handle complex form-urlencoded data', async () => {
    const formData = 'token=abc123&user%5Bname%5D=John+Doe&items%5B0%5D=item1&items%5B1%5D=item2';
    const mockRequest = {
      text: jest.fn().mockResolvedValue(formData)
    } as unknown as NextRequest;

    const result = await parseRequestBody(mockRequest);

    expect(result).toEqual({
      token: 'abc123',
      'user[name]': 'John Doe',
      'items[0]': 'item1',
      'items[1]': 'item2'
    });
  });
});
