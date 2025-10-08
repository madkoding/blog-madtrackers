import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../../lib/emailService';
import { FirebaseTrackingService } from '../../../../lib/firebaseTrackingService';
import { UserTracking } from '../../../../interfaces/tracking';
import { validateApiKeyOrJWT, corsHeaders, jwtUnauthorizedResponse } from '../../../../lib/apiAuth';

export const dynamic = 'force-dynamic';

interface SendEmailsRequest {
  recipients: 'all' | 'selected';
  selectedUserIds?: string[];
  subject: string;
  message: string;
}

interface EmailResult {
  totalUsers: number;
  validEmails: number;
  invalidEmails: number;
  success: boolean;
  error?: string;
}

// Función auxiliar para reemplazar variables en el mensaje
function replaceVariables(message: string, user: UserTracking): string {
  return message
    .replace(/\{nombre\}/g, user.nombreUsuario)
    .replace(/\{nombreUsuario\}/g, user.nombreUsuario)
    .replace(/\{email\}/g, user.contacto)
    .replace(/\{contacto\}/g, user.contacto)
    .replace(/\{numeroTrackers\}/g, user.numeroTrackers.toString())
    .replace(/\{sensor\}/g, user.sensor)
    .replace(/\{colorCase\}/g, user.colorCase)
    .replace(/\{colorTapa\}/g, user.colorTapa)
    .replace(/\{paisEnvio\}/g, user.paisEnvio)
    .replace(/\{estadoPedido\}/g, user.estadoPedido);
}

// Función auxiliar para reemplazar variables en mensaje masivo
function replaceVariablesGeneral(message: string): string {
  return message
    .replace(/\{nombre\}/g, 'estimado usuario')
    .replace(/\{nombreUsuario\}/g, 'estimado usuario')
    .replace(/\{email\}/g, '[tu email]')
    .replace(/\{contacto\}/g, '[tu contacto]')
    .replace(/\{numeroTrackers\}/g, '[tus trackers]')
    .replace(/\{sensor\}/g, '[tu sensor]')
    .replace(/\{colorCase\}/g, '[tu color de case]')
    .replace(/\{colorTapa\}/g, '[tu color de tapa]')
    .replace(/\{paisEnvio\}/g, '[tu país]')
    .replace(/\{estadoPedido\}/g, '[estado de tu pedido]');
}

