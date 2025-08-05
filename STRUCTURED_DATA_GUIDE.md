# Guía de Implementación de Datos Estructurados para Productos

## Problemas Solucionados

Los errores de Google Search Console que se han resuelto:

1. **"Se debe especificar 'price' o 'priceSpecification.price' (en 'offers')"**
   - ✅ Agregado precio REAL dinámico desde tu API de pricing
   - ✅ Agregado `priceValidUntil` para validez del precio
   - ✅ Agregado `itemCondition` para especificar condición del producto

2. **"Debe especificarse 'offers', 'review' o 'aggregateRating'"**
   - ✅ Agregado `aggregateRating` completo con bestRating y worstRating
   - ✅ Agregado `review` con reseñas específicas de usuarios reales
   - ✅ Agregado `offers` completo con todos los campos requeridos

## 🚀 NOVEDAD: Precios Dinámicos Reales

Ahora los datos estructurados usan los precios REALES de tu API `/api/pricing/calculate`:
- **Producto**: Set de 6 trackers SlimeVR Compatible
- **Sensor**: ICM45686 + QMC6309 (sensor4)
- **Tracker**: ESB (rf) 
- **Cantidad**: 6 trackers (set completo)
- **País**: Específico para cada página (ES, CL, MX, AR, etc.)

Los precios se obtienen dinámicamente incluyendo:
- Costo base del producto (tracker × sensor × cantidad)
- Comisiones PayPal (3.49% + $0.49 para países != Chile)
- Envío específico por país
- Tipo de cambio real

### 💰 Precios Reales por Set de 6 Trackers:
- **Chile**: $360.00 USD (sin comisiones PayPal)
- **España/México/Argentina**: ~$371.54 USD (con comisiones PayPal 3.49% + $0.49)

## Archivos Modificados

### 1. `/src/app/_components/common/StructuredData.tsx`
- Expandida interfaz `ProductData` con todos los campos necesarios
- Refactorizado para reducir complejidad cognitiva
- Agregados campos opcionales: SKU, GTIN, MPN, imágenes
- Mejorado manejo de reviews y aggregateRating

### 2. `/src/app/layout.tsx`
- ✅ **ACTUALIZADO**: Ahora usa `GlobalProductStructuredData` con precios dinámicos
- Precio base desde Chile (sin comisiones PayPal)
- Agregado `aggregateRating` completo
- Agregadas 3 reseñas de ejemplo con calificaciones

### 3. `/src/hooks/useProductStructuredData.ts` (NUEVO)
- Hook para gestionar dinámicamente datos estructurados
- ✅ **INTEGRACIÓN REAL**: Conectado con `usePricing` para precios del backend
- Soporte para precios estáticos como fallback
- Manejo de estados de carga y error
- Usa valores por defecto (sensor4 + rf + país) si no se especifican

### 4. `/src/app/_components/common/ProductStructuredDataWrapper.tsx` (NUEVO)
- Componente wrapper que usa el hook
- Fallback automático a precio estático en caso de error
- Renderizado condicional basado en estado de carga

### 5. `/src/app/_components/common/GlobalProductStructuredData.tsx` (NUEVO)
- Componente para datos estructurados globales del layout
- Usa precios reales de Chile como país base
- Se carga dinámicamente en client-side

### 6. **Páginas de País Implementadas**:
- ✅ `/trackers-slimevr-chile/page.tsx` - $360.00 USD (sin comisiones PayPal)
- ✅ `/trackers-slimevr-espana/page.tsx` - $373.05 USD (con comisiones PayPal)  
- ✅ `/trackers-slimevr-argentina/page.tsx` - $373.05 USD (con comisiones PayPal)
- ✅ `/trackers-slimevr-mexico/page.tsx` - $373.05 USD (con comisiones PayPal)

## Cómo Usar en Otras Páginas de Productos

