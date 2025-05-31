# Configuración de PayPal para MadTrackers

Este documento explica cómo configurar el sistema de pagos de PayPal para el proyecto MadTrackers.

## ✅ Lo que ya está implementado

- Botón de PayPal dinámico que acepta cantidades variables
- Integración con el sistema de pricing 
- Páginas de éxito y cancelación de pago
- API endpoint para notificaciones IPN de PayPal
- Configuración de imágenes de PayPal en Next.js

## 🔧 Configuración requerida

### 1. Variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y configura:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL=tu-email-de-paypal@business.com
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox  # o 'production' para producción
PAYPAL_CLIENT_ID=tu-client-id-de-paypal
PAYPAL_CLIENT_SECRET=tu-client-secret-de-paypal
```

### 2. Cuenta de PayPal Business

1. Ve a [PayPal Developer](https://developer.paypal.com/)
2. Crea una cuenta de desarrollador si no tienes una
3. Crea una nueva aplicación para obtener el Client ID y Secret
4. Asegúrate de tener una cuenta business activa

### 3. Configuración de IPN (Instant Payment Notification)

En tu cuenta de PayPal:
1. Ve a Profile → Profile and settings → My selling tools
2. Busca "Instant payment notifications" y haz clic en "Update"
3. Configura la URL de notificación: `https://tu-dominio.com/api/paypal/ipn`

## 📋 Cómo funciona

### En el componente de pricing:

```tsx
<PaypalButton 
  amount={totalPriceUsd / 4} // Pago del 25% como anticipo
  description={`MadTrackers - ${selectedTrackerType.label} x${selectedQuantity} (Anticipo 25%)`}
/>
```

### El flujo de pago:

1. El usuario selecciona la cantidad y configuración en el pricing
2. Se calcula el total en USD
3. El botón muestra "Pagar $X.XX USD" 
4. Al hacer clic, se abre PayPal con los datos de la transacción
5. Después del pago, PayPal redirige a `/payment-success` o `/payment-cancel`
6. PayPal envía una notificación IPN a `/api/paypal/ipn` para confirmar el pago

## 🛠️ Próximos pasos sugeridos

1. **Configurar tu email de PayPal** en las variables de entorno
2. **Integrar con Firebase** para guardar los datos de las transacciones
3. **Configurar emails de confirmación** después de pagos exitosos
4. **Añadir logging** para hacer seguimiento de las transacciones
5. **Implementar PayPal SDK** para una integración más robusta (opcional)

## 🚀 Uso en producción

Para usar en producción:
1. Cambia `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=production`
2. Usa tus credenciales de producción de PayPal
3. Configura correctamente la URL de IPN en PayPal
4. Asegúrate de que el SSL esté configurado correctamente

## 📞 Soporte

Si necesitas ayuda con la configuración, consulta la [documentación oficial de PayPal](https://developer.paypal.com/docs/api/overview/).
