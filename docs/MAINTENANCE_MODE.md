# Modo Mantenimiento

Este proyecto incluye un sistema de modo mantenimiento que permite alternar entre mostrar el componente de pricing normal o una página de mantenimiento elegante.

## 🔧 Configuración

### Variable de Entorno

La funcionalidad se controla mediante la variable de entorno:

```env
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

- **`false`** (por defecto): Muestra el componente Pricing normal
- **`true`**: Muestra la página de mantenimiento

### Archivos de Configuración

1. **`.env.local`**: Variables de entorno para desarrollo local
2. **`.env.local.example`**: Plantilla con todas las variables necesarias

## 🚀 Uso

### Activar Modo Mantenimiento

1. Abre el archivo `.env.local`
2. Cambia la variable:
   ```env
   NEXT_PUBLIC_MAINTENANCE_MODE=true
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Desactivar Modo Mantenimiento

1. Cambia la variable en `.env.local`:
   ```env
   NEXT_PUBLIC_MAINTENANCE_MODE=false
   ```
2. Reinicia el servidor

## 📁 Archivos Relacionados

- **`src/app/_components/ClientHomeWrapper.tsx`**: Lógica principal que decide qué componente mostrar
- **`src/app/_components/maintenance/maintenance.tsx`**: Componente de página de mantenimiento
- **`src/app/_components/pricing/pricing.tsx`**: Componente de pricing original

## 🎨 Personalización

El componente de mantenimiento (`maintenance.tsx`) puede ser personalizado:

- **Colores**: Modifica las clases de Tailwind CSS
- **Texto**: Cambia los mensajes y títulos
- **Iconos**: Actualiza los SVG o emojis
- **Enlaces**: Configura los botones de contacto

## 🔄 Despliegue

En producción, asegúrate de configurar la variable de entorno en tu plataforma de hosting:

### Vercel
```bash
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE
```

### Netlify
```bash
netlify env:set NEXT_PUBLIC_MAINTENANCE_MODE false
```

### Docker
```dockerfile
ENV NEXT_PUBLIC_MAINTENANCE_MODE=false
```

## 📝 Notas

- La variable debe tener el prefijo `NEXT_PUBLIC_` para estar disponible en el cliente
- Los cambios requieren reiniciar el servidor de desarrollo
- El componente se carga de forma lazy para optimizar el rendimiento
