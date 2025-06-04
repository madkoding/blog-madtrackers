#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Rutas de los archivos
const modelPaths = [
  {
    input: '/Users/madkoding/GitHub/blog-madtrackers/public/models/SmolModel.fbx',
    output: '/Users/madkoding/GitHub/blog-madtrackers/public/models/SmolModel.glb',
    outputOptimized: '/Users/madkoding/GitHub/blog-madtrackers/public/models/SmolModel-optimized.glb'
  },
  {
    input: '/Users/madkoding/GitHub/blog-madtrackers/public/models/tracker.fbx',
    output: '/Users/madkoding/GitHub/blog-madtrackers/public/models/tracker.glb',
    outputOptimized: '/Users/madkoding/GitHub/blog-madtrackers/public/models/tracker-optimized.glb'
  }
];

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2); // KB
  } catch (error) {
    console.warn(`Warning: Could not get file size for ${filePath}: ${error.message}`);
    return 'N/A';
  }
}

async function optimizeModels() {
  console.log('🚀 Iniciando optimización de modelos FBX...\n');

  for (const model of modelPaths) {
    const modelName = path.basename(model.input, '.fbx');
    console.log(`📦 Procesando: ${modelName}`);
    
    const originalSize = await getFileSize(model.input);
    console.log(`   Tamaño original: ${originalSize} KB`);

    try {
      // Paso 1: Convertir FBX a GLB usando gltf-pipeline
      console.log('   🔄 Convirtiendo FBX a GLB...');
      await runCommand('npx', [
        'gltf-pipeline',
        '-i', model.input,
        '-o', model.output,
        '--draco.compressionLevel', '10',
        '--draco.quantizePositionBits', '12',
        '--draco.quantizeNormalBits', '8',
        '--draco.quantizeTexcoordBits', '10'
      ]);

      const convertedSize = await getFileSize(model.output);
      console.log(`   ✅ GLB creado: ${convertedSize} KB`);

      // Paso 2: Optimizar más con gltf-transform
      console.log('   🛠️  Optimizando con gltf-transform...');
      await runCommand('npx', [
        'gltf-transform',
        'optimize',
        model.output,
        model.outputOptimized,
        '--compress',
        '--instance',
        '--join',
        '--prune',
        '--dedup',
        '--texture-compress',
        'webp'
      ]);

      const optimizedSize = await getFileSize(model.outputOptimized);
      console.log(`   🎉 Optimizado final: ${optimizedSize} KB`);
      
      const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      console.log(`   📉 Reducción: ${reduction}%\n`);

    } catch (error) {
      console.error(`   ❌ Error procesando ${modelName}:`, error.message);
    }
  }

  console.log('✅ Optimización completada!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Actualiza tu código para usar los archivos .glb optimizados');
  console.log('2. Instala @react-three/drei GLTFLoader si aún no lo tienes');
  console.log('3. Reemplaza FBXLoader por useGLTF en tu código');
}

optimizeModels().catch(console.error);
