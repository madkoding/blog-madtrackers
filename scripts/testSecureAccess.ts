#!/usr/bin/env tsx

/**
 * Script de prueba para validar que SOLO funciona el acceso por hash
 */

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'test_chile';
const EXPECTED_HASH = '2cdf071ab2faba52';

async function testSecureAccess(): Promise<void> {
  console.log('🔒 Probando acceso seguro SOLO por hash...\n');
  
  try {
    // Test 1: Intentar acceso directo por username (DEBE FALLAR)
    console.log('📋 Test 1: Acceso directo por username (debe fallar)');
    const usernamePageResponse = await fetch(`${BASE_URL}/seguimiento/${TEST_USERNAME}`);
    
    if (usernamePageResponse.ok) {
      // Verificar si la página carga pero sin datos (esperamos que no muestre el tracking)
      const htmlContent = await usernamePageResponse.text();
      const hasError = htmlContent.includes('Acceso no autorizado') || 
                       htmlContent.includes('No se encontró') ||
                       htmlContent.includes('error');
      
      if (hasError) {
        console.log('✅ CORRECTO: Acceso por username rechazado');
      } else {
        console.log('❌ PROBLEMA: Acceso por username permitido (no debería)');
      }
    } else {
      console.log('✅ CORRECTO: Página no accesible por username');
    }
    
    // Test 2: Acceso por hash (DEBE FUNCIONAR)
    console.log('\n📋 Test 2: Acceso por hash (debe funcionar)');
    const hashPageResponse = await fetch(`${BASE_URL}/seguimiento/${EXPECTED_HASH}`);
    
    if (hashPageResponse.ok) {
      console.log('✅ CORRECTO: Acceso por hash permitido');
    } else {
      console.log(`❌ PROBLEMA: Acceso por hash falló (${hashPageResponse.status})`);
    }
    
    // Test 3: API de búsqueda por username para redirección (debe funcionar)
    console.log('\n📋 Test 3: API para búsqueda interna (debe funcionar)');
    const apiResponse = await fetch(`${BASE_URL}/api/public/tracking/${TEST_USERNAME}`);
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('✅ CORRECTO: API interna funciona para obtener hash');
      console.log(`   - Hash obtenido: ${data.userHash}`);
    } else {
      console.log(`❌ PROBLEMA: API interna falló (${apiResponse.status})`);
    }
    
    // Test 4: API de hash directo (debe funcionar)
    console.log('\n📋 Test 4: API de hash directo (debe funcionar)');
    const hashApiResponse = await fetch(`${BASE_URL}/api/public/tracking/hash/${EXPECTED_HASH}`);
    
    if (hashApiResponse.ok) {
      const hashData = await hashApiResponse.json();
      console.log('✅ CORRECTO: API de hash funciona');
      console.log(`   - Username: ${hashData.nombreUsuario}`);
    } else {
      console.log(`❌ PROBLEMA: API de hash falló (${hashApiResponse.status})`);
    }
    
    console.log('\n🎯 RESULTADO ESPERADO:');
    console.log('   ✅ Acceso directo por username: RECHAZADO');
    console.log('   ✅ Acceso por hash: PERMITIDO');
    console.log('   ✅ Búsqueda desde página principal: Redirige a hash');
    console.log('   ✅ APIs funcionan para conversión interna');
    
    console.log('\n📝 PARA PROBAR MANUALMENTE:');
    console.log(`   1. Ve a: ${BASE_URL}/seguimiento/${TEST_USERNAME} (debe mostrar error)`);
    console.log(`   2. Ve a: ${BASE_URL}/seguimiento/${EXPECTED_HASH} (debe funcionar)`);
    console.log(`   3. Ve a: ${BASE_URL}/seguimiento y busca "${TEST_USERNAME}" (debe redirigir a hash)`);
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar pruebas
testSecureAccess().catch(console.error);
