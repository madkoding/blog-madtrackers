#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para obtener el tamaño de archivo
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2); // KB
  } catch (error) {
    console.warn(`⚠️  No se pudo acceder al archivo: ${filePath} - ${error.message}`);
    return 'N/A';
  }
}

// Función para mostrar información de archivos
function analyzeModels() {
  console.log('📊 Análisis de modelos FBX actuales\n');

  const models = [
    '/Users/madkoding/GitHub/blog-madtrackers/public/models/SmolModel.fbx',
    '/Users/madkoding/GitHub/blog-madtrackers/public/models/tracker.fbx'
  ];

  models.forEach(modelPath => {
    const fileName = path.basename(modelPath);
    const size = getFileSize(modelPath);
    console.log(`📦 ${fileName}: ${size} KB`);
  });

  console.log('\n🛠️  Técnicas de optimización recomendadas:\n');
  
  console.log('1. 🔄 CONVERSIÓN A GLTF/GLB:');
  console.log('   • GLB puede ser 50-70% más pequeño que FBX');
  console.log('   • Mejor soporte en navegadores web');
  console.log('   • Carga más rápida con Three.js\n');
  
  console.log('2. 🗜️  COMPRESIÓN DRACO:');
  console.log('   • Reduce geometría hasta 90%');
  console.log('   • Compatible con Three.js');
  console.log('   • Ideal para modelos complejos\n');
  
  console.log('3. ⚡ OPTIMIZACIONES EN CÓDIGO:');
  console.log('   • Usar lazy loading (ya implementado)');
  console.log('   • Cachear modelos cargados');
  console.log('   • Eliminar texturas innecesarias\n');
  
  console.log('4. 🎨 SIMPLIFICACIÓN DE MATERIALES:');
  console.log('   • Usar menos materiales únicos');
  console.log('   • Combinar texturas similares');
  console.log('   • Reducir resolución de texturas\n');

  console.log('💡 Para convertir FBX a GLB, usa herramientas como:');
  console.log('   • Blender (Export > glTF 2.0)');
  console.log('   • FBX2glTF de Facebook');
  console.log('   • Online: https://products.aspose.app/3d/conversion/fbx-to-glb');
}

analyzeModels();
