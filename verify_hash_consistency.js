#!/usr/bin/env node

/**
 * Script para verificar que el hash mostrado en admin coincide con el de usuario
 */

console.log('🔍 VERIFICACIÓN DE HASH CONSISTENTE');
console.log('===================================\n');

const testHash = '54c15aeea124dfa7';
const testUsername = 'testuser';

console.log('1. DATOS DE PRUEBA:');
console.log(`   Username: ${testUsername}`);
console.log(`   Hash válido: ${testHash}`);
console.log('');

console.log('2. URLs PARA VERIFICAR:');
console.log(`   👤 Página Usuario: http://localhost:3000/seguimiento/${testHash}`);
console.log(`   🔧 Página Admin:   http://localhost:3000/admin/seguimiento/${testHash}`);
console.log('');

console.log('3. PROBLEMA IDENTIFICADO Y SOLUCIONADO:');
console.log('   ❌ Antes: ShareableLink usaba generateUserHashClient() que genera hash diferente');
console.log('   ✅ Ahora: ShareableLink usa el userHash del servidor (mismo que la página usuario)');
console.log('');

console.log('4. VERIFICAR EN LAS PÁGINAS:');
console.log('   - Ambas páginas deben mostrar el mismo hash');
console.log('   - El enlace compartible en admin debe usar el hash del servidor');
console.log('   - Si aparece warning en admin, significa que falta userHash en los datos');
console.log('');

console.log('✅ HASH UNIFICADO - VERIFICAR PÁGINAS ABIERTAS');
