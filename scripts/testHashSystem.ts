#!/usr/bin/env tsx

/**
 * Script de prueba completo para el sistema de hash seguro
 * Valida todas las funcionalidades implementadas
 */

import { generateUserHash, isHashFormat } from '../src/utils/hashUtils';

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  response?: any;
}

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'test_chile';
const EXPECTED_HASH = '2cdf071ab2faba52';

async function runTests(): Promise<void> {
  console.log('🔧 Iniciando pruebas del sistema de hash seguro...\n');
  
  const results: TestResult[] = [];
  
  // Test 1: Generación de hash
  console.log('📋 Test 1: Generación de hash');
  try {
    const hash = generateUserHash(TEST_USERNAME);
    const passed = hash === EXPECTED_HASH;
    results.push({
      test: 'Generación de hash',
      passed,
      details: `Esperado: ${EXPECTED_HASH}, Obtenido: ${hash}`
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- ${hash}`);
  } catch (error) {
    results.push({
      test: 'Generación de hash',
      passed: false,
      details: `Error: ${error}`
    });
    console.log('❌ FALLIDO - Error:', error);
  }
  
  // Test 2: Detección de formato hash
  console.log('\n📋 Test 2: Detección de formato hash');
  const hashFormatTests = [
    { input: EXPECTED_HASH, expected: true },
    { input: TEST_USERNAME, expected: false },
    { input: '1234567890abcdef', expected: true },
    { input: 'usuario_test', expected: false },
    { input: 'abc123', expected: false }
  ];
  
  for (const test of hashFormatTests) {
    const result = isHashFormat(test.input);
    const passed = result === test.expected;
    results.push({
      test: `Formato hash: ${test.input}`,
      passed,
      details: `Esperado: ${test.expected}, Obtenido: ${result}`
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- ${test.input}: ${result}`);
  }
  
  // Test 3: API endpoint por username
  console.log('\n📋 Test 3: API endpoint por username');
  try {
    const response = await fetch(`${BASE_URL}/api/public/tracking/${TEST_USERNAME}`);
    const data = await response.json();
    const passed = response.ok && data.nombreUsuario === TEST_USERNAME && data.userHash === EXPECTED_HASH;
    results.push({
      test: 'API endpoint por username',
      passed,
      details: `Status: ${response.status}, UserHash: ${data.userHash}`,
      response: data
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- Status: ${response.status}`);
  } catch (error) {
    results.push({
      test: 'API endpoint por username',
      passed: false,
      details: `Error: ${error}`
    });
    console.log('❌ FALLIDO - Error:', error);
  }
  
  // Test 4: API endpoint por hash
  console.log('\n📋 Test 4: API endpoint por hash');
  try {
    const response = await fetch(`${BASE_URL}/api/public/tracking/hash/${EXPECTED_HASH}`);
    const data = await response.json();
    const passed = response.ok && data.nombreUsuario === TEST_USERNAME && data.userHash === EXPECTED_HASH;
    results.push({
      test: 'API endpoint por hash',
      passed,
      details: `Status: ${response.status}, Username: ${data.nombreUsuario}`,
      response: data
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- Status: ${response.status}`);
  } catch (error) {
    results.push({
      test: 'API endpoint por hash',
      passed: false,
      details: `Error: ${error}`
    });
    console.log('❌ FALLIDO - Error:', error);
  }
  
  // Test 5: Página de seguimiento por username
  console.log('\n📋 Test 5: Página de seguimiento por username');
  try {
    const response = await fetch(`${BASE_URL}/seguimiento/${TEST_USERNAME}`);
    const passed = response.ok;
    results.push({
      test: 'Página seguimiento por username',
      passed,
      details: `Status: ${response.status}`
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- Status: ${response.status}`);
  } catch (error) {
    results.push({
      test: 'Página seguimiento por username',
      passed: false,
      details: `Error: ${error}`
    });
    console.log('❌ FALLIDO - Error:', error);
  }
  
  // Test 6: Página de seguimiento por hash
  console.log('\n📋 Test 6: Página de seguimiento por hash');
  try {
    const response = await fetch(`${BASE_URL}/seguimiento/${EXPECTED_HASH}`);
    const passed = response.ok;
    results.push({
      test: 'Página seguimiento por hash',
      passed,
      details: `Status: ${response.status}`
    });
    console.log(passed ? '✅ PASADO' : '❌ FALLIDO', `- Status: ${response.status}`);
  } catch (error) {
    results.push({
      test: 'Página seguimiento por hash',
      passed: false,
      details: `Error: ${error}`
    });
    console.log('❌ FALLIDO - Error:', error);
  }
  
  // Resumen de resultados
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('========================');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema de hash está funcionando correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los detalles arriba.');
    
    // Mostrar detalles de pruebas fallidas
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n📋 DETALLES DE PRUEBAS FALLIDAS:');
      failedTests.forEach(test => {
        console.log(`❌ ${test.test}: ${test.details}`);
      });
    }
  }
  
  console.log('\n🔚 Pruebas completadas.');
}

// Ejecutar pruebas si este archivo se ejecuta directamente
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
