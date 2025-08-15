import { Resend } from 'resend';

// Configurar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  bcc?: string | string[];
}

export interface BulkEmailOptions {
  to: string; // Email principal (madkoding@gmail.com)
  bcc: string[]; // Lista de emails en copia oculta
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
  static async sendEmail({ to, subject, html, from, bcc }: EmailOptions): Promise<boolean> {
    try {
      console.log('📧 [EMAIL SERVICE] sendEmail called with:', { to, subject: subject.substring(0, 50) + '...', from });
      
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ [EMAIL SERVICE] RESEND_API_KEY no está configurado');
        return false;
      }

      console.log('✅ [EMAIL SERVICE] RESEND_API_KEY is configured');
      console.log('📧 [EMAIL SERVICE] FROM_EMAIL:', this.FROM_EMAIL);

      const emailData: {
        from: string;
        to: string | string[];
        subject: string;
        html: string;
        bcc?: string[];
      } = {
        from: from ?? this.FROM_EMAIL,
        to,
        subject,
        html,
      };

      // Agregar BCC si se proporciona
      if (bcc) {
        emailData.bcc = Array.isArray(bcc) ? bcc : [bcc];
      }

      console.log('📧 [EMAIL SERVICE] Sending email with data:', {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        hasBcc: !!emailData.bcc,
        bccCount: emailData.bcc?.length || 0
      });

      const result = await resend.emails.send(emailData);

      console.log('✅ [EMAIL SERVICE] Email enviado exitosamente:', result.data?.id);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error enviando email:', error);
      return false;
    }
  }

  /**
   * Envía un correo masivo usando BCC para evitar spam
   */
  static async sendBulkEmail({ to, bcc, subject, html, from }: BulkEmailOptions): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY no está configurado');
        return false;
      }

      // Filtrar emails válidos
      const validEmails = bcc.filter(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      });

      if (validEmails.length === 0) {
        console.warn('No hay emails válidos para enviar');
        return false;
      }

      const result = await resend.emails.send({
        from: from ?? this.FROM_EMAIL,
        to: to, // Email principal (madkoding@gmail.com)
        bcc: validEmails, // Todos los destinatarios en BCC
        subject,
        html,
      });

      console.log(`Email masivo enviado exitosamente a ${validEmails.length} destinatarios:`, result.data?.id);
      return true;
    } catch (error) {
      console.error('Error enviando email masivo:', error);
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

  /**
   * Envía email de confirmación de compra con tracking y detalles del pedido
   */
  static async sendPurchaseConfirmation(
    email: string, 
    customerName: string, 
    trackingId: string, 
    orderDetails: {
      transactionId: string;
      amount: number;
      currency: string;
      trackers: number;
      sensor: string;
      colors: {
        case: string;
        tapa: string;
      };
      shippingAddress: {
        address: string;
        cityState: string;
        country: string;
      };
      paymentMethod: string;
      orderDate: string;
    }
  ): Promise<boolean> {
    console.log('📧 [EMAIL SERVICE] sendPurchaseConfirmation called with:', {
      email,
      customerName,
      trackingId,
      transactionId: orderDetails.transactionId,
      amount: orderDetails.amount
    });
    
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/seguimiento/${trackingId}`;
    
    console.log('📧 [EMAIL SERVICE] Base URL:', baseUrl);
    console.log('📧 [EMAIL SERVICE] Tracking URL:', trackingUrl);
    
    const subject = '🎉 ¡Compra confirmada! - MadTrackers SlimeVR Compatible';
    
    // Formatear el monto con separadores de miles
    const formattedAmount = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: orderDetails.currency === 'CLP' ? 'CLP' : 'USD',
      minimumFractionDigits: 0,
    }).format(orderDetails.amount);

    // Capitalizar nombres de colores
    const formatColor = (color: string) => color.charAt(0).toUpperCase() + color.slice(1);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Compra confirmada - MadTrackers</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 650px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 700; 
            }
            .header p { 
              margin: 10px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting { 
              font-size: 18px; 
              margin-bottom: 20px; 
              color: #667eea; 
              font-weight: 600; 
            }
            .tracking-section { 
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); 
              border-radius: 10px; 
              padding: 25px; 
              text-align: center; 
              margin: 25px 0; 
            }
            .tracking-id { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2c3e50; 
              margin: 15px 0; 
              letter-spacing: 2px; 
              background: white; 
              padding: 15px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .tracking-button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 25px; 
              font-weight: bold; 
              margin-top: 15px; 
              transition: all 0.3s ease;
            }
            .tracking-button:hover { 
              background: #5a6fd8; 
              transform: translateY(-2px); 
            }
            .order-details { 
              background: #f8f9fa; 
              border-radius: 10px; 
              padding: 25px; 
              margin: 25px 0; 
            }
            .order-details h3 { 
              color: #2c3e50; 
              margin-top: 0; 
              font-size: 20px; 
              border-bottom: 2px solid #667eea; 
              padding-bottom: 10px; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid #e9ecef; 
            }
            .detail-row:last-child { 
              border-bottom: none; 
              font-weight: bold; 
              font-size: 16px; 
              color: #667eea; 
            }
            .detail-label { 
              font-weight: 600; 
              color: #495057; 
            }
            .detail-value { 
              color: #212529; 
            }
            .address-section { 
              background: #e3f2fd; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .address-section h4 { 
              margin-top: 0; 
              color: #1976d2; 
            }
            .next-steps { 
              background: #fff3e0; 
              border-left: 4px solid #ff9800; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 0 8px 8px 0; 
            }
            .next-steps h4 { 
              color: #f57c00; 
              margin-top: 0; 
            }
            .contact-info { 
              background: #f1f8e9; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 25px 0; 
              text-align: center; 
            }
            .footer { 
              background: #2c3e50; 
              color: white; 
              text-align: center; 
              padding: 25px; 
              font-size: 14px; 
            }
            .footer a { 
              color: #a8edea; 
              text-decoration: none; 
            }
            @media (max-width: 600px) {
              .container { margin: 10px; }
              .header, .content { padding: 20px; }
              .detail-row { flex-direction: column; }
              .detail-value { margin-top: 5px; font-weight: 600; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Compra Confirmada!</h1>
              <p>Tu pedido ha sido procesado exitosamente</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                ¡Hola ${customerName}!
              </div>
              
              <p>¡Gracias por tu compra! Hemos recibido tu pago correctamente y tu pedido ya está en proceso. A continuación encontrarás todos los detalles de tu compra.</p>
              
              <div class="tracking-section">
                <h3 style="margin-top: 0; color: #2c3e50;">📦 Seguimiento de tu Pedido</h3>
                <p>Tu código de seguimiento es:</p>
                <div class="tracking-id">${trackingId}</div>
                <p>Usa este código para hacer seguimiento de tu pedido en cualquier momento:</p>
                <a href="${trackingUrl}" class="tracking-button">🔍 Ver Estado del Pedido</a>
              </div>
              
              <div class="order-details">
                <h3>📋 Detalles de tu Compra</h3>
                <div class="detail-row">
                  <span class="detail-label">ID de Transacción:</span>
                  <span class="detail-value">${orderDetails.transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de Compra:</span>
                  <span class="detail-value">${orderDetails.orderDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Método de Pago:</span>
                  <span class="detail-value">${orderDetails.paymentMethod}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Cantidad de Trackers:</span>
                  <span class="detail-value">${orderDetails.trackers} unidades</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Sensor:</span>
                  <span class="detail-value">${orderDetails.sensor}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Color del Case:</span>
                  <span class="detail-value">${formatColor(orderDetails.colors.case)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Color de la Tapa:</span>
                  <span class="detail-value">${formatColor(orderDetails.colors.tapa)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Pagado:</span>
                  <span class="detail-value">${formattedAmount}</span>
                </div>
              </div>
              
              <div class="address-section">
                <h4>📍 Dirección de Envío</h4>
                <p>
                  ${orderDetails.shippingAddress.address}<br>
                  ${orderDetails.shippingAddress.cityState}<br>
                  ${orderDetails.shippingAddress.country}
                </p>
              </div>
              
              <div class="next-steps">
                <h4>🚀 ¿Qué sigue ahora?</h4>
                <ul>
                  <li><strong>Fabricación:</strong> Tu pedido entrará en cola de fabricación</li>
                  <li><strong>Actualizaciones:</strong> Recibirás emails con el progreso de tu pedido</li>
                  <li><strong>Seguimiento:</strong> Puedes verificar el estado en cualquier momento con tu código</li>
                  <li><strong>Envío:</strong> Te notificaremos cuando tu pedido sea despachado</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <h4>💬 ¿Necesitas ayuda?</h4>
                <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
                <p>
                  📧 Email: <a href="mailto:madkoding@gmail.com">madkoding@gmail.com</a><br>
                  📱 WhatsApp: +56 9 7574 6099
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 MadTrackers SpA - Trackers SlimeVR Compatible</p>
              <p>Este es un email automático, por favor no respondas a esta dirección.</p>
              <p><a href="${baseUrl}">Visitar sitio web</a> | <a href="${trackingUrl}">Ver seguimiento</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('📧 [EMAIL SERVICE] About to send email to:', email);
    console.log('📧 [EMAIL SERVICE] Email subject:', subject);
    
    const result = await this.sendEmail({ to: email, subject, html });
    console.log('📧 [EMAIL SERVICE] Email send result:', result);
    
    return result;
  }
}
