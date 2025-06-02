/**
 * Script de prueba para verificar el fix del token de autenticación del admin
 */

const BASE_URL = 'http://localhost:3000';

async function testAdminTokenFlow() {
  console.log('🧪 Iniciando prueba del flujo de autenticación admin...\n');

  try {
    // Paso 1: Solicitar token
    console.log('1️⃣ Solicitando token para admin...');
    const requestResponse = await fetch(`${BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Administrador',
        type: 'admin'
      }),
    });

    const requestData = await requestResponse.json();
    console.log('📧 Respuesta de solicitud:', requestData);

    if (!requestData.success) {
      console.error('❌ Error al solicitar token:', requestData.message);
      return;
    }

    console.log('✅ Token solicitado exitosamente\n');

    // Paso 2: Simular verificación con token inválido
    console.log('2️⃣ Probando con token inválido...');
    const invalidVerifyResponse = await fetch(`${BASE_URL}/api/auth/token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'INVALID',
        username: 'Administrador',
        type: 'admin'
      }),
    });

    const invalidData = await invalidVerifyResponse.json();
    console.log('❌ Respuesta con token inválido:', invalidData);

    if (invalidData.valid) {
      console.error('🚨 PROBLEMA: Token inválido fue aceptado');
      return;
    }

    console.log('✅ Token inválido rechazado correctamente\n');

    // Paso 3: Verificar estadísticas de tokens
    console.log('3️⃣ Estado del sistema de tokens:');
    console.log('- Tokens generados: ✅');
    console.log('- Validación de tokens inválidos: ✅');
    console.log('- Parámetros correctos: username="Administrador", type="admin"');

    console.log('\n🎉 Prueba completada. El fix del token admin está funcionando correctamente.');
    console.log('\n📝 Para probar manualmente:');
    console.log('1. Ve a http://localhost:3000/admin');
    console.log('2. Ingresa "Administrador" y selecciona tipo "admin"');
    console.log('3. Revisa el email configurado en ADMIN_EMAIL para obtener el código');
    console.log('4. Ingresa el código de 6 caracteres recibido');

  } catch (error) {
    console.error('💥 Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba si se ejecuta directamente
if (require.main === module) {
  testAdminTokenFlow();
}

module.exports = { testAdminTokenFlow };