// Función auxiliar para envío de correo individual personalizado
async function sendPersonalizedEmail(user: UserTracking, subject: string, message: string): Promise<boolean> {
  // Personalizar el mensaje con todas las variables disponibles
  const personalizedMessage = replaceVariables(message, user);
  
  // Crear HTML del email personalizado
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola ${user.nombreUsuario},</h2>
        <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
          ${personalizedMessage.replace(/\n/g, '<br>')}
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Saludos,<br>
            <strong>El equipo de MadTrackers</strong>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Este es un mensaje desde nuestro sistema administrativo.
          </p>
        </div>
      </div>
    </div>
  `;

  // Enviar correo personalizado con BCC a madkoding
  return await EmailService.sendEmail({
    to: user.contacto, // Usuario como destinatario principal
    bcc: 'madkoding@gmail.com', // Copia oculta para registro
    subject: subject,
    html: htmlMessage
  });
}

// Función auxiliar para procesar usuarios y preparar correo masivo
async function prepareBulkEmail(targetUsers: UserTracking[], subject: string, message: string): Promise<EmailResult> {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails: string[] = [];
    let invalidCount = 0;

    // Procesar todos los usuarios y extraer emails válidos
    for (const user of targetUsers) {
      if (emailRegex.test(user.contacto)) {
        validEmails.push(user.contacto);
      } else {
        console.warn(`Usuario ${user.nombreUsuario} no tiene un email válido: ${user.contacto}`);
        invalidCount++;
      }
    }

    if (validEmails.length === 0) {
      return {
        totalUsers: targetUsers.length,
        validEmails: 0,
        invalidEmails: invalidCount,
        success: false,
        error: 'No hay emails válidos para enviar'
      };
    }

    // Caso especial: Solo 1 usuario - envío directo con personalización
    if (validEmails.length === 1) {
      const singleUser = targetUsers.find(user => emailRegex.test(user.contacto));
      if (!singleUser) {
        return {
          totalUsers: targetUsers.length,
          validEmails: 0,
          invalidEmails: invalidCount,
          success: false,
          error: 'No se encontró el usuario válido'
        };
      }

      const success = await sendPersonalizedEmail(singleUser, subject, message);

      return {
        totalUsers: targetUsers.length,
        validEmails: success ? 1 : 0,
        invalidEmails: success ? invalidCount : invalidCount + 1,
        success,
        error: success ? undefined : 'Error al enviar el correo personalizado'
      };
    }

    // Caso múltiple: Envío masivo con BCC (método original)
    // Personalizar el mensaje con variables generalizadas
    const generalMessage = replaceVariablesGeneral(message);
    
    // Crear HTML del email
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hola,</h2>
          <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0;">
            ${generalMessage.replace(/\n/g, '<br>')}
          </div>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Saludos,<br>
              <strong>El equipo de MadTrackers</strong>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Este es un mensaje automático desde nuestro sistema administrativo.
            </p>
          </div>
        </div>
      </div>
    `;

    // Enviar correo masivo con BCC
    const success = await EmailService.sendBulkEmail({
      to: 'madkoding@gmail.com', // Email principal
      bcc: validEmails, // Todos los usuarios en BCC
      subject: subject,
      html: htmlMessage
    });

    return {
      totalUsers: targetUsers.length,
      validEmails: validEmails.length,
      invalidEmails: invalidCount,
      success,
      error: success ? undefined : 'Error al enviar el correo masivo'
    };

  } catch (error) {
    console.error('Error preparando correo masivo:', error);
    return {
      totalUsers: targetUsers.length,
      validEmails: 0,
      invalidEmails: targetUsers.length,
      success: false,
      error: 'Error interno al procesar el correo masivo'
    };
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validar autenticación (API Key o JWT)
    const auth = validateApiKeyOrJWT(request, 'admin');
    if (!auth.valid) {
      return jwtUnauthorizedResponse(auth.message);
    }

    const { recipients, selectedUserIds, subject, message }: SendEmailsRequest = await request.json();

    // Validar datos de entrada
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Asunto y mensaje son requeridos' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (recipients === 'selected' && (!selectedUserIds || selectedUserIds.length === 0)) {
      return NextResponse.json(
        { error: 'Debes seleccionar al menos un usuario' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Obtener usuarios según la selección
    let targetUsers: UserTracking[] = [];
    
    if (recipients === 'all') {
      // Obtener todos los usuarios
      targetUsers = await FirebaseTrackingService.getAllTrackings();
    } else {
      // Obtener usuarios seleccionados
      const allUsers = await FirebaseTrackingService.getAllTrackings();
      targetUsers = allUsers.filter(user => selectedUserIds!.includes(user.id!));
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron usuarios para enviar correos' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Enviar correo masivo con BCC
    const result = await prepareBulkEmail(targetUsers, subject, message);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al enviar correos' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`Correo enviado: ${result.validEmails} emails válidos, ${result.invalidEmails} inválidos`);

    // Determinar el método usado
    const method = result.validEmails === 1 ? 'single_personalized' : 'bulk_bcc';
    const mainRecipient = result.validEmails === 1 ? 
      targetUsers.find(user => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.contacto))?.contacto || 'desconocido' : 
      'madkoding@gmail.com';

    return NextResponse.json({
      success: true,
      sentCount: result.validEmails,
      failedCount: result.invalidEmails,
      totalUsers: result.totalUsers,
      method: method,
      mainRecipient: mainRecipient,
      bccRecipient: result.validEmails === 1 ? 'madkoding@gmail.com' : undefined
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error en envío de emails:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
