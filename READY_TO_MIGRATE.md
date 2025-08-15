# 🚀 SCRIPT DE MIGRACIÓN LISTO - Instrucciones de Uso

## ✅ Test de Migración Completado

El script de migración ha sido probado exitosamente con datos similares a tu esquema actual de Firebase:

```bash
✅ [TEST] Expandido país: "CL" → "Chile"
✅ [TEST] Mapeado sensor: "LSM6DSR" → "ICM45686 + QMC6309"
✅ [TEST] Inferido método de pago: "Flow"
✅ [TEST] Estado de pago: "COMPLETED" (basado en abonadoUsd: 10)
✅ [TEST] Agregada estructura de extras por defecto
```

## 📋 Paso a Paso para Migrar TUS Datos Reales

### 1. **PRIMERO: Simulación (OBLIGATORIO)**

```bash
npm run migrate:trackings
```

Esto ejecutará el script en modo **DRY RUN** y te mostrará:
- Cuántos trackings encontró
- Qué transformaciones hará en cada uno
- Un backup automático
- Ejemplos de los cambios

**⚠️ NO modificará nada en Firebase, solo muestra lo que haría**

### 2. **Revisar la Simulación**

El script te mostrará algo como:

```
📊 [MIGRATION] Encontrados 1 trackings para migrar
💾 [MIGRATION] Backup creado en: backup-trackings-2025-08-14T14-30-00-000Z.json

--- Ejemplo 1: Zelsias ---
ANTES:
  paisEnvio: "CL"
  sensor: "LSM6DSR"
  paymentMethod: undefined
  extrasSeleccionados: undefined

DESPUÉS:
  paisEnvio: "Chile"
  sensor: "ICM45686 + QMC6309"
  paymentMethod: "Flow"
  paymentStatus: "COMPLETED"
  extrasSeleccionados: {"usbReceiver":{"id":"usb_3m","cost":0},...}
```

### 3. **Si Todo Se Ve Bien: Aplicar Migración**

```bash
npm run migrate:trackings:apply
```

Esto ejecutará la migración REAL en Firebase.

### 4. **Verificar Resultados**

Después de la migración, ve a Firebase Console y verifica que tu tracking ahora tenga:

```json
{
  "abonadoUsd": 10,
  "colorCase": "orange",
  "colorTapa": "blue",
  "contacto": "zelsias2000@gmail.com",
  "paisEnvio": "Chile",           // ← Expandido de "CL"
  "sensor": "ICM45686 + QMC6309", // ← Actualizado de "LSM6DSR"
  "paymentMethod": "Flow",         // ← NUEVO
  "paymentTransactionId": "migrated_9pZRdyLUjUmSOl2bvE1j", // ← NUEVO
  "paymentStatus": "COMPLETED",    // ← NUEVO
  "paymentCurrency": "USD",        // ← NUEVO
  "isPendingPayment": false,       // ← NUEVO
  "fechaLimite": "2025-07-05T12:00:00.000Z", // ← NUEVO (copia de fechaEntrega)
  "extrasSeleccionados": {         // ← NUEVO
    "usbReceiver": { "id": "usb_3m", "cost": 0 },
    "strap": { "id": "velcro", "cost": 0 },
    "chargingDock": { "id": "no_dock", "cost": 0 }
  }
  // ... todos los campos existentes se mantienen
}
```

## 🛡️ Características de Seguridad

### ✅ Backup Automático
- Cada ejecución crea un backup con timestamp
- Archivo JSON con todos los datos originales
- Función de rollback disponible

### ✅ Validación por Documento
- Si un tracking falla, continúa con los otros
- Reporte detallado de éxitos vs errores
- No hay pérdida de datos

### ✅ Operaciones Atómicas
- Usa Firestore batch operations
- Hasta 500 documentos por batch
- Transacciones seguras

## 🔍 Lógica de Transformación

### Método de Pago Inferido
```typescript
// Para tu caso (Zelsias):
nombreUsuario: "Zelsias"  
paisEnvio: "CL" → "Chile"
→ paymentMethod: "Flow" ✅

// Si fuera PayPal:
nombreUsuario: "paypal_ABC123"
→ paymentMethod: "PayPal" ✅
```

### Estado de Pago Inferido
```typescript
// Tu caso:
abonadoUsd: 10 (> 0)
→ paymentStatus: "COMPLETED" ✅
→ isPendingPayment: false ✅

// Si no hubiera pagado:
abonadoUsd: 0
→ paymentStatus: "PENDING"
→ isPendingPayment: true
```

## 📁 Archivos Implementados

- ✅ `/scripts/migrateTrackings.ts` - Script principal de migración
- ✅ `/scripts/testMigration.ts` - Test con datos de ejemplo  
- ✅ `MIGRATION_GUIDE.md` - Documentación completa
- ✅ Scripts en `package.json` listos para usar

## 🚨 Importante Antes de Migrar

1. **Ejecuta SIEMPRE la simulación primero**
2. **Revisa los ejemplos de transformación**
3. **Verifica que las inferencias sean correctas**
4. **Guarda el archivo de backup**
5. **Ejecuta en horario de poco tráfico**

## 🎯 Después de la Migración

Una vez migrados los datos, podrás usar los nuevos DTOs sin problemas:

```typescript
// Crear nuevos trackings
await TrackingService.createPayPalPendingTracking(...)
await TrackingService.createFlowPendingTracking(...)

// Actualizar trackings existentes  
await TrackingService.completePayment(...)
await TrackingService.failPayment(...)
```

## 🆘 Si Algo Sale Mal

```bash
# Restaurar desde backup
npx ts-node -e "
import { restoreTrackingBackup } from './scripts/migrateTrackings';
restoreTrackingBackup('./backup-trackings-TIMESTAMP.json');
"
```

---

**¿Listo para migrar?** Ejecuta `npm run migrate:trackings` para empezar con la simulación.
