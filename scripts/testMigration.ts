/**
 * Test de migración con datos de ejemplo
 * Permite verificar la lógica de transformación sin tocar Firebase
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Datos de ejemplo basados en el esquema actual
const SAMPLE_LEGACY_TRACKING = {
  id: "9pZRdyLUjUmSOl2bvE1j",
  abonadoUsd: 10,
  colorCase: "orange",
  colorTapa: "blue",
  contacto: "zelsias2000@gmail.com",
  createdAt: "2025-06-09T00:32:21.745Z",
  envioPagado: false,
  estadoPedido: "manufacturing",
  fechaEntrega: "2025-07-05T12:00:00.000Z",
  magneto: false,
  nombreUsuario: "Zelsias",
  numeroTrackers: 6,
  paisEnvio: "CL",
  porcentajes: {
    baterias: 50,
    cases: 100,
    placa: 50,
    straps: 50
  },
  sensor: "LSM6DSR",
  totalUsd: 10,
  updatedAt: "2025-07-27T18:08:38.644Z",
  userHash: "7dca4f0c5da3c0d5",
  // Dirección con estructura antigua para probar migración
  shippingAddress: {
    direccion: "Av. Las Condes 123",
    ciudad: "Santiago",
    estado: "Región Metropolitana",
    pais: "Chile"
  }
};

// Mapeos (copiados del script principal para testing)
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

function inferPaymentMethod(legacy: any): string {
  if (legacy.nombreUsuario.startsWith('paypal_')) {
    return 'PayPal';
  }
  
  if (legacy.nombreUsuario.startsWith('flow_')) {
    return 'Flow';
  }
  
  if (legacy.paisEnvio === 'Chile' || legacy.paisEnvio === 'CL') {
    return 'Flow';
  }
  
  return 'PayPal';
}

function generateUserHash(nombreUsuario: string): string {
  let hash = 0;
  for (let i = 0; i < nombreUsuario.length; i++) {
    const char = nombreUsuario.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

function testMigration(legacy: any) {
  console.log('🧪 [TEST] Iniciando test de migración...\n');
  
  // Mostrar datos originales
  console.log('📋 [TEST] DATOS ORIGINALES:');
  console.log(JSON.stringify(legacy, null, 2));
  
  // Aplicar lógica de migración
  const migrated = { ...legacy };
  
  // 1. fechaLimite
  if (!migrated.fechaLimite) {
    migrated.fechaLimite = legacy.fechaEntrega;
    console.log('\n✅ [TEST] Agregado fechaLimite desde fechaEntrega');
  }
  
  // 2. Expandir código de país
  if (legacy.paisEnvio.length === 2) {
    const fullCountryName = COUNTRY_CODE_TO_NAME[legacy.paisEnvio.toUpperCase()];
    if (fullCountryName) {
      migrated.paisEnvio = fullCountryName;
      console.log(`✅ [TEST] Expandido país: "${legacy.paisEnvio}" → "${fullCountryName}"`);
    }
  }
  
  // 3. Mapear sensor
  const mappedSensor = SENSOR_MAPPING[legacy.sensor];
  if (mappedSensor) {
    migrated.sensor = mappedSensor;
    console.log(`✅ [TEST] Mapeado sensor: "${legacy.sensor}" → "${mappedSensor}"`);
  }
  
  // 4. Campos de pago
  migrated.paymentMethod = inferPaymentMethod(legacy);
  migrated.paymentTransactionId = `migrated_${legacy.id}`;
  migrated.paymentStatus = (legacy.abonadoUsd || 0) > 0 ? 'COMPLETED' : 'PENDING';
  migrated.paymentCurrency = 'USD';
  migrated.isPendingPayment = migrated.paymentStatus === 'PENDING';
  
  console.log(`✅ [TEST] Inferido método de pago: "${migrated.paymentMethod}"`);
  console.log(`✅ [TEST] Estado de pago: "${migrated.paymentStatus}" (basado en abonadoUsd: ${legacy.abonadoUsd})`);
  
  // 5. Estructura de extras
  migrated.extrasSeleccionados = {
    usbReceiver: { id: 'usb_3m', cost: 0 },
    strap: { id: 'velcro', cost: 0 },
    chargingDock: { id: 'no_dock', cost: 0 }
  };
  console.log('✅ [TEST] Agregada estructura de extras por defecto');
  
  // 6. Migrar estructura de shippingAddress si existe
  if (legacy.shippingAddress) {
    const oldAddress = legacy.shippingAddress as any;
    migrated.shippingAddress = {
      address: oldAddress.direccion || oldAddress.address,
      cityState: oldAddress.ciudad && oldAddress.estado 
        ? `${oldAddress.ciudad}, ${oldAddress.estado}` 
        : oldAddress.cityState || oldAddress.ciudad || oldAddress.estado,
      country: oldAddress.pais || oldAddress.country
    };
    console.log('✅ [TEST] Migrada estructura de shippingAddress a nuevos campos');
  }
  
  // 7. userHash si no existe
  if (!migrated.userHash) {
    migrated.userHash = generateUserHash(legacy.nombreUsuario);
    console.log(`✅ [TEST] Generado userHash: "${migrated.userHash}"`);
  }
  
  // 8. Timestamp
  migrated.updatedAt = new Date().toISOString();
  console.log('✅ [TEST] Actualizado timestamp de migración');
  
  // Mostrar comparación detallada
  console.log('\n📋 [TEST] DATOS ORIGINALES:');
  console.log(`  ID: ${legacy.id || 'N/A'}`);
  console.log(`  Nombre Usuario: ${legacy.nombreUsuario || 'N/A'}`);
  console.log(`  Email: ${legacy.email || 'N/A'}`);
  console.log(`  País Envío: ${legacy.paisEnvio || 'N/A'}`);
  console.log(`  Total: $${legacy.total || 0} | Total USD: $${legacy.totalUsd || 0}`);
  console.log(`  Abonado: $${legacy.abonado || 0} | Abonado USD: $${legacy.abonadoUsd || 0}`);
  console.log(`  Número Trackers: ${legacy.numeroTrackers || 0}`);
  console.log(`  Sensor: ${legacy.sensor || 'N/A'}`);
  console.log(`  Magneto: ${legacy.magneto !== undefined ? legacy.magneto : 'N/A'}`);
  console.log(`  Color Case: ${legacy.colorCase || 'N/A'}`);
  console.log(`  Color Tapa: ${legacy.colorTapa || 'N/A'}`);
  console.log(`  Estado Pedido: ${legacy.estadoPedido || 'N/A'}`);
  console.log(`  Método de Pago: ${legacy.paymentMethod || 'N/A'}`);
  console.log(`  Estado de Pago: ${legacy.paymentStatus || 'N/A'}`);
  console.log(`  PayPal Transaction ID: ${legacy.paypalTransactionId || 'N/A'}`);
  console.log(`  Flow Order: ${legacy.paymentFlowOrder || 'N/A'}`);
  console.log(`  Fecha Límite: ${legacy.fechaLimite || 'N/A'}`);
  console.log(`  User Hash: ${legacy.userHash || 'N/A'}`);
  console.log(`  Extras Seleccionados: ${legacy.extrasSeleccionados ? JSON.stringify(legacy.extrasSeleccionados, null, 2) : 'N/A'}`);
  console.log(`  Shipping Address: ${legacy.shippingAddress ? JSON.stringify(legacy.shippingAddress, null, 2) : 'N/A'}`);
  console.log(`  VRChat Username: ${legacy.vrchatUsername || 'N/A'}`);
  
  console.log('\n✅ [TEST] DATOS MIGRADOS:');
  console.log(`  ID: ${migrated.id}`);
  console.log(`  Nombre Usuario: ${migrated.nombreUsuario}`);
  console.log(`  Contacto: ${migrated.contacto}`);
  console.log(`  País Envío: ${migrated.paisEnvio}`);
  console.log(`  Total USD: $${migrated.totalUsd}`);
  console.log(`  Abonado USD: $${migrated.abonadoUsd}`);
  console.log(`  Envío Pagado: ${migrated.envioPagado}`);
  console.log(`  Número Trackers: ${migrated.numeroTrackers}`);
  console.log(`  Sensor: ${migrated.sensor}`);
  console.log(`  Magneto: ${migrated.magneto}`);
  console.log(`  Color Case: ${migrated.colorCase}`);
  console.log(`  Color Tapa: ${migrated.colorTapa}`);
  console.log(`  Estado Pedido: ${migrated.estadoPedido}`);
  console.log(`  Fecha Entrega: ${migrated.fechaEntrega}`);
  console.log(`  Fecha Límite: ${migrated.fechaLimite}`);
  console.log(`  User Hash: ${migrated.userHash}`);
  console.log(`  Payment Method: ${migrated.paymentMethod}`);
  console.log(`  Payment Status: ${migrated.paymentStatus}`);
  console.log(`  Payment Transaction ID: ${migrated.paymentTransactionId}`);
  console.log(`  Payment Amount: ${migrated.paymentAmount || 'N/A'}`);
  console.log(`  Payment Currency: ${migrated.paymentCurrency || 'N/A'}`);
  console.log(`  PayPal Transaction ID: ${migrated.paypalTransactionId || 'N/A'}`);
  console.log(`  Flow Order: ${migrated.paymentFlowOrder || 'N/A'}`);
  console.log(`  Is Pending Payment: ${migrated.isPendingPayment}`);
  console.log(`  VRChat Username: ${migrated.vrchatUsername || 'N/A'}`);
  console.log(`  Extras Seleccionados: ${JSON.stringify(migrated.extrasSeleccionados, null, 2)}`);
  console.log(`  Shipping Address: ${JSON.stringify(migrated.shippingAddress, null, 2)}`);
  console.log(`  Porcentajes: ${JSON.stringify(migrated.porcentajes, null, 2)}`);
  console.log(`  Created At: ${migrated.createdAt}`);
  console.log(`  Updated At: ${migrated.updatedAt}`);
  
  // Tabla de cambios importantes
  console.log('\n🔍 [TEST] CAMBIOS PRINCIPALES:');
  console.log('┌─────────────────────┬─────────────────────┬─────────────────────┐');
  console.log('│ Campo               │ Antes               │ Después             │');
  console.log('├─────────────────────┼─────────────────────┼─────────────────────┤');
  const paisAntes = (legacy.paisEnvio || 'N/A').substring(0,19).padEnd(19);
  const paisDespues = migrated.paisEnvio.substring(0,19).padEnd(19);
  console.log(`│ paisEnvio           │ ${paisAntes} │ ${paisDespues} │`);
  const sensorAntes = (legacy.sensor || 'N/A').substring(0,19).padEnd(19);
  const sensorDespues = migrated.sensor.substring(0,19).padEnd(19);
  console.log(`│ sensor              │ ${sensorAntes} │ ${sensorDespues} │`);
  const totalAntes = (`$${legacy.totalUsd || legacy.total || 0} USD`).substring(0,19).padEnd(19);
  const totalDespues = (`$${migrated.totalUsd} USD`).substring(0,19).padEnd(19);
  console.log(`│ totalUsd            │ ${totalAntes} │ ${totalDespues} │`);
  const abonadoAntes = (`$${legacy.abonadoUsd || legacy.abonado || 0} USD`).substring(0,19).padEnd(19);
  const abonadoDespues = (`$${migrated.abonadoUsd} USD`).substring(0,19).padEnd(19);
  console.log(`│ abonadoUsd          │ ${abonadoAntes} │ ${abonadoDespues} │`);
  const currencyAntes = (legacy.paymentCurrency || 'undefined').substring(0,19).padEnd(19);
  const currencyDespues = (migrated.paymentCurrency || 'N/A').substring(0,19).padEnd(19);
  console.log(`│ paymentCurrency     │ ${currencyAntes} │ ${currencyDespues} │`);
  const payMethodAntes = (legacy.paymentMethod || 'undefined').substring(0,19).padEnd(19);
  const payMethodDespues = migrated.paymentMethod.substring(0,19).padEnd(19);
  console.log(`│ paymentMethod       │ ${payMethodAntes} │ ${payMethodDespues} │`);
  const payStatusAntes = (legacy.paymentStatus || 'undefined').substring(0,19).padEnd(19);
  const payStatusDespues = migrated.paymentStatus.substring(0,19).padEnd(19);
  console.log(`│ paymentStatus       │ ${payStatusAntes} │ ${payStatusDespues} │`);
  const fechaAntes = (legacy.fechaLimite || 'undefined').substring(0,19).padEnd(19);
  const fechaDespues = migrated.fechaLimite.substring(0,19).padEnd(19);
  console.log(`│ fechaLimite         │ ${fechaAntes} │ ${fechaDespues} │`);
  const extrasAntes = (legacy.extrasSeleccionados ? '[object]' : 'undefined').padEnd(19);
  const extrasDespues = '[object]'.padEnd(19);
  console.log(`│ extrasSeleccionados │ ${extrasAntes} │ ${extrasDespues} │`);
  console.log('└─────────────────────┴─────────────────────┴─────────────────────┘');
  
  // Guardar resultado para inspección
  const outputPath = join(process.cwd(), 'migration-test-result.json');
  writeFileSync(outputPath, JSON.stringify({
    original: legacy,
    migrated: migrated,
    changes: {
      paisEnvio: { from: legacy.paisEnvio, to: migrated.paisEnvio },
      sensor: { from: legacy.sensor, to: migrated.sensor },
      paymentMethod: { from: legacy.paymentMethod || null, to: migrated.paymentMethod },
      paymentStatus: { from: legacy.paymentStatus || null, to: migrated.paymentStatus },
      fechaLimite: { from: legacy.fechaLimite || null, to: migrated.fechaLimite }
    }
  }, null, 2));
  
  console.log(`\n💾 [TEST] Resultado guardado en: ${outputPath}`);
  console.log('\n✅ [TEST] Test de migración completado');
  
  return migrated;
}

// Ejecutar test con diferentes casos
console.log('🧪 Testing Migration Logic\n');

// Caso 1: Tracking típico chileno
console.log('='.repeat(80));
console.log('CASO 1: Tracking típico chileno (como tu ejemplo)');
console.log('='.repeat(80));
testMigration(SAMPLE_LEGACY_TRACKING);

// Caso 2: Tracking de PayPal
console.log('\n' + '='.repeat(80));
console.log('CASO 2: Tracking con patrón PayPal');
console.log('='.repeat(80));
const paypalTracking = {
  ...SAMPLE_LEGACY_TRACKING,
  id: "paypal_example",
  nombreUsuario: "paypal_ABC123",
  paisEnvio: "ES",
  abonadoUsd: 0 // Pago pendiente
};
testMigration(paypalTracking);

// Caso 3: Tracking argentino
console.log('\n' + '='.repeat(80));
console.log('CASO 3: Tracking argentino');
console.log('='.repeat(80));
const argentineTracking = {
  ...SAMPLE_LEGACY_TRACKING,
  id: "ar_example",
  nombreUsuario: "UsuarioArgentino",
  paisEnvio: "AR",
  sensor: "ICM45686 + QMC6309", // Ya correcto
  userHash: undefined // Necesita generación
};
testMigration(argentineTracking);

console.log('\n🎉 Todos los tests completados. Revisa migration-test-result.json para detalles.');
