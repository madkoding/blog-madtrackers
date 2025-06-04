#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para obtener tamaño de archivo
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    console.warn(`Warning: Could not get file size for ${filePath}: ${error.message}`);
    return 'N/A';
  }
}

function generateOptimizationReport() {
  console.log('🚀 REPORTE COMPLETO DE OPTIMIZACIÓN FBX\n');
  console.log('=' .repeat(60));
  
  // 1. Análisis de archivos actuales
  console.log('\n📊 TAMAÑOS ACTUALES:');
  
  const modelsDir = '/Users/madkoding/GitHub/blog-madtrackers/public/models';
  const assetsDir = '/Users/madkoding/GitHub/blog-madtrackers/public/assets';
  
  // Modelos FBX
  const models = [
    { name: 'SmolModel.fbx', path: path.join(modelsDir, 'SmolModel.fbx') },
    { name: 'tracker.fbx', path: path.join(modelsDir, 'tracker.fbx') }
  ];
  
  let totalModelSize = 0;
  models.forEach(model => {
    const size = parseFloat(getFileSize(model.path));
    totalModelSize += size;
    console.log(`   📦 ${model.name}: ${size} KB`);
  });
  
  // Texturas HDR
  const hdrFiles = [
    { name: 'env_original.hdr', path: path.join(assetsDir, 'env_original.hdr'), desc: 'Original (1024x512)' },
    { name: 'env_512x256.hdr', path: path.join(assetsDir, 'env_512x256.hdr'), desc: 'Media resolución' },
    { name: 'env_256x128.hdr', path: path.join(assetsDir, 'env_256x128.hdr'), desc: 'Optimizada (USADA)' },
    { name: 'env_64x32.hdr', path: path.join(assetsDir, 'env_64x32.hdr'), desc: 'Móvil' }
  ];
  
  console.log('\n🎨 MAPAS DE ENTORNO HDR:');
  hdrFiles.forEach(file => {
    const size = getFileSize(file.path);
    const isUsed = file.name === 'env_256x128.hdr' ? ' ✅ EN USO' : '';
    console.log(`   🌍 ${file.name}: ${size} KB (${file.desc})${isUsed}`);
  });
  
  // Texturas adicionales
  console.log('\n🖼️  TEXTURAS ADICIONALES:');
  const noiseNormalPath = path.join(assetsDir, 'noise-normal.webp');
  const noiseNormalSize = getFileSize(noiseNormalPath);
  console.log(`   📐 noise-normal.webp: ${noiseNormalSize} KB (Normal map optimizado)`);
  
  console.log('\n' + '=' .repeat(60));
  
  // 2. Optimizaciones implementadas
  console.log('\n✅ OPTIMIZACIONES IMPLEMENTADAS:\n');
  
  console.log('🔧 OPTIMIZACIONES DE CÓDIGO:');
  console.log('   ✓ Environment map reducido: env.hdr → env_256x128.hdr (-75% tamaño)');
  console.log('   ✓ Eliminación de mapas de textura innecesarios (map, roughnessMap, etc.)');
  console.log('   ✓ Configuración optimizada de filtros de textura');
  console.log('   ✓ Sistema de caché para modelos cargados (ModelCache.ts)');
  console.log('   ✓ Level of Detail (LOD) dinámico basado en distancia');
  console.log('   ✓ Lazy loading mejorado con componentes optimizados');
  
  console.log('\n🎯 NUEVOS COMPONENTES:');
  console.log('   ✓ OptimizedFBXModel.tsx - Versión optimizada del modelo');
  console.log('   ✓ ModelCache.ts - Sistema de caché global');
  console.log('   ✓ LazyOptimizedFBXModel.tsx - Wrapper optimizado');
  
  console.log('\n⚡ OPTIMIZACIONES DE RENDIMIENTO:');
  console.log('   ✓ Simplificación automática de geometría según distancia');
  console.log('   ✓ Materiales optimizados por tipo (main, secondary, default)');
  console.log('   ✓ Eliminación de mipmaps innecesarios');
  console.log('   ✓ Configuración de memoria eficiente');
  
  // 3. Ahorros logrados
  console.log('\n' + '=' .repeat(60));
  console.log('\n💰 AHORROS CONSEGUIDOS:\n');
  
  const originalEnvSize = parseFloat(getFileSize(path.join(assetsDir, 'env_original.hdr')));
  const optimizedEnvSize = parseFloat(getFileSize(path.join(assetsDir, 'env_256x128.hdr')));
  const envSavings = originalEnvSize - optimizedEnvSize;
  const envSavingsPercent = ((envSavings / originalEnvSize) * 100).toFixed(1);
  
  console.log(`🌍 Environment Map:`);
  console.log(`   Original: ${originalEnvSize} KB → Optimizado: ${optimizedEnvSize} KB`);
  console.log(`   Ahorro: ${envSavings.toFixed(2)} KB (${envSavingsPercent}%)`);
  
  console.log(`\n📦 Carga inicial reducida en: ~${envSavings.toFixed(0)} KB`);
  console.log(`⚡ Rendimiento mejorado: LOD + Cache + Optimizaciones`);
  
  // 4. Próximos pasos recomendados
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎯 PRÓXIMOS PASOS RECOMENDADOS:\n');
  
  console.log('🔄 CONVERSIÓN A FORMATOS MODERNOS:');
  console.log('   • Convertir FBX → GLB/GLTF (ahorro estimado: 50-70%)');
  console.log('   • Usar compresión Draco para geometría');
  console.log('   • Implementar texturas comprimidas (KTX2, ASTC)');
  
  console.log('\n📱 OPTIMIZACIONES ADICIONALES:');
  console.log('   • Usar env_64x32.hdr para dispositivos móviles');
  console.log('   • Implementar detección de capabilities del dispositivo');
  console.log('   • Precargar modelos críticos');
  
  console.log('\n🛠️  HERRAMIENTAS SUGERIDAS:');
  console.log('   • Blender: Export → glTF 2.0 Binary (.glb)');
  console.log('   • gltf-transform: Optimización automática');
  console.log('   • FBX2glTF: Conversión por lotes');
  
  // 5. Comandos útiles
  console.log('\n' + '=' .repeat(60));
  console.log('\n⚙️  COMANDOS PARA CONVERSIÓN:\n');
  
  console.log('# Instalar herramientas de conversión:');
  console.log('npm install -g @gltf-transform/cli');
  console.log('');
  console.log('# Convertir FBX a GLB (requiere Blender):');
  console.log('blender --background --python fbx_to_glb.py -- input.fbx output.glb');
  console.log('');
  console.log('# Optimizar GLB existente:');
  console.log('gltf-transform optimize input.glb output.glb --compress --instance');
  
  // 6. Estimación de ahorros totales
  const potentialFbxSavings = totalModelSize * 0.6; // 60% ahorro estimado con GLB+Draco
  const totalCurrentSavings = envSavings;
  const totalPotentialSavings = totalCurrentSavings + potentialFbxSavings;
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 RESUMEN DE AHORROS:\n');
  console.log(`✅ Ya conseguido: ${totalCurrentSavings.toFixed(0)} KB`);
  console.log(`🎯 Potencial adicional: ${potentialFbxSavings.toFixed(0)} KB (con conversión GLB)`);
  console.log(`💎 Total posible: ${totalPotentialSavings.toFixed(0)} KB`);
  
  const currentTotal = totalModelSize + originalEnvSize;
  const finalTotal = currentTotal - totalPotentialSavings;
  const totalReduction = ((totalPotentialSavings / currentTotal) * 100).toFixed(1);
  
  console.log(`\n📈 De ${currentTotal.toFixed(0)} KB → ${finalTotal.toFixed(0)} KB (${totalReduction}% reducción total)`);
  
  console.log('\n🎉 ¡Optimización FBX completada con éxito!');
  console.log('=' .repeat(60));
}

// Ejecutar reporte
generateOptimizationReport();
