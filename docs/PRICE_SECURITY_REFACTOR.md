# Seguridad de Precios - Refactorización

Este documento describe los cambios realizados para mover la información sensible de precios del lado del cliente al backend.

## ⚠️ Problema Original

Los precios de sensores y trackers estaban expuestos en el lado del cliente a través de:
- `src/app/constants/product.constants.ts`
- Los datos se enviaban al navegador donde cualquiera podía inspeccionarlos

## ✅ Solución Implementada

### 1. Nueva API de Productos (`/api/products`)

**Archivo:** `src/app/api/products/route.ts`

- **Datos públicos:** Devuelve información de productos SIN precios por defecto
- **Datos internos:** Con `?includePrices=true` devuelve precios (solo para uso interno del servidor)
- **Filtros:** Permite filtrar por tipo de producto (`sensors`, `trackers`, `colors`, `quantities`)

```typescript
// Público (sin precios)
GET /api/products

// Interno (con precios)
GET /api/products?includePrices=true
```

### 2. API de Cálculo de Precios (`/api/pricing/calculate`)

**Archivo:** `src/app/api/pricing/calculate/route.ts`

- Recibe parámetros del producto seleccionado
- Calcula precios en el servidor usando datos privados
- Devuelve precios finales y información de moneda

```typescript
POST /api/pricing/calculate
{
  "sensorId": "sensor1",
  "trackerId": "rf", 
  "quantity": 6,
  "countryCode": "CL"
}
```

### 3. Hook Custom para Precios

**Archivo:** `src/hooks/usePricing.ts`

- Maneja las llamadas a la API de cálculo de precios
- Gestiona estados de carga y errores
- Se actualiza automáticamente cuando cambian los parámetros

### 4. Actualización de Tipos

**Archivo:** `src/app/types.ts`

- Propiedades `price` ahora son opcionales en `Sensor` y `TrackerType`
- Permite compatibilidad entre datos públicos (sin precio) y privados (con precio)

### 5. Componentes Actualizados

#### Componente Principal de Pricing
**Archivo:** `src/app/_components/pricing/pricing.tsx`

- Usa el hook `usePricing` para obtener precios desde el backend
- Ya no calcula precios directamente en el cliente
- Maneja la carga de configuración de país de forma más segura

#### Calculadora Admin
**Archivo:** `src/app/_components/admin/PriceCalculator.tsx`

- Carga datos con precios usando `?includePrices=true` (solo para admin)
- Mantiene cálculos locales para mejor rendimiento en el panel de administración

## 🔒 Beneficios de Seguridad

1. **Precios Ocultos:** Los precios base no están expuestos en el código del cliente
2. **Control Centralizado:** Todos los cálculos se realizan en el servidor
3. **Flexibilidad:** Fácil modificación de precios sin cambios en el frontend
4. **Auditabilidad:** Los cambios de precios se rastrean en el backend

## 📋 Uso

### Para Usuarios Públicos
```javascript
// Los datos automáticamente NO incluyen precios
const response = await fetch('/api/products');
const { sensors, trackers } = await response.json();
// sensors[0].price === undefined ✅
```

### Para Cálculos de Precio
```javascript
import { usePricing } from '@/hooks/usePricing';

const { pricing, loading, error } = usePricing({
  sensorId: 'sensor1',
  trackerId: 'rf',
  quantity: 6,
  countryCode: 'CL'
});

// pricing.prices.totalUsd, pricing.prices.totalLocal, etc.
```

### Para Admin (Componentes Internos)
```javascript
// Solo componentes internos del servidor pueden obtener precios
const response = await fetch('/api/products?includePrices=true');
const { sensors, trackers } = await response.json();
// sensors[0].price !== undefined ✅
```

## 🚀 Próximos Pasos

1. **Autenticación:** Agregar validación de tokens para `?includePrices=true`
2. **Cache:** Implementar cache para cálculos de precios frecuentes
3. **Logging:** Agregar logs de auditoría para cambios de precios
4. **Rate Limiting:** Limitar frecuencia de cálculos de precios por IP

## ⚠️ Notas Importantes

- El endpoint `/api/products?includePrices=true` debe ser protegido en producción
- Los componentes públicos ya no tienen acceso directo a precios
- Los cálculos de precios ahora requieren una llamada al servidor
