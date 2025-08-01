# Sistema de Envío de Correos Masivos - Admin Panel

## 📧 Nueva Funcionalidad: Envío de Correos Inteligente

Se ha agregado una nueva pestaña al panel de administración que permite enviar correos electrónicos a los usuarios del sistema con **lógica dual inteligente** para evitar problemas de spam.

### 🛡️ Método Anti-Spam Inteligente

#### 📨 **Lógica Dual de Envío**

**🎯 Para 1 Usuario (Personalizado)**
- **Email principal**: Directamente al usuario seleccionado
- **BCC**: `madkoding@gmail.com` (para registro)
- **Personalización**: Funciona `{nombre}` y mensajes personalizados
- **Ventajas**: Correo personalizado directo al usuario

**📢 Para Múltiples Usuarios (Masivo)**
- **Email principal**: `madkoding@gmail.com`  
- **BCC**: Todos los usuarios seleccionados (copia oculta)
- **Personalización**: Mensaje general para todos
- **Ventajas**: Un solo envío, evita spam, privacidad total

### Características Principales

#### 🎯 Selección de Destinatarios
- **Todos los usuarios**: Envía el correo a todos los usuarios registrados en el sistema
- **Usuarios seleccionados**: Permite seleccionar específicamente qué usuarios recibirán el correo
  - Checkbox individual para cada usuario
  - Botón "Seleccionar todos" / "Deseleccionar todos"
  - Muestra el contador de usuarios seleccionados

#### 📝 Plantillas Predefinidas
Se incluyen 3 plantillas de correo listas para usar:

1. **Actualización de Estado**
   - Para informar sobre el progreso de los pedidos
   - Asunto predefinido sobre actualización de pedido

2. **Información General**
   - Para comunicaciones generales con los usuarios
   - Asunto configurable para información importante

3. **Mensaje Personalizado**
   - Plantilla en blanco para mensajes completamente personalizados
   - Sin asunto predefinido

#### 🔧 Personalización

**🎯 Para 1 Usuario:**
- **Variable `{nombre}`**: Se reemplaza con el nombre real del usuario
- **Mensaje personalizado**: Completamente personalizado
- **Saludo directo**: "Hola [Nombre],"

**📢 Para Múltiples Usuarios:**
- **Variable `{nombre}`**: Se reemplaza con "estimado usuario"
- **Mensaje general**: Mismo contenido para todos
- **Saludo genérico**: "Hola,"

**Común para ambos:**
- **Editor de asunto**: Campo libre para personalizar el asunto del correo
- **Editor de mensaje**: Área de texto amplia para el contenido del correo
- **HTML automático**: Los correos se formatean automáticamente con HTML para mejor presentación

### Acceso y Seguridad

#### 🔐 Autenticación
- Requiere autenticación de administrador via JWT
- Verifica permisos antes de mostrar la interfaz
- Tokens con expiración automática

#### 🛡️ Validaciones
- Validación de campos obligatorios (asunto y mensaje)
- Verificación de selección de usuarios cuando se elige "usuarios seleccionados"
- Validación de formato de email antes del envío
- Manejo de errores y reintentos

### Implementación Técnica

#### 📁 Archivos Creados
```
src/app/admin/correos/
├── page.tsx                    # Interfaz principal de envío de correos

src/app/api/admin/
├── send-emails/
    └── route.ts               # API endpoint para envío masivo
```

#### 🔄 Archivos Modificados
```
src/app/admin/layout.tsx       # Agregada nueva pestaña "📧 Enviar Correos"
```

#### 🏗️ Arquitectura
- **Frontend**: React con hooks para estado y autenticación
- **Backend**: API Route de Next.js
- **Email Service**: Integración con Resend
- **Database**: Firebase Firestore para obtener usuarios
- **Autenticación**: JWT con validación de permisos de admin

### Uso de la Funcionalidad

#### 1. Acceso
- Navegar al panel de administración (`/admin`)
- Hacer clic en la pestaña "📧 Enviar Correos"

#### 2. Selección de Destinatarios
- Elegir entre "Todos los usuarios" o "Usuarios seleccionados"
- Si eliges usuarios seleccionados, marca los checkboxes correspondientes

