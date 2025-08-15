# 🔄 Migración de Trackings Existentes a DTOs

## 📋 Problema Identificado

Los trackings existentes en Firebase tienen el siguiente esquema:

```json
{
  "abonadoUsd": 10,
  "colorCase": "orange",
  "colorTapa": "blue", 
  "contacto": "zelsias2000@gmail.com",
  "createdAt": "2025-06-09T00:32:21.745Z",
  "envioPagado": false,
  "estadoPedido": "manufacturing",
  "fechaEntrega": "2025-07-05T12:00:00.000Z",
  "id": "9pZRdyLUjUmSOl2bvE1j",
  "magneto": false,
  "nombreUsuario": "Zelsias",
  "numeroTrackers": 6,
  "paisEnvio": "CL",
  "porcentajes": {
    "baterias": 50,
    "cases": 100,
    "placa": 50,
    "straps": 50
  },
  "sensor": "LSM6DSR",
  "totalUsd": 10,
  "updatedAt": "2025-07-27T18:08:38.644Z",
  "userHash": "7dca4f0c5da3c0d5"
}
```

## ❌ Campos Faltantes para DTOs

Para que funcionen con los nuevos DTOs, necesitan:

1. **Campos de pago obligatorios**:
   - `paymentMethod`
   - `paymentTransactionId` 
   - `paymentStatus`
   - `paymentCurrency`
   - `isPendingPayment`

2. **Estructura de extras**:
   - `extrasSeleccionados` con USB, strap y charging dock

3. **Campos opcionales**:
   - `fechaLimite` (actualmente solo tienen `fechaEntrega`)
   - `shippingAddress`
   - `vrchatUsername`

4. **Conversiones necesarias**:
   - `paisEnvio: "CL"` → `"Chile"`
   - `sensor: "LSM6DSR"` → `"ICM45686 + QMC6309"` (sensor actual)

## ✅ Solución: Script de Migración

### Script Implementado: `/scripts/migrateTrackings.ts`

El script realiza las siguientes transformaciones:

```typescript
// ANTES (esquema actual)
{
  paisEnvio: "CL",
  sensor: "LSM6DSR",
  paymentMethod: undefined,
  extrasSeleccionados: undefined,
  fechaLimite: undefined
}

// DESPUÉS (esquema migrado)
{
  paisEnvio: "Chile",
  sensor: "ICM45686 + QMC6309", 
  paymentMethod: "Flow", // Inferido por país
  paymentTransactionId: "migrated_9pZRdyLUjUmSOl2bvE1j",
  paymentStatus: "COMPLETED", // Basado en abonadoUsd > 0
  paymentCurrency: "USD",
  isPendingPayment: false,
  extrasSeleccionados: {
    usbReceiver: { id: "usb_3m", cost: 0 },
    strap: { id: "velcro", cost: 0 },
    chargingDock: { id: "no_dock", cost: 0 }
  },
  fechaLimite: "2025-07-05T12:00:00.000Z" // Copia de fechaEntrega
}
```

### Características del Script

1. **🛡️ Modo Seguro**: 
   - Por defecto ejecuta en modo `DRY RUN` (solo simulación)
   - Crea backup automático antes de aplicar cambios
   - Permite rollback completo

2. **🔍 Inferencia Inteligente**:
   - **Método de pago**: Basado en país y patrones de `nombreUsuario`
   - **Estado de pago**: `COMPLETED` si `abonadoUsd > 0`, sino `PENDING`
   - **Conversión de países**: `CL` → `Chile`, `AR` → `Argentina`, etc.
   - **Mapeo de sensores**: `LSM6DSR` → `ICM45686 + QMC6309`

3. **📊 Reporting Completo**:
   - Muestra ejemplos de transformaciones
   - Cuenta exitosos vs errores
   - Logs detallados de cada cambio

4. **⚡ Eficiente**:
   - Usa batch operations de Firestore
   - Procesa hasta 500 documentos por batch
   - Manejo de errores individual por documento

## 🚀 Uso del Script

### 1. Simulación (Recomendado primero)

```bash
# Ejecutar simulación para ver qué cambios se harían
npm run migrate:trackings

# O directamente:
npx ts-node --project tsconfig.scripts.json scripts/migrateTrackings.ts --dry-run
```

