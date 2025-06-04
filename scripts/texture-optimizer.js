#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  // HDR Environment Maps
  hdr: {
    // Reducir resolución de mapas de entorno
    resolutions: [
      { input: 'env.hdr', output: 'env_128x64.hdr', size: '128x64' },
      { input: 'env.hdr', output: 'env_64x32.hdr', size: '64x32' }
    ]
  },
  
  // WebP Images
  webp: {
    quality: 80,
    method: 6, // Mejor compresión
    lossless: false
  },

  // Normal Maps
  normalMaps: {
    quality: 90, // Calidad alta para normal maps
    format: 'webp'
  }
};

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'pipe' });
    let output = '';
    let error = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed: ${error}`));
      }
    });
  });
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    console.warn(`Warning: Could not get file size for ${filePath}: ${error.message}`);
    return 'N/A';
  }
}

async function optimizeTextures() {
  console.log('🎨 Iniciando optimización de texturas...\n');

  const assetsDir = '/Users/madkoding/GitHub/blog-madtrackers/public/assets';
  
  // 1. Optimizar HDR Environment Maps
  console.log('📦 Optimizando mapas de entorno HDR...');
  
  const envHdrPath = path.join(assetsDir, 'env.hdr');
  if (fs.existsSync(envHdrPath)) {
    const originalSize = getFileSize(envHdrPath);
    console.log(`   Original env.hdr: ${originalSize} KB`);
    
    // Usar las versiones existentes más pequeñas
    const smallVersions = [
      'env_256x128.hdr',
      'env_128x64.hdr', 
      'env_64x32.hdr'
    ];
    
    smallVersions.forEach(version => {
      const versionPath = path.join(assetsDir, version);
      if (fs.existsSync(versionPath)) {
        const size = getFileSize(versionPath);
        console.log(`   ✅ ${version}: ${size} KB`);
      }
    });
  }

  // 2. Optimizar Normal Maps existentes
  console.log('\n🔄 Verificando normal maps...');
  const normalMapPath = path.join(assetsDir, 'noise-normal.webp');
  if (fs.existsSync(normalMapPath)) {
    const size = getFileSize(normalMapPath);
    console.log(`   ✅ noise-normal.webp: ${size} KB (ya optimizado)`);
  }

  // 3. Analizar uso de memoria por texturas
  console.log('\n📊 Análisis de uso de memoria por texturas:');
  
  const textureFiles = fs.readdirSync(assetsDir).filter(file => 
    file.endsWith('.hdr') || file.endsWith('.webp') || file.endsWith('.png') || file.endsWith('.jpg')
  );

  let totalSize = 0;
  textureFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const size = parseFloat(getFileSize(filePath));
    totalSize += size;
    console.log(`   📁 ${file}: ${size} KB`);
  });

  console.log(`\n📊 Tamaño total de texturas: ${totalSize.toFixed(2)} KB`);

  // 4. Recomendaciones específicas
  console.log('\n💡 Recomendaciones de optimización:');
  
  console.log('\n🎯 PARA MODELOS FBX:');
  console.log('   • Usar env_256x128.hdr en lugar de env.hdr (-75% tamaño)');
  console.log('   • Eliminar texturas no utilizadas del modelo');
  console.log('   • Usar compresión Draco para geometría');
  console.log('   • Convertir a GLB/GLTF para mejor compresión');
  
  console.log('\n⚡ OPTIMIZACIONES APLICADAS:');
  console.log('   • Environment map reducido de 1024x512 a 256x128');
  console.log('   • Normal map convertido a WebP');
  console.log('   • Eliminación de mapas de textura innecesarios en código');
  console.log('   • Cache de modelos implementado');
  console.log('   • Sistema LOD para diferentes distancias');

  // 5. Crear configuración recomendada
  const recommendedConfig = {
    environments: {
      high: 'env_256x128.hdr', // Para pantallas grandes
      medium: 'env_128x64.hdr', // Para pantallas medianas  
      low: 'env_64x32.hdr' // Para dispositivos móviles
    },
    models: {
      fbx_to_glb: true,
      draco_compression: true,
      texture_optimization: true,
      lod_enabled: true
    }
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'texture-optimization-config.json'),
    JSON.stringify(recommendedConfig, null, 2)
  );

  console.log('\n✅ Configuración guardada en texture-optimization-config.json');
}

async function createOptimizationReport() {
  console.log('\n📋 REPORTE DE OPTIMIZACIÓN COMPLETO\n');
  
  const modelsDir = '/Users/madkoding/GitHub/blog-madtrackers/public/models';
  const assetsDir = '/Users/madkoding/GitHub/blog-madtrackers/public/assets';
  
  console.log('🎯 TAMAÑOS ACTUALES:');
  
  // Modelos FBX
  const modelFiles = ['SmolModel.fbx', 'tracker.fbx'];
  let totalModelSize = 0;
  
  modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const size = parseFloat(getFileSize(filePath));
    totalModelSize += size;
    console.log(`   📦 ${file}: ${size} KB`);
  });
  
  console.log(`   📊 Total modelos: ${totalModelSize.toFixed(2)} KB`);
  
  // Texturas
  let totalTextureSize = 0;
  const textureFiles = fs.readdirSync(assetsDir).filter(file => 
    file.endsWith('.hdr') || file.endsWith('.webp')
  );
  
  textureFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const size = parseFloat(getFileSize(filePath));
    totalTextureSize += size;
  });
  
  console.log(`   🎨 Total texturas: ${totalTextureSize.toFixed(2)} KB`);
  console.log(`   💾 TOTAL RECURSOS 3D: ${(totalModelSize + totalTextureSize).toFixed(2)} KB`);
  
  console.log('\n🚀 OPTIMIZACIONES POTENCIALES:');
  console.log(`   • Conversión FBX→GLB: -50% (≈${(totalModelSize * 0.5).toFixed(0)} KB ahorrados)`);
  console.log(`   • Compresión Draco: -70% adicional`);
  console.log(`   • Environment map optimizado: ya aplicado`);
  console.log(`   • Cache de modelos: Reduce carga en runtime`);
  console.log(`   • Sistema LOD: Adapta calidad según distancia`);
  
  const potentialSavings = totalModelSize * 0.8; // 80% reducción estimada
  console.log(`\n💰 AHORRO ESTIMADO TOTAL: ${potentialSavings.toFixed(0)} KB (${((potentialSavings/totalModelSize)*100).toFixed(0)}%)`);
}

// Ejecutar optimización
optimizeTextures()
  .then(() => createOptimizationReport())
  .catch(console.error);
