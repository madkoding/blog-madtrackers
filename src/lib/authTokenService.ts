import { EmailService } from './emailService';
import { logger } from './logger';

interface TokenData {
  token: string;
  username: string;
  type: 'user' | 'admin';
  email?: string;
  expiresAt: number;
  used: boolean;
}

/**
 * Servicio de autenticación por tokens de email
 */
export class AuthTokenService {
  private static readonly tokens: Map<string, TokenData> = new Map();
  private static readonly TOKEN_EXPIRY_MINUTES = 15;

  /**
   * Limpia tokens expirados
   */
  private static cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [tokenId, data] of this.tokens.entries()) {
      if (data.expiresAt < now) {
        this.tokens.delete(tokenId);
      }
    }
  }

  /**
   * Genera y envía token para acceso de usuario
   */
  static async generateUserAccessToken(username: string, userEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      this.cleanExpiredTokens();

      const token = EmailService.generateToken();
      const expiresAt = Date.now() + (this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Guardar token
      this.tokens.set(token, {
        token,
        username,
        type: 'user',
        email: userEmail,
        expiresAt,
        used: false
      });

      // Enviar email
      const emailSent = await EmailService.sendUserAccessToken(userEmail, username, token);

      if (!emailSent) {
        this.tokens.delete(token);
        return {
          success: false,
          message: 'Error al enviar el email. Verifica tu configuración de Resend.'
        };
      }

      return {
        success: true,
        message: `Código enviado a ${userEmail}. Válido por ${this.TOKEN_EXPIRY_MINUTES} minutos.`
      };
    } catch (error) {
      logger.error('Error generando token de usuario:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Genera y envía token para acceso de admin
   */
  static async generateAdminAccessToken(username: string): Promise<{ success: boolean; message: string }> {
    try {
      this.cleanExpiredTokens();

      const token = EmailService.generateToken();
      const expiresAt = Date.now() + (this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Guardar token
      this.tokens.set(token, {
        token,
        username,
        type: 'admin',
        expiresAt,
        used: false
      });

      // En modo desarrollo, mostrar el token en la consola del servidor
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        logger.info(`🔑 TOKEN ADMIN DESARROLLO: ${token}`);
      }

      // Siempre enviar email al admin (tanto en desarrollo como en producción)
      const emailSent = await EmailService.sendAdminAccessToken(username, token);

      if (!emailSent) {
        this.tokens.delete(token);
        return {
          success: false,
          message: 'Error al enviar el email. Verifica tu configuración de Resend.'
        };
      }

      return {
        success: true,
        message: `Código de admin enviado por email. Válido por ${this.TOKEN_EXPIRY_MINUTES} minutos.`
        // NO devolvemos el token en la respuesta para mantener la seguridad
      };
    } catch (error) {
      logger.error('Error generando token de admin:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verifica y consume un token
   */
  static verifyToken(token: string, expectedUsername: string, expectedType: 'user' | 'admin'): { valid: boolean; message: string } {
    this.cleanExpiredTokens();

    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return {
        valid: false,
        message: 'Código inválido o expirado'
      };
    }

    if (tokenData.used) {
      return {
        valid: false,
        message: 'Este código ya fue utilizado'
      };
    }

    if (tokenData.username !== expectedUsername) {
      return {
        valid: false,
        message: 'Código no válido para este usuario'
      };
    }

    if (tokenData.type !== expectedType) {
      return {
        valid: false,
        message: 'Tipo de acceso incorrecto'
      };
    }

    if (tokenData.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return {
        valid: false,
        message: 'Código expirado'
      };
    }

    // Marcar como usado
    tokenData.used = true;

    return {
      valid: true,
      message: 'Acceso autorizado'
    };
  }

  /**
   * Obtiene estadísticas de tokens (para debugging)
   */
  static getTokenStats(): { total: number; expired: number; used: number } {
    this.cleanExpiredTokens();
    const now = Date.now();
    let expired = 0;
    let used = 0;

    for (const tokenData of this.tokens.values()) {
      if (tokenData.expiresAt < now) {expired++;}
      if (tokenData.used) {used++;}
    }

    return {
      total: this.tokens.size,
      expired,
      used
    };
  }
}
