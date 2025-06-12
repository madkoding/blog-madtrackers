import jwt from 'jsonwebtoken';
import { EmailService } from './emailService';
import { logger } from './logger';

interface JWTPayload {
  username: string;
  type: 'user' | 'admin';
  email?: string;
  iat: number;
  exp: number;
}

interface GeneratedToken {
  success: boolean;
  message: string;
  jwt?: string; // Solo se devuelve el JWT cuando es válido
}

/**
 * Servicio de autenticación JWT para admin y usuarios
 */
export class JWTAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET ?? 'madtrackers_jwt_secret_2025_change_in_production';
  private static readonly TOKEN_EXPIRY_MINUTES = 15;
  private static readonly EMAIL_TOKEN_LENGTH = 6;

  // Map para almacenar tokens de email temporales
  private static readonly emailTokens: Map<string, { 
    username: string; 
    type: 'user' | 'admin'; 
    email?: string; 
    expiresAt: number;
    used: boolean;
  }> = new Map();

  /**
   * Limpia tokens de email expirados
   */
  private static cleanExpiredEmailTokens(): void {
    const now = Date.now();
    for (const [tokenId, data] of this.emailTokens.entries()) {
      if (data.expiresAt < now) {
        this.emailTokens.delete(tokenId);
      }
    }
  }

  /**
   * Genera un token de email de 6 dígitos
   */
  private static generateEmailToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Genera un JWT con la información del usuario
   */
  private static generateJWT(username: string, type: 'user' | 'admin', email?: string): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      username,
      type,
      email
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: `${this.TOKEN_EXPIRY_MINUTES}m`,
      issuer: 'madtrackers-auth'
    });
  }

  /**
   * Verifica y decodifica un JWT
   */
  static verifyJWT(token: string): { valid: boolean; payload?: JWTPayload; message: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      return {
        valid: true,
        payload: decoded,
        message: 'Token válido'
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          message: 'Token expirado'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          message: 'Token inválido'
        };
      } else {
        return {
          valid: false,
          message: 'Error al verificar token'
        };
      }
    }
  }

  /**
   * Genera y envía token de email para acceso de usuario
   */
  static async generateUserAccessToken(username: string, userEmail: string): Promise<GeneratedToken> {
    try {
      this.cleanExpiredEmailTokens();

      const emailToken = this.generateEmailToken();
      const expiresAt = Date.now() + (this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Guardar token de email temporal
      this.emailTokens.set(emailToken, {
        username,
        type: 'user',
        email: userEmail,
        expiresAt,
        used: false
      });

      // Enviar email
      const emailSent = await EmailService.sendUserAccessToken(userEmail, username, emailToken);

      if (!emailSent) {
        this.emailTokens.delete(emailToken);
        return {
          success: false,
          message: 'Error al enviar el email. Verifica tu configuración de Resend.'
        };
      }

      return {
        success: true,
        message: `Código enviado a ${userEmail}. Válido por ${this.TOKEN_EXPIRY_MINUTES} minutos.`
        // NO devolvemos el token en la respuesta para mantener la seguridad
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
   * Genera y envía token de email para acceso de admin
   */
  static async generateAdminAccessToken(username: string): Promise<GeneratedToken> {
    try {
      this.cleanExpiredEmailTokens();

      const emailToken = this.generateEmailToken();
      const expiresAt = Date.now() + (this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Guardar token de email temporal
      this.emailTokens.set(emailToken, {
        username,
        type: 'admin',
        expiresAt,
        used: false
      });

      // En modo desarrollo, mostrar el token en la consola del servidor
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        logger.info(`🔑 TOKEN ADMIN DESARROLLO: ${emailToken}`);
      }

      // Siempre enviar email al admin (tanto en desarrollo como en producción)
      const emailSent = await EmailService.sendAdminAccessToken(username, emailToken);

      if (!emailSent) {
        this.emailTokens.delete(emailToken);
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
   * Verifica token de email y genera JWT si es válido
   */
  static verifyEmailTokenAndGenerateJWT(
    emailToken: string, 
    expectedUsername: string, 
    expectedType: 'user' | 'admin'
  ): { valid: boolean; message: string; jwt?: string } {
    this.cleanExpiredEmailTokens();

    const tokenData = this.emailTokens.get(emailToken);

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
      this.emailTokens.delete(emailToken);
      return {
        valid: false,
        message: 'Código expirado'
      };
    }

    // Marcar como usado
    tokenData.used = true;

    // Generar JWT
    const jwtToken = this.generateJWT(tokenData.username, tokenData.type, tokenData.email);

    return {
      valid: true,
      message: 'Acceso autorizado',
      jwt: jwtToken
    };
  }

  /**
   * Middleware para verificar JWT en requests
   */
  static requireAuth(requiredType?: 'user' | 'admin') {
    return (token: string): { authorized: boolean; user?: JWTPayload; message: string } => {
      const verification = this.verifyJWT(token);
      
      if (!verification.valid || !verification.payload) {
        return {
          authorized: false,
          message: verification.message
        };
      }

      if (requiredType && verification.payload.type !== requiredType) {
        return {
          authorized: false,
          message: 'Tipo de acceso no autorizado'
        };
      }

      return {
        authorized: true,
        user: verification.payload,
        message: 'Acceso autorizado'
      };
    };
  }

  /**
   * Obtiene estadísticas de tokens (para debugging)
   */
  static getTokenStats(): { emailTokens: number; expired: number; used: number } {
    this.cleanExpiredEmailTokens();
    const now = Date.now();
    let expired = 0;
    let used = 0;

    for (const tokenData of this.emailTokens.values()) {
      if (tokenData.expiresAt < now) {expired++;}
      if (tokenData.used) {used++;}
    }

    return {
      emailTokens: this.emailTokens.size,
      expired,
      used
    };
  }
}
