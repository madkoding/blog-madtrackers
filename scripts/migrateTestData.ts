import { FirebaseTrackingService } from '../src/lib/firebaseTrackingService';
import { UserTracking, OrderStatus } from '../src/interfaces/tracking';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

// Mapeo de nombres de archivo a estado de orden
const statusMap: Record<string, OrderStatus> = {
  'test_waiting': OrderStatus.WAITING,
  'test_chile': OrderStatus.MANUFACTURING,
  'test_peru': OrderStatus.MANUFACTURING,
  'test_testing': OrderStatus.TESTING,
  'test_received': OrderStatus.RECEIVED
};

async function migrateTestData() {
  console.log('🔄 Migrando datos de prueba a Firebase...\n');

  const testDataDir = path.join(process.cwd(), 'public', 'data', 'tracking');
  const files = fs.readdirSync(testDataDir).filter(file => file.endsWith('.json'));

  console.log(`📁 Archivos encontrados: ${files.length}`);

  for (const file of files) {
    try {
      const filePath = path.join(testDataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Obtener el nombre base sin extensión
      const basename = path.basename(file, '.json');
      
      // Asignar estado basado en el nombre del archivo
      const estadoPedido = statusMap[basename] || OrderStatus.WAITING;
      
      // Crear objeto UserTracking válido
      const tracking: UserTracking = {
        nombreUsuario: data.nombreUsuario,
        contacto: data.contacto,
        fechaEntrega: data.fechaLimite,
        fechaLimite: data.fechaLimite,
        totalUsd: data.totalUsd,
        abonadoUsd: data.abonadoUsd,
        envioPagado: data.envioPagado,
        numeroTrackers: data.numeroTrackers,
        sensor: data.sensor,
        magneto: data.magneto,
        porcentajes: data.porcentajes,
        colorCase: data.colorCase,
        colorTapa: data.colorTapa,
        paisEnvio: data.paisEnvio,
        estadoPedido: estadoPedido,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };

      console.log(`📝 Migrando: ${tracking.nombreUsuario}...`);
      
      // Verificar si el usuario ya existe
      const existing = await FirebaseTrackingService.getTrackingByUsername(tracking.nombreUsuario);
      if (existing) {
        console.log(`   ⚠️  Usuario ${tracking.nombreUsuario} ya existe, actualizando...`);
        await FirebaseTrackingService.updateTracking(existing.id!, tracking);
        console.log(`   ✅ Usuario ${tracking.nombreUsuario} actualizado`);
      } else {
        const id = await FirebaseTrackingService.createTracking(tracking);
        console.log(`   ✅ Usuario ${tracking.nombreUsuario} creado con ID: ${id}`);
      }

    } catch (error) {
      console.error(`❌ Error migrando ${file}:`, error);
    }
  }

  console.log('\n🎉 Migración completada!');
  
  // Verificar datos migrados
  console.log('\n📋 Verificando datos migrados...');
  const allTrackings = await FirebaseTrackingService.getAllTrackings();
  console.log(`Total de usuarios en Firebase: ${allTrackings.length}`);
  allTrackings.forEach((tracking, index) => {
    console.log(`${index + 1}. ${tracking.nombreUsuario} - ${tracking.paisEnvio} - ${tracking.estadoPedido}`);
  });
}

migrateTestData().catch(console.error);
