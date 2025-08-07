interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  'challenge_ts'?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function verifyRecaptcha(token: string, expectedAction?: string): Promise<{
  isValid: boolean;
  score?: number;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY no está configurado');
    return {
      isValid: false,
      error: 'Configuración de reCAPTCHA incompleta'
    };
  }

  if (!token) {
    return {
      isValid: false,
      error: 'Token de reCAPTCHA requerido'
    };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data: RecaptchaVerifyResponse = await response.json();

    if (!data.success) {
      console.error('Verificación de reCAPTCHA falló:', data['error-codes']);
      return {
        isValid: false,
        error: 'Verificación de reCAPTCHA falló'
      };
    }

    // Verificar la acción si se proporciona
    if (expectedAction && data.action !== expectedAction) {
      console.error('Acción de reCAPTCHA no coincide:', {
        expected: expectedAction,
        received: data.action
      });
      return {
        isValid: false,
        error: 'Acción de reCAPTCHA inválida'
      };
    }

    // Verificar el score (reCAPTCHA v3 devuelve un score de 0.0 a 1.0)
    // 1.0 es muy probablemente una interacción legítima, 0.0 muy probablemente un bot
    const minimumScore = 0.5; // Puedes ajustar este valor según tus necesidades
    
    if (data.score !== undefined && data.score < minimumScore) {
      console.warn('Score de reCAPTCHA bajo:', data.score);
      return {
        isValid: false,
        score: data.score,
        error: 'Score de reCAPTCHA muy bajo - posible bot'
      };
    }

    return {
      isValid: true,
      score: data.score
    };

  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return {
      isValid: false,
      error: 'Error interno verificando reCAPTCHA'
    };
  }
}
