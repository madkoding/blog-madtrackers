#!/usr/bin/env node

/**
 * Script de prueba para verificar la autenticación de admin
 * Ejecutar: node test_admin_auth.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAdminAuth() {
  console.log('🧪 Probando autenticación de admin...\n');
  
  try {
    // Paso 1: Solicitar token de admin
    console.log('1️⃣ Solicitando token de admin...');
    const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Administrador',
        type: 'admin'
      })
    });

    const tokenResult = await tokenResponse.json();
    console.log(`   Status: ${tokenResponse.status}`);
    console.log(`   Response:`, tokenResult);

    if (tokenResponse.ok) {
      console.log('✅ Token de admin solicitado exitosamente');
      console.log(`📧 Verificar email para obtener el código de verificación`);
    } else {
      console.log('❌ Error al solicitar token de admin');
      console.log('📝 Detalles del error:', tokenResult);
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

async function testUserList() {
  console.log('\n🧪 Probando endpoint de lista de usuarios...\n');
  
  try {
    console.log('2️⃣ Obteniendo lista de usuarios...');
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || 'admin-key'
      }
    });

    const usersResult = await usersResponse.json();
    console.log(`   Status: ${usersResponse.status}`);

    if (usersResponse.ok) {
      console.log('✅ Lista de usuarios obtenida exitosamente');
      console.log(`📊 Total de usuarios: ${usersResult.users?.length || 0}`);
      
      if (usersResult.users?.length > 0) {
        console.log('👥 Primeros usuarios:');
        usersResult.users.slice(0, 3).forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.nombreUsuario} (${user.contacto})`);
        });
      }
    } else {
      console.log('❌ Error al obtener lista de usuarios');
      console.log('📝 Detalles del error:', usersResult);
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

// Ejecutar las pruebas
(async () => {
  console.log('🚀 Iniciando pruebas de funcionalidad de admin\n');
  console.log('🔗 Base URL:', BASE_URL);
  console.log('═'.repeat(60));
  
  await testAdminAuth();
  await testUserList();
  
  console.log('\n═'.repeat(60));
  console.log('🏁 Pruebas completadas');
})();
