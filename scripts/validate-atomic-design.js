#!/usr/bin/env node

/**
 * Script para validar la implementación de Atomic Design
 * Verifica que todos los componentes estén correctamente organizados
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = './src/components';
const EXPECTED_STRUCTURE = {
  atoms: ['Button', 'Input', 'Label', 'Avatar', 'Spinner', 'Badge'],
  molecules: ['SearchBox', 'FormField', 'ProgressSlider', 'Card', 'Alert'],
  organisms: ['Header', 'Footer', 'PricingForm'],
  templates: ['MainLayout', 'AdminLayout']
};

function checkDirectory(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

function validateAtomicStructure() {
  console.log('🔍 Validando estructura de Atomic Design...\n');
  
  let hasErrors = false;
  
  // Verificar estructura principal
  const mainLevels = ['atoms', 'molecules', 'organisms', 'templates'];
  
  for (const level of mainLevels) {
    const levelPath = path.join(COMPONENTS_DIR, level);
    
    if (!checkDirectory(levelPath)) {
      console.error(`❌ Falta directorio: ${levelPath}`);
      hasErrors = true;
      continue;
    }
    
    console.log(`✅ ${level}/ encontrado`);
    
    // Verificar componentes esperados en cada nivel
    const expectedComponents = EXPECTED_STRUCTURE[level] || [];
    
    for (const component of expectedComponents) {
      const componentDir = path.join(levelPath, component);
      const componentFile = path.join(componentDir, `${component}.tsx`);
      const indexFile = path.join(componentDir, 'index.ts');
      
      if (!checkDirectory(componentDir)) {
        console.error(`  ❌ Falta directorio de componente: ${componentDir}`);
        hasErrors = true;
        continue;
      }
      
      if (!checkFile(componentFile)) {
        console.error(`  ❌ Falta archivo principal: ${componentFile}`);
        hasErrors = true;
        continue;
      }
      
      if (!checkFile(indexFile)) {
        console.error(`  ❌ Falta archivo index: ${indexFile}`);
        hasErrors = true;
        continue;
      }
      
      console.log(`  ✅ ${component}`);
    }
    
    // Verificar index.ts del nivel
    const levelIndex = path.join(levelPath, 'index.ts');
    if (!checkFile(levelIndex)) {
      console.error(`  ❌ Falta ${level}/index.ts`);
      hasErrors = true;
    } else {
      console.log(`  ✅ index.ts`);
    }
    
    console.log('');
  }
  
  // Verificar index principal
  const mainIndex = path.join(COMPONENTS_DIR, 'index.ts');
  if (!checkFile(mainIndex)) {
    console.error(`❌ Falta archivo principal: ${mainIndex}`);
    hasErrors = true;
  } else {
    console.log(`✅ components/index.ts encontrado`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.error('❌ La validación encontró errores. Revisa la estructura.');
    process.exit(1);
  } else {
    console.log('🎉 ¡Estructura de Atomic Design validada correctamente!');
    console.log('\n📋 Resumen:');
    console.log(`   • ${EXPECTED_STRUCTURE.atoms.length} Atoms`);
    console.log(`   • ${EXPECTED_STRUCTURE.molecules.length} Molecules`);
    console.log(`   • ${EXPECTED_STRUCTURE.organisms.length} Organisms`);
    console.log(`   • ${EXPECTED_STRUCTURE.templates.length} Templates`);
    console.log('\n🚀 Sistema listo para usar!');
  }
}

function generateComponentStats() {
  console.log('\n📊 Estadísticas del sistema:\n');
  
  const levels = ['atoms', 'molecules', 'organisms', 'templates'];
  
  for (const level of levels) {
    const levelPath = path.join(COMPONENTS_DIR, level);
    
    if (!checkDirectory(levelPath)) {
      continue;
    }
    
    try {
      const components = fs.readdirSync(levelPath)
        .filter(item => {
          const itemPath = path.join(levelPath, item);
          return fs.statSync(itemPath).isDirectory() && item !== 'node_modules';
        });
      
      console.log(`${level.toUpperCase()}:`);
      components.forEach(component => {
        console.log(`  • ${component}`);
      });
      console.log('');
    } catch (error) {
      console.error(`Error leyendo ${level}:`, error.message);
    }
  }
}

// Ejecutar validación
validateAtomicStructure();
generateComponentStats();
