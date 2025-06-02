#!/usr/bin/env ts-node

/**
 * Script de migración para generar hash de usuario para registros existentes
 * Este script actualizará todos los registros en Firebase que no tengan userHash
 */

import { FirebaseTrackingService } from '../src/lib/firebaseTrackingService';
import { generateUserHash } from '../src/utils/hashUtils';
import { initializeApp } from 'firebase/app';

// Configuración de Firebase (usar las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function migrateUserHashes() {
  console.log('🔄 Iniciando migración de hash de usuarios...');
  
  try {
    // Inicializar Firebase
    initializeApp(firebaseConfig);
    
    // Obtener todos los trackings
    const trackings = await FirebaseTrackingService.getAllTrackings();
    console.log(`📊 Encontrados ${trackings.length} registros para procesar`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const tracking of trackings) {
      try {
        // Si ya tiene hash, saltar
        if (tracking.userHash) {
          console.log(`⏭️  Saltando ${tracking.nombreUsuario} - ya tiene hash: ${tracking.userHash}`);
          skipped++;
          continue;
        }
        
        // Generar hash
        const userHash = generateUserHash(tracking.nombreUsuario);
        
        // Actualizar el registro
        if (tracking.id) {
          await FirebaseTrackingService.updateTracking(tracking.id, { userHash });
          console.log(`✅ Migrado ${tracking.nombreUsuario} -> ${userHash}`);
          migrated++;
        } else {
          console.log(`❌ Error: ${tracking.nombreUsuario} no tiene ID`);
          errors++;
        }
        
      } catch (error) {
        console.error(`❌ Error procesando ${tracking.nombreUsuario}:`, error);
        errors++;
      }
    }
    
    console.log('\n📋 Resumen de migración:');
    console.log(`✅ Migrados: ${migrated}`);
    console.log(`⏭️  Saltados: ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesados: ${trackings.length}`);
    
    if (errors === 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
    } else {
      console.log('\n⚠️  Migración completada con algunos errores. Revisa los logs arriba.');
    }
    
  } catch (error) {
    console.error('💥 Error fatal durante la migración:', error);
    process.exit(1);
  }
}

// Función de utilidad para mostrar hash de un usuario específico
async function showUserHash(username: string) {
  try {
    const hash = generateUserHash(username);
    console.log(`🔑 Hash para "${username}": ${hash}`);
    console.log(`🔗 URL de seguimiento: /seguimiento/${hash}`);
  } catch (error) {
    console.error('Error generando hash:', error);
  }
}

// Ejecutar el script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--show-hash') {
    if (args[1]) {
      showUserHash(args[1]);
    } else {
      console.log('Uso: npm run migrate:hash -- --show-hash <username>');
      console.log('Ejemplo: npm run migrate:hash -- --show-hash juan_perez');
    }
  } else {
    migrateUserHashes();
  }
}

export { migrateUserHashes, showUserHash };
