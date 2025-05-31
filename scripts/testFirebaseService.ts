import { FirebaseTrackingService } from '../src/lib/firebaseTrackingService';
import { UserTracking, OrderStatus } from '../src/interfaces/tracking';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function testFirebaseService() {
  console.log('🧪 Probando Firebase Tracking Service...\n');

  try {
    // 1. Crear un tracking de ejemplo
    console.log('1️⃣ Creando tracking de ejemplo...');
    const newTracking: UserTracking = {
      nombreUsuario: 'test_firebase_user',
      contacto: 'test@firebase.com',
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      fechaEntrega: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 días
      totalUsd: 175.00,
      abonadoUsd: 50.00,
      envioPagado: false,
      numeroTrackers: 4,
      sensor: 'LSM6DSR',
      magneto: true,
      porcentajes: {
        placa: 25,
        straps: 0,
        cases: 0,
        baterias: 75
      },
      colorCase: 'blue',
      colorTapa: 'yellow',
      paisEnvio: 'MX',
      estadoPedido: OrderStatus.MANUFACTURING
    };

    const trackingId = await FirebaseTrackingService.createTracking(newTracking);
    console.log(`✅ Tracking creado con ID: ${trackingId}\n`);

    // 2. Obtener el tracking por ID
    console.log('2️⃣ Obteniendo tracking por ID...');
    const retrievedTracking = await FirebaseTrackingService.getTrackingById(trackingId);
    console.log('✅ Tracking obtenido:', JSON.stringify(retrievedTracking, null, 2), '\n');

    // 3. Obtener tracking por nombre de usuario
    console.log('3️⃣ Obteniendo tracking por nombre de usuario...');
    const trackingByUsername = await FirebaseTrackingService.getTrackingByUsername('test_firebase_user');
    console.log('✅ Tracking por username:', trackingByUsername?.nombreUsuario, '\n');

    // 4. Actualizar el tracking
    console.log('4️⃣ Actualizando tracking...');
    await FirebaseTrackingService.updateTracking(trackingId, {
      abonadoUsd: 100.00,
      porcentajes: {
        placa: 50,
        straps: 25,
        cases: 25,
        baterias: 100
      }
    });
    console.log('✅ Tracking actualizado\n');

    // 5. Obtener todos los trackings
    console.log('5️⃣ Obteniendo todos los trackings...');
    const allTrackings = await FirebaseTrackingService.getAllTrackings();
    console.log(`✅ Total de trackings: ${allTrackings.length}\n`);

    // 6. Buscar por estado de envío
    console.log('6️⃣ Buscando trackings sin envío pagado...');
    const unpaidShipping = await FirebaseTrackingService.getTrackingsByShippingStatus(false);
    console.log(`✅ Trackings sin envío pagado: ${unpaidShipping.length}\n`);

    // 7. Buscar trackings cerca de fecha límite
    console.log('7️⃣ Buscando trackings con fecha límite próxima...');
    const nearDeadline = await FirebaseTrackingService.getTrackingsNearDeadline(45);
    console.log(`✅ Trackings con fecha límite en 45 días: ${nearDeadline.length}\n`);

    // 8. Eliminar el tracking de prueba
    console.log('8️⃣ Eliminando tracking de prueba...');
    await FirebaseTrackingService.deleteTracking(trackingId);
    console.log('✅ Tracking eliminado\n');

    console.log('🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testFirebaseService()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

export { testFirebaseService };
