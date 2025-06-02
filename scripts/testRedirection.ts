#!/usr/bin/env tsx

/**
 * Script de prueba rápida para validar la redirección de username a hash
 */

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'test_chile';
const EXPECTED_HASH = '2cdf071ab2faba52';

async function testRedirection(): Promise<void> {
  console.log('🔧 Probando redirección de username a hash...\n');
  
  try {
    // Test 1: Verificar que el API devuelve el hash para el username
    console.log('📋 Test 1: API devuelve hash para username');
    const response = await fetch(`${BASE_URL}/api/public/tracking/${TEST_USERNAME}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(`   - Username: ${data.nombreUsuario}`);
      console.log(`   - Hash: ${data.userHash}`);
      console.log(`   - Hash esperado: ${EXPECTED_HASH}`);
      
      if (data.userHash === EXPECTED_HASH) {
        console.log('✅ Hash coincide con el esperado');
      } else {
        console.log('❌ Hash NO coincide con el esperado');
      }
    } else {
      console.log(`❌ Error en la respuesta: ${response.status}`);
    }
    
    // Test 2: Verificar que el endpoint de hash funciona
    console.log('\n📋 Test 2: Endpoint de hash funciona');
    const hashResponse = await fetch(`${BASE_URL}/api/public/tracking/hash/${EXPECTED_HASH}`);
    
    if (hashResponse.ok) {
      const hashData = await hashResponse.json();
      console.log('✅ Endpoint de hash funciona:');
      console.log(`   - Username: ${hashData.nombreUsuario}`);
      console.log(`   - Hash: ${hashData.userHash}`);
    } else {
      console.log(`❌ Error en endpoint de hash: ${hashResponse.status}`);
    }
    
    // Test 3: Verificar que las páginas cargan
    console.log('\n📋 Test 3: Páginas cargan correctamente');
    
    const pageUsernameResponse = await fetch(`${BASE_URL}/seguimiento/${TEST_USERNAME}`);
    console.log(`   - Página con username: ${pageUsernameResponse.ok ? '✅' : '❌'} (${pageUsernameResponse.status})`);
    
    const pageHashResponse = await fetch(`${BASE_URL}/seguimiento/${EXPECTED_HASH}`);
    console.log(`   - Página con hash: ${pageHashResponse.ok ? '✅' : '❌'} (${pageHashResponse.status})`);
    
    console.log('\n🎉 Pruebas completadas. Ahora puedes probar manualmente:');
    console.log(`   1. Ve a: ${BASE_URL}/seguimiento`);
    console.log(`   2. Busca: ${TEST_USERNAME}`);
    console.log(`   3. Deberías ser redirigido a: ${BASE_URL}/seguimiento/${EXPECTED_HASH}`);
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas
testRedirection().catch(console.error);
