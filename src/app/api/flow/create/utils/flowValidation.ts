/**
 * Utilidades para validación de parámetros de Flow
 */

export interface FlowCreateParams {
  amount: number;
  description: string;
  email: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
}

/**
 * Valida los parámetros requeridos para crear un pago en Flow
 */
export function validateFlowCreateParams(params: Partial<FlowCreateParams>): ValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];

  if (!params.amount) {
    missingFields.push('amount');
    errors.push('Amount es requerido');
  } else if (typeof params.amount !== 'number' || params.amount <= 0) {
    errors.push('Amount debe ser un número positivo');
  }

  if (!params.description) {
    missingFields.push('description');
    errors.push('Description es requerido');
  } else if (typeof params.description !== 'string' || params.description.trim() === '') {
    errors.push('Description debe ser un string no vacío');
  }

  if (!params.email) {
    missingFields.push('email');
    errors.push('Email es requerido');
  } else if (typeof params.email !== 'string' || !isValidEmail(params.email)) {
    errors.push('Email debe tener un formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields
  };
}

/**
 * Valida formato de email básico
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza el monto para Flow (debe ser entero para CLP)
 */
export function normalizeAmount(amount: number, currency = 'CLP'): number {
  if (currency === 'CLP') {
    return Math.round(amount);
  }
  return amount;
}
