#!/usr/bin/env npx tsx

/**
 * Script para probar el flujo de autenticación de usuario con hash
 */

import { generateUserHash } from '../src/utils/hashUtils';

// Función de prueba para verificar el flujo
async function testUserAuthFlow() {
  console.log('🧪 Probando flujo de autenticación de usuario con hash...\n');

  // 1. Generar hash para usuario de prueba
  const testUsername = 'testuser';
  const testHash = generateUserHash(testUsername);
  
  console.log(`1️⃣ Usuario de prueba: ${testUsername}`);
  console.log(`2️⃣ Hash generado: ${testHash}`);
  console.log(`3️⃣ URL de seguimiento: /seguimiento/${testHash}\n`);

  // 2. Simular solicitud de token
  console.log('📧 Simulando solicitud de token...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testHash, // Enviamos el hash como username
        type: 'user'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Token de acceso solicitado exitosamente');
      console.log(`📨 Mensaje: ${result.message}`);
    } else {
      console.log('❌ Error al solicitar token');
      console.log(`🚨 Error: ${result.message || result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('\n💡 Asegúrate de que el servidor esté ejecutándose en localhost:3000');
  }

  console.log('\n🔍 Flujo esperado:');
  console.log('1. Usuario accede a /seguimiento/54c15aeea124dfa7');
  console.log('2. Sistema requiere autenticación y muestra modal');
  console.log('3. Usuario solicita código de acceso');
  console.log('4. Sistema detecta que es un hash, busca el usuario real');
  console.log('5. Sistema envía código al email del usuario real (testuser@example.com)');
  console.log('6. Usuario ingresa código y obtiene acceso JWT');
  console.log('7. Sistema permite ver datos de seguimiento');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testUserAuthFlow().catch(console.error);
}

export { testUserAuthFlow };
