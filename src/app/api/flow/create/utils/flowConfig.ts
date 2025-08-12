/**
 * Utilidades para configuración de parámetros de Flow
 */

import { NextRequest } from 'next/server';
import { UserData } from './flowValidation';

export interface FlowConfig {
  currency: string;
  paymentMethod: number;
  timeout: number;
  orderPrefix: string;
  source: string;
  paymentType: string;
}

export interface FlowUrls {
  confirmation: string;
  return: string;
  baseUrl: string;
}

export interface FlowPaymentParams {
  commerceOrder: string;
  subject: string;
  currency: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  paymentMethod: number;
  optional: string;
  timeout: number;
}

/**
 * Obtiene la configuración de Flow desde variables de entorno
 */
export function getFlowConfig(): FlowConfig {
  return {
    currency: process.env.FLOW_CURRENCY || 'CLP',
    paymentMethod: parseInt(process.env.FLOW_PAYMENT_METHOD || '9'),
    timeout: parseInt(process.env.FLOW_TIMEOUT || '3600'),
    orderPrefix: process.env.FLOW_ORDER_PREFIX || 'MT',
    source: process.env.FLOW_SOURCE || 'madtrackers',
    paymentType: process.env.FLOW_PAYMENT_TYPE || 'advance_payment'
  };
}

/**
 * Construye las URLs necesarias para Flow
 */
export function buildFlowUrls(request: NextRequest): FlowUrls {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  
  return {
    baseUrl,
    confirmation: `${baseUrl}/api/flow/confirm`,
    return: `${baseUrl}/api/flow/return?flow=true`
  };
}

/**
 * Prepara los parámetros completos para crear un pago en Flow
 */
export function buildFlowPaymentParams(
  commerceOrder: string,
  description: string,
  amount: number,
  email: string,
  urls: FlowUrls,
  config: FlowConfig,
  additionalData?: { userData?: UserData; productData?: any }
): FlowPaymentParams {
  const { userData, productData } = additionalData || {};
  
  // Crear el objeto opcional que incluye solo datos esenciales (Flow tiene límite de tamaño)
  const optionalData = {
    source: config.source,
    type: config.paymentType,
    // Solo incluir datos críticos para evitar el límite de Flow
    ...(userData && {
      pais: userData.pais,
      vrchat: userData.nombreUsuarioVrChat || 'N/A'
    }),
    // Solo datos mínimos del producto para identificación
    ...(productData && {
      trackers: productData.numberOfTrackers || 6,
      totalUsd: productData.totalUsd
    })
  };

  const optionalString = JSON.stringify(optionalData);
  console.log('📋 [FLOW CONFIG] Optional data size:', optionalString.length, 'characters');
  console.log('📋 [FLOW CONFIG] Optional data content:', optionalString);

  return {
    commerceOrder,
    subject: description,
    currency: config.currency,
    amount: Math.round(amount), // Flow requiere enteros para CLP
    email,
    urlConfirmation: urls.confirmation,
    urlReturn: urls.return,
    paymentMethod: config.paymentMethod,
    optional: optionalString,
    timeout: config.timeout
  };
}

/**
 * Valida la configuración de Flow
 */
export function validateFlowConfig(config: FlowConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.currency) {
    errors.push('Currency is required');
  }

  if (!config.paymentMethod || config.paymentMethod < 1) {
    errors.push('Payment method must be a positive number');
  }

  if (!config.timeout || config.timeout < 60) {
    errors.push('Timeout must be at least 60 seconds');
  }

  if (!config.orderPrefix) {
    errors.push('Order prefix is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formatea los parámetros de configuración para logging (sin datos sensibles)
 */
export function formatConfigForLogging(config: FlowConfig): Record<string, string | number> {
  return {
    currency: config.currency,
    paymentMethod: config.paymentMethod,
    timeout: config.timeout,
    orderPrefix: config.orderPrefix,
    source: config.source,
    paymentType: config.paymentType
  };
}
