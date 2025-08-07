import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../lib/emailService';
import { verifyRecaptcha } from '../../../lib/recaptchaUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, message, recaptchaToken } = await request.json();

    // Validar datos de entrada
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Verificar reCAPTCHA
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'contact_form');
    if (!recaptchaResult.isValid) {
      console.warn('Intento de envío bloqueado por reCAPTCHA:', {
        email,
        error: recaptchaResult.error,
        score: recaptchaResult.score
      });
      
      return NextResponse.json(
        { error: 'Verificación de seguridad falló. Por favor, intenta de nuevo.' },
        { status: 403 }
      );
    }

    console.log('reCAPTCHA verificado exitosamente:', {
      email,
      score: recaptchaResult.score
    });

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Configurar el HTML del email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px;">
          <h2 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; text-align: center;">
            📧 Nuevo mensaje de contacto desde MadTrackers
          </h2>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">👤 Información del contacto:</h3>
            <div style="padding: 15px; background-color: #f1f5f9; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> <span style="color: #2563eb;">${email}</span></p>
              <p style="margin: 5px 0;"><strong>🕒 Fecha:</strong> ${new Date().toLocaleString('es-ES', { 
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #374151; margin-top: 0; font-size: 18px;">💬 Mensaje:</h3>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <div style="white-space: pre-wrap; line-height: 1.8; color: #4b5563; font-size: 15px;">
${message}
              </div>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 Tip:</strong> Puedes responder directamente a este email para contactar al cliente. El email de respuesta será enviado a: <strong>${email}</strong>
            </p>
          </div>
          
          <hr style="margin: 40px 0; border: none; border-top: 2px solid #e5e7eb;">
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Este mensaje fue enviado desde el formulario de contacto de 
              <a href="https://madtrackers.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">MadTrackers.com</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              Sistema automatizado de notificaciones • No responder a este remitente
            </p>
          </div>
        </div>
      </div>
    `;

    // Enviar el email usando EmailService
    const success = await EmailService.sendEmail({
      to: 'contacto@madtrackers.com',
      subject: `🔔 Nuevo contacto desde MadTrackers - ${email}`,
      html: htmlMessage,
      // Configurar reply-to para que las respuestas vayan al cliente
      // Nota: Esto puede requerir configuración adicional en Resend
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email enviado exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error enviando email de contacto:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor al enviar el email' },
      { status: 500 }
    );
  }
}
