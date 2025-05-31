# 🔒 Guía de Seguridad - MadTrackers

## Problemas Identificados y Solucionados

### ✅ Problemas Corregidos

1. **Credenciales Firebase Hardcodeadas** *(CRÍTICO)*
   - **Antes**: Credenciales expuestas en `src/lib/firebase.ts`
   - **Ahora**: Movidas a variables de entorno en `.env.local`

2. **Variables de Entorno Configuradas**
   - ✅ `.env.local` creado con credenciales reales
   - ✅ `.env.local.example` actualizado como plantilla
   - ✅ `.gitignore` protege archivos sensibles

## Variables de Entorno Requeridas

Crea un archivo `.env.local` con:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui

# API Security
API_SECRET_KEY=tu_clave_secreta_api
NEXT_PUBLIC_API_KEY=tu_clave_publica_api

# OpenAI API Key
OPENAI_API_KEY=tu_openai_api_key
```

## Verificación de Seguridad

Ejecuta el script de verificación:

```bash
npm run security-check
```

## Buenas Prácticas Implementadas

### ✅ Lo que está bien:
- Variables de entorno para secretos
- `.gitignore` configurado correctamente
- Separación entre claves públicas (`NEXT_PUBLIC_*`) y privadas
- Script de verificación automática

### ⚠️ Consideraciones:
- **Información de contacto**: Email y teléfono en `i18n.ts` (es información pública, pero considera si quieres centralizarla)
- **PayPal**: URL de pago hardcodeada (normal para pagos públicos)

## Acciones Recomendadas

### 1. Inmediatas (YA COMPLETADAS ✅)
- [x] Mover credenciales Firebase a variables de entorno
- [x] Verificar que `.env.local` esté en `.gitignore`
- [x] Crear script de verificación de seguridad

### 2. Recomendadas para Producción
- [ ] Regenerar credenciales Firebase si fueron commitadas anteriormente
- [ ] Configurar Firebase Security Rules más restrictivas
- [ ] Implementar rate limiting en APIs
- [ ] Auditar historial de Git para credenciales expuestas

### 3. Monitoreo Continuo
- [ ] Ejecutar `npm run security-check` antes de cada deploy
- [ ] Configurar pre-commit hooks para verificación
- [ ] Revisar logs de Firebase para accesos sospechosos

## Comandos Útiles

```bash
# Verificar seguridad
npm run security-check

# Buscar posibles secretos
grep -r "sk-\|pk_\|rk_" src/

# Verificar variables de entorno
grep -r "process.env" src/
```

## Contacto

Si encuentras problemas de seguridad, reporta inmediatamente a: madkoding@gmail.com

---
**Última actualización**: 31 de mayo de 2025
