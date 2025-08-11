import { NextRequest } from 'next/server';
import { ReturnRequestData, ReturnRedirectInfo } from './types';

/**
 * Logger específico para el endpoint de retorno de Flow
 */
export class ReturnLogger {
  private static logPrefix(method: 'POST' | 'GET') {
    return `[FLOW RETURN ${method}]`;
  }

  static logRequestStart(method: 'POST' | 'GET', request: NextRequest) {
    const prefix = this.logPrefix(method);
    console.log('🚀 =================================================================');
    console.log(`🚀 ==================== FLOW RETURN ${method} ENDPOINT ====================`);
    console.log('🚀 =================================================================');
    console.log(`⏰ ${prefix} Timestamp:`, new Date().toISOString());
    console.log(`🌐 ${prefix} Request from IP:`, request.headers.get('x-forwarded-for') || 'localhost');
    console.log(`🔗 ${prefix} Request URL:`, request.url);
    console.log(`📍 ${prefix} Request method:`, request.method);
  }

  static logRequestHeaders(method: 'POST' | 'GET', headers: Headers) {
    const prefix = this.logPrefix(method);
    console.log(`📋 ${prefix} All headers:`);
    const headersObj = Object.fromEntries(headers.entries());
    Object.entries(headersObj).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }

  static logRequestData(method: 'POST' | 'GET', data: ReturnRequestData) {
    const prefix = this.logPrefix(method);
    console.log(`📊 ${prefix} Complete request analysis:`, {
      body: data.body,
      searchParams: data.searchParams,
      token: data.token || 'NO_TOKEN',
      hasToken: !!data.token
    });
  }

  static logTokenExtraction(method: 'POST' | 'GET', bodyToken: unknown, urlToken: string | null, finalToken: string | null) {
    const prefix = this.logPrefix(method);
    console.log(`🎫 ${prefix} Token extraction:`);
    console.log('   - From body:', bodyToken || 'NOT_FOUND');
    console.log('   - From URL:', urlToken || 'NOT_FOUND');
    console.log('   - Final token:', finalToken || 'NO_TOKEN');
  }

  static logPaymentStatusCheck(method: 'POST' | 'GET') {
    const prefix = this.logPrefix(method);
    console.log(`🔍 ${prefix} Checking payment status before redirect...`);
    console.log(`🌐 ${prefix} Getting payment status from Flow API...`);
  }

  static logPaymentStatusResponse(method: 'POST' | 'GET', statusResponse: unknown) {
    const prefix = this.logPrefix(method);
    console.log(`📋 ${prefix} Flow API response:`, statusResponse);
  }

  static logPaymentStatusMapping(method: 'POST' | 'GET', status: number) {
    const prefix = this.logPrefix(method);
    console.log(`📊 ${prefix} Payment status: ${status}`);
    
    switch (status) {
      case 1:
        console.log(`✅ ${prefix} Payment successful - redirecting to success page`);
        break;
      case 2:
        console.log(`❌ ${prefix} Payment rejected - redirecting to cancel page`);
        break;
      case 3:
        console.log(`⏳ ${prefix} Payment pending - redirecting to success page (will show as pending)`);
        break;
      case 4:
        console.log(`🚫 ${prefix} Payment cancelled - redirecting to cancel page`);
        break;
      default:
        console.log(`⚠️ ${prefix} Unknown status ${status} - defaulting to success page`);
    }
  }

  static logRedirectInfo(method: 'POST' | 'GET', redirectInfo: ReturnRedirectInfo) {
    const prefix = this.logPrefix(method);
    console.log(`🌐 ${prefix} Base URL for redirect:`, redirectInfo.baseUrl);
    console.log(`🎯 ${prefix} Final redirect URL:`, redirectInfo.redirectUrl);
    
    if (redirectInfo.token) {
      console.log(`✅ ${prefix} Token added to redirect URL`);
    } else {
      console.log(`⚠️ ${prefix} No valid token to add to redirect URL`);
    }
  }

  static logRedirectResponse(method: 'POST' | 'GET') {
    const prefix = this.logPrefix(method);
    console.log(`📤 ${prefix} Sending 302 redirect response...`);
    console.log(`✅ ${prefix} Redirect response created successfully`);
  }

  static logError(method: 'POST' | 'GET', error: unknown) {
    const prefix = this.logPrefix(method);
    console.error(`💥 ${prefix} ===============================================`);
    console.error(`💥 ${prefix} ERROR HANDLING FLOW ${method} REDIRECT`);
    console.error(`💥 ${prefix} ===============================================`);
    console.error(`💥 ${prefix} Error details:`, error);
    console.error(`💥 ${prefix} Error type:`, typeof error);
    console.error(`💥 ${prefix} Error message:`, error instanceof Error ? error.message : 'Unknown error');
    console.error(`💥 ${prefix} Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
  }

  static logFallbackRedirect(method: 'POST' | 'GET', redirectUrl: string) {
    const prefix = this.logPrefix(method);
    console.log(`🚨 ${prefix} Error fallback redirect to:`, redirectUrl);
    console.log(`📤 ${prefix} Sending fallback redirect response`);
  }

  static logProcessingEnd(method: 'POST' | 'GET') {
    const prefix = this.logPrefix(method);
    console.log(`🏁 ${prefix} ===============================================`);
    console.log(`🏁 ${prefix} RETURN ENDPOINT EXECUTION COMPLETED`);
    console.log(`🏁 ${prefix} ===============================================`);
  }

  static logBodyParsing(method: 'POST' | 'GET', textBody: string, parsedBody: Record<string, unknown>) {
    const prefix = this.logPrefix(method);
    console.log(`📄 ${prefix} Reading request body...`);
    console.log(`📄 ${prefix} Raw body content:`, textBody || 'EMPTY');
    
    if (textBody) {
      if (textBody.includes('=')) {
        console.log(`✅ ${prefix} Successfully parsed as form-urlencoded:`, parsedBody);
      } else {
        console.log(`✅ ${prefix} Successfully parsed as JSON:`, parsedBody);
      }
    } else {
      console.log(`⚠️ ${prefix} No body content found`);
    }
  }

  static logBodyParsingError(method: 'POST' | 'GET', error: unknown, format: 'form-urlencoded' | 'JSON') {
    const prefix = this.logPrefix(method);
    console.log(`❌ ${prefix} Failed to parse as ${format}:`, error);
  }

  static logStatusCheckError(method: 'POST' | 'GET', error: unknown) {
    const prefix = this.logPrefix(method);
    console.error(`💥 ${prefix} Error checking payment status:`, error);
    console.log(`⚠️ ${prefix} Status check failed - defaulting to success page`);
  }

  static logNoToken(method: 'POST' | 'GET') {
    const prefix = this.logPrefix(method);
    console.log(`⚠️ ${prefix} No token available - defaulting to success page`);
  }

  static logNoStatusResponse(method: 'POST' | 'GET') {
    const prefix = this.logPrefix(method);
    console.log(`⚠️ ${prefix} Could not verify payment status - defaulting to success page`);
  }
}
