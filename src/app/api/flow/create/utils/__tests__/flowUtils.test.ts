/**
 * Ejemplo de tests para los utils de Flow Create
 * Este archivo muestra cómo probar las utilidades de manera independiente
 */

import { describe, it, expect } from '@jest/globals';
import { validateFlowCreateParams, normalizeAmount } from '../flowValidation';
import { generateCommerceOrder, isValidCommerceOrder, parseCommerceOrder } from '../flowOrderGenerator';
import { getFlowConfig, validateFlowConfig } from '../flowConfig';

describe('Flow Validation Utils', () => {
  it('should validate correct Flow parameters', () => {
    const params = {
      amount: 1000,
      description: 'Test payment',
      email: 'test@example.com'
    };

    const result = validateFlowCreateParams(params);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.missingFields).toHaveLength(0);
  });

  it('should reject invalid parameters', () => {
    const params = {
      amount: 0,
      description: '',
      email: 'invalid-email'
    };

    const result = validateFlowCreateParams(params);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should normalize amount for CLP currency', () => {
    const amount = 1000.75;
    const normalized = normalizeAmount(amount, 'CLP');
    expect(normalized).toBe(1001);
  });
});

describe('Flow Order Generator Utils', () => {
  it('should generate valid commerce order', () => {
    const order = generateCommerceOrder('TEST');
    expect(typeof order).toBe('string');
    expect(order).toMatch(/^TEST_\d{13}_[a-z0-9]{9}$/);
  });

  it('should validate commerce order format', () => {
    const validOrder = 'MT_1640995200000_abc123def';
    const invalidOrder = 'invalid-order';
    
    expect(isValidCommerceOrder(validOrder)).toBe(true);
    expect(isValidCommerceOrder(invalidOrder)).toBe(false);
  });

  it('should parse commerce order correctly', () => {
    const order = 'MT_1640995200000_abc123def';
    const parsed = parseCommerceOrder(order);
    
    expect(parsed).not.toBeNull();
    expect(parsed?.prefix).toBe('MT');
    expect(parsed?.timestamp).toBe(1640995200000);
    expect(parsed?.randomSuffix).toBe('abc123def');
    expect(parsed?.date).toBeInstanceOf(Date);
  });
});

describe('Flow Config Utils', () => {
  it('should get flow configuration with defaults', () => {
    const config = getFlowConfig();
    
    expect(config.currency).toBeDefined();
    expect(config.paymentMethod).toBeGreaterThan(0);
    expect(config.timeout).toBeGreaterThan(0);
    expect(config.orderPrefix).toBeDefined();
  });

  it('should validate flow configuration', () => {
    const validConfig = {
      currency: 'CLP',
      paymentMethod: 9,
      timeout: 3600,
      orderPrefix: 'MT',
      source: 'madtrackers',
      paymentType: 'advance_payment'
    };

    const result = validateFlowConfig(validConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid configuration', () => {
    const invalidConfig = {
      currency: '',
      paymentMethod: 0,
      timeout: 30,
      orderPrefix: '',
      source: 'madtrackers',
      paymentType: 'advance_payment'
    };

    const result = validateFlowConfig(invalidConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// Ejemplo de test de integración
describe('Flow Utils Integration', () => {
  it('should work together in a payment flow', () => {
    // 1. Validar parámetros
    const params = {
      amount: 5000,
      description: 'Integration test payment',
      email: 'integration@test.com'
    };
    
    const validation = validateFlowCreateParams(params);
    expect(validation.isValid).toBe(true);

    // 2. Generar orden
    const commerceOrder = generateCommerceOrder();
    expect(isValidCommerceOrder(commerceOrder)).toBe(true);

    // 3. Obtener configuración
    const config = getFlowConfig();
    const configValidation = validateFlowConfig(config);
    expect(configValidation.isValid).toBe(true);

    // 4. Normalizar monto
    const normalizedAmount = normalizeAmount(params.amount, config.currency);
    expect(normalizedAmount).toBe(5000);
  });
});
