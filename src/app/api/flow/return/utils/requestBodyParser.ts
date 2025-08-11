import { NextRequest } from 'next/server';
import { ReturnLogger } from './requestLogger';

/**
 * Parsea el cuerpo de la petición de diferentes formatos
 */
export class RequestBodyParser {
  /**
   * Parsea el cuerpo de la petición POST intentando diferentes formatos
   */
  static async parseBody(request: NextRequest, method: 'POST' | 'GET'): Promise<Record<string, unknown>> {
    try {
      const textBody = await request.text();
      return this.parseTextBody(textBody, method);
    } catch (error) {
      console.error(`💥 [FLOW RETURN ${method}] Error reading body:`, error);
      return {};
    }
  }

  /**
   * Parsea el texto del cuerpo según su formato
   */
  private static parseTextBody(textBody: string, method: 'POST' | 'GET'): Record<string, unknown> {
    if (!textBody) {
      ReturnLogger.logBodyParsing(method, textBody, {});
      return {};
    }

    return textBody.includes('=') 
      ? this.parseAsFormUrlEncoded(textBody, method)
      : this.parseAsJson(textBody, method);
  }

  /**
   * Intenta parsear como form-urlencoded
   */
  private static parseAsFormUrlEncoded(textBody: string, method: 'POST' | 'GET'): Record<string, unknown> {
    try {
      const params = new URLSearchParams(textBody);
      const body = Object.fromEntries(params.entries());
      ReturnLogger.logBodyParsing(method, textBody, body);
      return body;
    } catch (formError) {
      ReturnLogger.logBodyParsingError(method, formError, 'form-urlencoded');
      return this.parseAsJson(textBody, method);
    }
  }

  /**
   * Intenta parsear como JSON
   */
  private static parseAsJson(textBody: string, method: 'POST' | 'GET'): Record<string, unknown> {
    try {
      const body = JSON.parse(textBody);
      ReturnLogger.logBodyParsing(method, textBody, body);
      return body;
    } catch (jsonError) {
      ReturnLogger.logBodyParsingError(method, jsonError, 'JSON');
      console.log(`❌ [FLOW RETURN ${method}] Body format not recognized`);
      return {};
    }
  }
}