**Salida esperada:**
```
🚀 [MIGRATION] Iniciando migración de trackings...
📋 [MIGRATION] Modo: DRY RUN (solo simulación)
📊 [MIGRATION] Encontrados 1 trackings para migrar
💾 [MIGRATION] Backup creado en: backup-trackings-2025-08-14T09-30-00-000Z.json
✅ [MIGRATION] Migrado: Zelsias (9pZRdyLUjUmSOl2bvE1j)

📋 [MIGRATION] Resumen de migración:
   ✅ Exitosas: 1
   ❌ Errores: 0

🔍 [MIGRATION] Ejemplos de migración:

--- Ejemplo 1: Zelsias ---
ANTES:
  paisEnvio: "CL"
  sensor: "LSM6DSR"
  paymentMethod: undefined
  extrasSeleccionados: undefined
  fechaLimite: undefined

DESPUÉS:
  paisEnvio: "Chile"
  sensor: "ICM45686 + QMC6309"
  paymentMethod: "Flow"
  paymentStatus: "COMPLETED"
  extrasSeleccionados: {"usbReceiver":{"id":"usb_3m","cost":0},...}
  fechaLimite: "2025-07-05T12:00:00.000Z"

🔍 [MIGRATION] Simulación completada. Usa runMigration(false) para aplicar cambios
```

### 2. Aplicación Real (Solo después de verificar)

```bash
# IMPORTANTE: Solo ejecutar después de verificar la simulación
npm run migrate:trackings:apply

# O directamente:
npx ts-node --project tsconfig.scripts.json scripts/migrateTrackings.ts --apply
```

### 3. Rollback si hay problemas

```bash
# Si algo sale mal, restaurar desde backup
npx ts-node -e "
import { restoreTrackingBackup } from './scripts/migrateTrackings';
restoreTrackingBackup('./backup-trackings-2025-08-14T09-30-00-000Z.json');
"
```

## 🔍 Lógica de Inferencia

### Método de Pago
```typescript
// Si nombreUsuario tiene patrón específico
if (nombreUsuario.startsWith('paypal_')) return 'PayPal';
if (nombreUsuario.startsWith('flow_')) return 'Flow';

// Si no, basado en país
if (paisEnvio === 'Chile' || paisEnvio === 'CL') return 'Flow';
return 'PayPal'; // Default para otros países
```

### Estado de Pago
```typescript
// Si ya pagó algo, considerarlo completado
paymentStatus = (abonadoUsd || 0) > 0 ? 'COMPLETED' : 'PENDING';
isPendingPayment = paymentStatus === 'PENDING';
```

### Conversión de Países
```typescript
const COUNTRY_MAPPING = {
  'CL': 'Chile',
  'AR': 'Argentina', 
  'PE': 'Perú',
  'CO': 'Colombia',
  'MX': 'México',
  'ES': 'España'
  // ... más países según necesidad
};
```

## 🛡️ Seguridad y Validación

1. **Backup Automático**: Cada ejecución crea backup con timestamp
2. **Validación de Datos**: Verifica que campos requeridos existan
3. **Manejo de Errores**: Continúa con otros registros si uno falla
4. **Operaciones Atómicas**: Usa Firestore batch operations
5. **Rollback Completo**: Función de restauración desde backup

## 📋 Checklist de Migración

- [ ] 1. **Ejecutar simulación** con `npm run migrate:trackings`
- [ ] 2. **Revisar ejemplos** mostrados en la simulación
- [ ] 3. **Verificar transformaciones** son correctas
- [ ] 4. **Confirmar backup** se creó correctamente
- [ ] 5. **Aplicar migración** con `npm run migrate:trackings:apply`
- [ ] 6. **Verificar resultados** en Firebase Console
- [ ] 7. **Probar funcionalidad** con nuevos DTOs
- [ ] 8. **Mantener backup** por seguridad

## 🚨 Importante

- **SIEMPRE ejecutar simulación primero**
- **Verificar los ejemplos de transformación**
- **Mantener los archivos de backup**
- **Probar en un entorno de desarrollo primero**
- **Ejecutar durante horarios de poco tráfico**

Una vez ejecutada la migración, todos los trackings serán compatibles con los nuevos DTOs y el sistema TrackingService funcionará correctamente.
