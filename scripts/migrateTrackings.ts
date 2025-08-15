/**
 * Script de migración para transformar datos existentes de Firebase
 * al nuevo esquema con DTOs consistentes
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Configuración de Firebase (usar las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Interfaces para la migración
interface LegacyTracking {
  id: string;
  abonadoUsd?: number;
  colorCase: string;
  colorTapa: string;
  contacto: string;
  createdAt: string;
  envioPagado: boolean;
  estadoPedido: string;
  fechaEntrega: string;
  magneto: boolean;
  nombreUsuario: string;
  numeroTrackers: number;
  paisEnvio: string;
  porcentajes: {
    baterias: number;
    cases: number;
    placa: number;
    straps: number;
  };
  sensor: string;
  totalUsd: number;
  updatedAt?: string;
  userHash?: string;
  // Campos que pueden existir ya
  paymentMethod?: string;
  paymentTransactionId?: string;
  paymentStatus?: string;
  extrasSeleccionados?: any;
  shippingAddress?: any;
  vrchatUsername?: string;
  fechaLimite?: string;
}

interface MigratedTracking extends LegacyTracking {
  // Campos nuevos obligatorios
  fechaLimite: string;
  paymentMethod: string;
  paymentTransactionId: string;
  paymentStatus: string;
  paymentCurrency: string;
  isPendingPayment: boolean;
  extrasSeleccionados: {
    usbReceiver: { id: string; cost: number };
    strap: { id: string; cost: number };
    chargingDock: { id: string; cost: number };
  };
}

// Mapeos y conversiones
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  'CL': 'Chile',
  'AR': 'Argentina', 
  'PE': 'Perú',
  'CO': 'Colombia',
  'MX': 'México',
  'ES': 'España',
  'US': 'Estados Unidos',
  'CA': 'Canadá'
};

const SENSOR_MAPPING: Record<string, string> = {
  'LSM6DSR': 'LSM6DSR', // Mantener sensor original
  'LSM6DSR + QMC6309': 'LSM6DSR + QMC6309', // Mantener sensor original
  'ICM45686': 'ICM45686', // Mantener sensor original
  'ICM45686 + QMC6309': 'ICM45686 + QMC6309' // Sensor actual
};

class TrackingMigrationService {

  /**
   * Ejecuta la migración completa
   */
  static async runMigration(dryRun: boolean = true): Promise<void> {
    console.log('🚀 [MIGRATION] Iniciando migración de trackings...');
    console.log(`📋 [MIGRATION] Modo: ${dryRun ? 'DRY RUN (solo simulación)' : 'EJECUCIÓN REAL'}`);
    
    try {
      // 1. Obtener todos los trackings existentes
      const existingTrackings = await this.getAllTrackings();
      console.log(`📊 [MIGRATION] Encontrados ${existingTrackings.length} trackings para migrar`);
      
      if (existingTrackings.length === 0) {
        console.log('✅ [MIGRATION] No hay trackings para migrar');
        return;
      }
      
      // 2. Crear backup antes de migrar
      await this.createBackup(existingTrackings);
      
      // 3. Procesar cada tracking
      const migratedTrackings: MigratedTracking[] = [];
      const errors: Array<{ id: string; error: string }> = [];
      
      for (const tracking of existingTrackings) {
        try {
          const migrated = this.migrateTracking(tracking);
          migratedTrackings.push(migrated);
          console.log(`✅ [MIGRATION] Migrado: ${tracking.nombreUsuario} (${tracking.id})`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          errors.push({ id: tracking.id, error: errorMsg });
          console.error(`❌ [MIGRATION] Error migrando ${tracking.id}: ${errorMsg}`);
        }
      }
      
      // 4. Mostrar resumen
      console.log('\n📋 [MIGRATION] Resumen de migración:');
      console.log(`   ✅ Exitosas: ${migratedTrackings.length}`);
      console.log(`   ❌ Errores: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log('\n❌ [MIGRATION] Errores encontrados:');
        errors.forEach(err => {
          console.log(`   - ${err.id}: ${err.error}`);
        });
      }
      
      // 5. Aplicar cambios si no es dry run
      if (!dryRun && migratedTrackings.length > 0) {
        await this.applyMigration(migratedTrackings);
        console.log('\n✅ [MIGRATION] Migración aplicada exitosamente');
      } else if (dryRun) {
        console.log('\n🔍 [MIGRATION] Simulación completada. Usa runMigration(false) para aplicar cambios');
        // Mostrar algunos ejemplos de migración
        this.showMigrationExamples(existingTrackings, migratedTrackings);
      }
      
    } catch (error) {
      console.error('💥 [MIGRATION] Error fatal durante la migración:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los trackings de Firebase
   */
  private static async getAllTrackings(): Promise<LegacyTracking[]> {
    const trackingsCollection = collection(db, 'user_tracking');
    const snapshot = await getDocs(trackingsCollection);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LegacyTracking[];
  }

  /**
   * Crea un backup de los datos originales
   */
  private static async createBackup(trackings: LegacyTracking[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(process.cwd(), `backup-trackings-${timestamp}.json`);
    
    const backupData = {
      timestamp,
      totalRecords: trackings.length,
      data: trackings
    };
    
    writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`💾 [MIGRATION] Backup creado en: ${backupPath}`);
  }

  /**
   * Migra un tracking individual al nuevo esquema
   */
  private static migrateTracking(legacy: LegacyTracking): MigratedTracking {
    // Mantener todos los campos existentes
    const migrated: MigratedTracking = { ...legacy } as MigratedTracking;
    
    // 1. Asegurar fechaLimite existe
    if (!migrated.fechaLimite) {
      migrated.fechaLimite = legacy.fechaEntrega; // Usar fechaEntrega como fallback
    }
    
    // 2. Expandir código de país si es necesario
    if (legacy.paisEnvio.length === 2) {
      const fullCountryName = COUNTRY_CODE_TO_NAME[legacy.paisEnvio.toUpperCase()];
      if (fullCountryName) {
        migrated.paisEnvio = fullCountryName;
      }
    }
    
    // 3. Mapear sensor si es necesario
    const mappedSensor = SENSOR_MAPPING[legacy.sensor];
    if (mappedSensor) {
      migrated.sensor = mappedSensor;
    }
    
    // 4. Agregar campos de pago si no existen
    if (!migrated.paymentMethod) {
      // Inferir método de pago basado en el contexto
      migrated.paymentMethod = this.inferPaymentMethod(legacy);
    }
    
    if (!migrated.paymentTransactionId) {
      migrated.paymentTransactionId = `migrated_${legacy.id}`;
    }
    
    if (!migrated.paymentStatus) {
      // Si ya pagó algo, considerarlo completado, sino pendiente
      migrated.paymentStatus = (legacy.abonadoUsd || 0) > 0 ? 'COMPLETED' : 'PENDING';
    }
    
    // 5. Agregar paymentCurrency
    migrated.paymentCurrency = 'USD'; // Todos los precios están en USD
    
    // 6. Agregar isPendingPayment
    migrated.isPendingPayment = migrated.paymentStatus === 'PENDING';
    
    // 7. Agregar estructura de extras si no existe
    if (!migrated.extrasSeleccionados) {
      migrated.extrasSeleccionados = {
        usbReceiver: { id: 'usb_3m', cost: 0 },
        strap: { id: 'velcro', cost: 0 },
        chargingDock: { id: 'no_dock', cost: 0 }
      };
    }
    
    // 8. Asegurar que userHash existe
    if (!migrated.userHash) {
      migrated.userHash = this.generateUserHash(legacy.nombreUsuario);
    }
    
    // 9. Migrar estructura de shippingAddress a nuevos campos
    if (legacy.shippingAddress) {
      const oldAddress = legacy.shippingAddress as any;
      migrated.shippingAddress = {
        address: oldAddress.direccion || oldAddress.address,
        cityState: oldAddress.ciudad && oldAddress.estado 
          ? `${oldAddress.ciudad}, ${oldAddress.estado}` 
          : oldAddress.cityState || oldAddress.ciudad || oldAddress.estado,
        country: oldAddress.pais || oldAddress.country
      };
    }
    
    // 10. Actualizar timestamp de migración
    migrated.updatedAt = new Date().toISOString();
    
    return migrated;
  }

  /**
   * Infiere el método de pago basado en el contexto del tracking
   */
  private static inferPaymentMethod(legacy: LegacyTracking): string {
    // Lógica para inferir el método de pago
    // Esto puede basarse en patrones en el nombreUsuario, fechas, etc.
    
    if (legacy.nombreUsuario.startsWith('paypal_')) {
      return 'PayPal';
    }
    
    if (legacy.nombreUsuario.startsWith('flow_')) {
      return 'Flow';
    }
    
    // Para trackings legacy sin patrón claro, asumir método local
    if (legacy.paisEnvio === 'Chile' || legacy.paisEnvio === 'CL') {
      return 'Flow';
    }
    
    // Default para otros países
    return 'PayPal';
  }

  /**
   * Genera un hash de usuario simple para trackings que no lo tienen
   */
  private static generateUserHash(nombreUsuario: string): string {
    // Implementación simple de hash (misma lógica que hashUtils.ts)
    let hash = 0;
    for (let i = 0; i < nombreUsuario.length; i++) {
      const char = nombreUsuario.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  /**
   * Aplica la migración a Firebase
   */
  private static async applyMigration(migratedTrackings: MigratedTracking[]): Promise<void> {
    console.log(`🔄 [MIGRATION] Aplicando migración a ${migratedTrackings.length} trackings...`);
    
    // Usar batch para actualizaciones atómicas
    const batchSize = 500; // Límite de Firestore
    const batches = [];
    
    for (let i = 0; i < migratedTrackings.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchItems = migratedTrackings.slice(i, i + batchSize);
      
      for (const tracking of batchItems) {
        const docRef = doc(db, 'user_tracking', tracking.id);
        const { id, ...dataToUpdate } = tracking; // Excluir id del data
        batch.update(docRef, dataToUpdate);
      }
      
      batches.push(batch);
    }
    
    // Ejecutar todas las batches
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ [MIGRATION] Batch ${i + 1}/${batches.length} aplicada`);
    }
  }

  /**
   * Muestra ejemplos de la migración
   */
  private static showMigrationExamples(original: LegacyTracking[], migrated: MigratedTracking[]): void {
    console.log('\n🔍 [MIGRATION] Ejemplos de migración:');
    
    for (let i = 0; i < Math.min(3, original.length); i++) {
      const orig = original[i];
      const migr = migrated[i];
      
      console.log(`\n--- Ejemplo ${i + 1}: ${orig.nombreUsuario} ---`);
      console.log('ANTES:');
      console.log(`  paisEnvio: "${orig.paisEnvio}"`);
      console.log(`  sensor: "${orig.sensor}"`);
      console.log(`  paymentMethod: ${orig.paymentMethod || 'undefined'}`);
      console.log(`  extrasSeleccionados: ${orig.extrasSeleccionados || 'undefined'}`);
      console.log(`  fechaLimite: ${orig.fechaLimite || 'undefined'}`);
      
      console.log('DESPUÉS:');
      console.log(`  paisEnvio: "${migr.paisEnvio}"`);
      console.log(`  sensor: "${migr.sensor}"`);
      console.log(`  paymentMethod: "${migr.paymentMethod}"`);
      console.log(`  paymentStatus: "${migr.paymentStatus}"`);
      console.log(`  extrasSeleccionados: ${JSON.stringify(migr.extrasSeleccionados)}`);
      console.log(`  fechaLimite: "${migr.fechaLimite}"`);
    }
  }

  /**
   * Restaura desde backup en caso de problemas
   */
  static async restoreFromBackup(backupFilePath: string): Promise<void> {
    console.log(`🔄 [MIGRATION] Restaurando desde backup: ${backupFilePath}`);
    
    if (!existsSync(backupFilePath)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFilePath}`);
    }
    
    const backupData = JSON.parse(require('fs').readFileSync(backupFilePath, 'utf8'));
    const trackings: LegacyTracking[] = backupData.data;
    
    console.log(`📊 [MIGRATION] Restaurando ${trackings.length} registros...`);
    
    // Usar batch para restauración
    const batchSize = 500;
    for (let i = 0; i < trackings.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchItems = trackings.slice(i, i + batchSize);
      
      for (const tracking of batchItems) {
        const docRef = doc(db, 'user_tracking', tracking.id);
        const { id, ...dataToRestore } = tracking;
        batch.set(docRef, dataToRestore);
      }
      
      await batch.commit();
      console.log(`✅ [MIGRATION] Batch de restauración ${Math.floor(i/batchSize) + 1} aplicada`);
    }
    
    console.log('✅ [MIGRATION] Restauración completada');
  }
}

// Funciones de utilidad para ejecutar la migración
export async function runTrackingMigration(dryRun: boolean = true): Promise<void> {
  return TrackingMigrationService.runMigration(dryRun);
}

export async function restoreTrackingBackup(backupFilePath: string): Promise<void> {
  return TrackingMigrationService.restoreFromBackup(backupFilePath);
}

// Si se ejecuta directamente
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
  
  console.log('🚀 Ejecutando migración de trackings...');
  console.log(`Modo: ${isDryRun ? 'DRY RUN' : 'APLICAR CAMBIOS'}`);
  console.log('Para aplicar cambios reales, usa: npm run migrate-trackings --apply');
  
  runTrackingMigration(isDryRun)
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}
