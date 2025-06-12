import { Resend } from 'resend';
import { logger } from './logger';

// Configurar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Servicio de email usando Resend
 */
export class EmailService {
  private static readonly FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@madtrackers.com';
  
  /**
   * Envía un email usando Resend
   */
  static async sendEmail({ to, subject, html, from }: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY no está configurado');
        return false;
      }

      const result = await resend.emails.send({
        from: from ?? this.FROM_EMAIL,
        to,
        subject,
        html,
      });

      logger.info('Email enviado exitosamente:', result.data?.id);
      return true;
    } catch (error) {
      logger.error('Error enviando email:', error);
      return false;
    }
  }

  /**
   * Genera un token único de 6 caracteres
   */
  static generateToken(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Envía email con token de acceso para seguimiento de usuario
   */
  static async sendUserAccessToken(email: string, username: string, token: string): Promise<boolean> {
    const subject = 'Código de acceso - MadTrackers Seguimiento';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Código de acceso - MadTrackers</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .token { background: #fff; border: 2px solid #667eea; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 MadTrackers</h1>
              <p>Código de acceso para seguimiento</p>
            </div>
            <div class="content">
              <h2>Hola ${username}!</h2>
              <p>Has solicitado acceso para ver el seguimiento de tu pedido. Usa el siguiente código para ingresar:</p>
              
              <div class="token">${token}</div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este código es válido por 15 minutos</li>
                  <li>No compartas este código con nadie</li>
                  <li>Si no solicitaste este acceso, ignora este email</li>
                </ul>
              </div>
              
              <p>Si tienes alguna pregunta, contáctanos en: <a href="mailto:madkoding@gmail.com">madkoding@gmail.com</a></p>
            </div>
            <div class="footer">
              <p>© 2025 MadTrackers - Seguimiento de pedidos</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  /**
   * Envía email con token de acceso para administrador
   */
  static async sendAdminAccessToken(username: string, token: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'madkoding@gmail.com';
    const subject = `🔧 Código de acceso ADMIN - ${username}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Código de acceso ADMIN - MadTrackers</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .token { background: #fff; border: 2px solid #e74c3c; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; color: #e74c3c; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .admin-info { background: #ffe6e6; border: 1px solid #ffcccb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 MadTrackers ADMIN</h1>
              <p>Código de acceso administrativo</p>
            </div>
            <div class="content">
              <h2>Acceso solicitado para: ${username}</h2>
              <p>Se ha solicitado acceso administrativo para editar el seguimiento del usuario. Código de acceso:</p>
              
              <div class="token">${token}</div>
              
              <div class="admin-info">
                <strong>🔒 Acceso Administrativo:</strong>
                <ul>
                  <li>Usuario: <strong>${username}</strong></li>
                  <li>Válido por: <strong>15 minutos</strong></li>
                  <li>Permisos: Edición completa del seguimiento</li>
                </ul>
              </div>
              
              <p><strong>URL de acceso:</strong> <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/admin/seguimiento/${username}">Panel Admin</a></p>
            </div>
            <div class="footer">
              <p>© 2025 MadTrackers - Panel Administrativo</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: adminEmail, subject, html });
  }
}