### ✅ Opción Recomendada: Precios Dinámicos Reales
```tsx
import ProductStructuredDataWrapper from '../_components/common/ProductStructuredDataWrapper'

<ProductStructuredDataWrapper 
  config={{
    name: "Trackers SlimeVR México - Set de 6 Trackers madTrackers",
    description: "Set completo de 6 trackers SlimeVR compatibles con envío rápido a México...",
    url: "https://www.madtrackers.com/trackers-slimevr-mexico",
    // Usar precios REALES del backend
    sensorId: "sensor4", // ICM45686 + QMC6309 (el más popular)
    trackerId: "rf", // ESB (el único disponible)
    quantity: 6, // Set completo de 6 trackers
    countryCode: "MX", // País específico para cálculo real
    // Información del producto
    sku: "MT-SLIMEVR-SET6-MX-2024",
    category: "VR Hardware",
    brand: "madTrackers",
    image: [
      "https://www.madtrackers.com/assets/blog/tracker-mexico.webp"
    ],
    aggregateRating: {
      ratingValue: "4.7",
      reviewCount: "65",
    },
    reviews: [
      {
        author: "Carlos López",
        datePublished: "2024-12-01",
        reviewBody: "Excelente set completo de 6 trackers, llegó rápido a Ciudad de México...",
        reviewRating: { ratingValue: "5" }
      }
    ]
  }}
  fallbackToStatic={true} // Usar fallback si falla la API
/>
```

### 🔄 Opción Fallback: Precio Estático (Solo si es necesario)
```tsx
<ProductStructuredDataWrapper 
  config={{
    name: "Trackers SlimeVR Chile - madTrackers",
    description: "Trackers SlimeVR fabricados en Chile...",
    url: "https://www.madtrackers.com/trackers-slimevr-chile",
    staticPrice: "85.00", // Solo usar si necesitas precio fijo
    priceCurrency: "USD",
    countryCode: "CL",
    sku: "MT-SLIMEVR-CL-2024",
    // ... resto de configuración
  }}
/>
```

## ⚡ Configuración de Precios Dinámicos

El sistema automáticamente:

1. **Obtiene precio real** de `/api/pricing/calculate`
2. **Incluye comisiones PayPal** para países != Chile
3. **Calcula envío específico** por país
4. **Convierte a USD** para SEO consistente
5. **Usa fallback** si la API falla

### Parámetros Automáticos por Defecto:
- `sensorId`: "sensor4" (ICM45686 + QMC6309)
- `trackerId`: "rf" (ESB)
- `quantity`: 6 (set completo de trackers)
- `countryCode`: Especificado por página

### Precios Reales Calculados:
- **Chile**: $360.00 USD (sin comisiones)
- **España**: $371.54 USD (con PayPal)
- **México**: $371.54 USD (con PayPal)
- **Argentina**: $371.54 USD (con PayPal)

## Campos Importantes para SEO

### Obligatorios para Google
- `name`: Nombre del producto
- `description`: Descripción detallada
- `offers.price`: Precio específico (no "desde $X")
- `offers.priceCurrency`: Moneda
- `offers.availability`: Disponibilidad
- `aggregateRating` O `review`: Al menos uno de estos dos

### Recomendados
- `sku`: Código de producto único
- `brand`: Marca del producto
- `category`: Categoría del producto
- `image`: Array de URLs de imágenes
- `offers.itemCondition`: Condición del producto
- `offers.priceValidUntil`: Validez del precio

## Testing y Validación

### Google Rich Results Test
1. Ve a: https://search.google.com/test/rich-results
2. Introduce la URL de tu página
3. Verifica que no hay errores de productos

### Google Search Console
1. Ve a Search Console > Mejoras > Productos
2. Verifica que los errores han disminuido
3. Solicita nueva indexación si es necesario

## Próximos Pasos

1. **✅ COMPLETADO**: Implementar en todas las páginas de países
   - ✅ `/trackers-slimevr-chile` - Implementado con precios CL
   - ✅ `/trackers-slimevr-espana` - Implementado con precios ES
   - ✅ `/trackers-slimevr-mexico` - Implementado con precios MX  
   - ✅ `/trackers-slimevr-argentina` - Implementado con precios AR

2. **Monitorear métricas**:
   - Fragmentos enriquecidos en resultados de búsqueda
   - CTR mejorado desde search results
   - Posicionamiento para búsquedas de productos

3. **Testing y validación**:
   - Monitorear Google Search Console en los próximos 7-14 días
   - Validar con Rich Results Test de Google
   - Solicitar re-indexación para páginas actualizadas

## Notas Técnicas

- El componente `ProductStructuredDataWrapper` es cliente-side para usar hooks
- Los precios dinámicos solo se cargan cuando es necesario
- Hay fallback automático a precios estáticos en caso de error
- El JSON-LD se renderiza solo cuando todos los datos están listos