#### 3. Redacción del Correo
- Opcionalmente, usa una plantilla predefinida haciendo clik en ella
- Las plantillas incluyen `{nombre}` que funciona para usuarios individuales
- Personaliza el asunto del correo
- Escribe o modifica el mensaje

#### 4. Envío Inteligente
- Hacer clic en "Enviar Correos"
- **Si seleccionaste 1 usuario**: Correo personalizado directo + BCC a madkoding
- **Si seleccionaste múltiples**: Correo masivo con BCC
- Se mostrará un resumen específico según el método utilizado

### Características Técnicas Avanzadas

#### ⚡ Optimizaciones
- **Detección automática**: El sistema decide el método según el número de destinatarios
- **Envío único para múltiples**: Un correo BCC para muchos usuarios
- **Envío personalizado para uno**: Correo directo para usuario individual
- **Validación de email**: Verifica formato válido antes del envío
- **Filtrado automático**: Solo incluye emails válidos en el envío
- **Registro automático**: madkoding@gmail.com siempre recibe copia
- **Logs detallados**: Registro completo de emails válidos e inválidos
- **Manejo de errores**: Respuesta detallada sobre el resultado del envío

#### 📊 Feedback al Usuario
- Indicadores de carga durante el envío
- **Para 1 usuario**: "Correo personalizado enviado a [email] (copia en BCC a madkoding@gmail.com)"
- **Para múltiples**: "Correo masivo enviado con X destinatarios en BCC (principal: madkoding@gmail.com)"
- Mensajes de error descriptivos
- Detalles sobre emails inválidos filtrados
- Información sobre el método utilizado automáticamente

#### 🎨 Interfaz de Usuario
- Diseño consistente con el resto del panel de admin
- Responsive design para móvil y desktop
- Tooltips y ayuda contextual
- Formulario intuitivo con validación en tiempo real

### Variables de Entorno Requeridas

```env
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM_EMAIL=noreply@tudominio.com
```

### Consideraciones de Uso

#### ✅ Mejores Prácticas
- Usar plantillas para consistencia
- **Para 1 usuario**: Aprovechar la personalización con `{nombre}`
- **Para múltiples**: Escribir mensajes generales apropiados para todos
- Revisar la lista de destinatarios antes del envío
- Usar asuntos descriptivos y claros
- Aprovechar las ventajas del sistema inteligente

#### ⚠️ Limitaciones y Consideraciones
- Los usuarios deben tener emails válidos en el campo `contacto`
- **1 usuario**: Personalización completa disponible
- **Múltiples usuarios**: Personalización limitada (mensaje general)
- El sistema decide automáticamente el método según la cantidad
- madkoding@gmail.com siempre recibe copia para registro
- Respeta los límites de tu proveedor de email (Resend)
- Se requiere conexión a internet para el envío

### Monitoreo y Logs

El sistema genera logs detallados que incluyen:
- Número total de usuarios procesados
- Número de emails válidos incluidos en BCC
- Número de emails inválidos filtrados
- ID del correo masivo enviado por Resend
- Timestamps de cada operación
- Email principal utilizado (madkoding@gmail.com)

Estos logs aparecen en la consola del servidor y pueden ser monitoreados para diagnosticar problemas.

### 🚀 Ventajas del Sistema Inteligente

#### Comparación: Métodos Disponibles

**🎯 Correo Individual (1 usuario)**
- ✅ Personalización completa con nombre real
- ✅ Correo directo al usuario
- ✅ BCC automático a madkoding para registro
- ✅ Experiencia personalizada
- ✅ Menor probabilidad de spam

**📢 Correo Masivo (múltiples usuarios)**
- ✅ Un solo correo para múltiples destinatarios
- ✅ Privacidad total entre usuarios (BCC)
- ✅ Más rápido que envíos individuales
- ✅ Menor carga en el servidor de email
- ✅ Control centralizado en madkoding@gmail.com

**🧠 Detección Automática**
- ✅ El sistema elige el mejor método automáticamente
- ✅ No requiere configuración manual
- ✅ Optimizado para cada caso de uso
- ✅ Siempre incluye registro para administrador
