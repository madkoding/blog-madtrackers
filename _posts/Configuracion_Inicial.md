---
title: "Configuración Inicial para madTrackers"
excerpt: "Guía paso a paso para configurar correctamente tus nuevos madTrackers con el sistema SlimeVR."
coverImage: "/assets/blog/preview/conf-inicial.jpg"
date: "2025-07-27T12:00:00.000Z"
author:
  name: madKoding
  picture: "/assets/blog/authors/madkoding.jpg"
ogImage:
  url: "/assets/blog/preview/conf-inicial.jpg"
---

**1. Instala el Servidor de SlimeVR**

- **Descarga el instalador más reciente:** Desde la [página oficial de SlimeVR](https://slimevr.dev/download).
- **Durante la instalación:**
  - Si vas a usarlo sin SteamVR (por ejemplo, vía OSC), puedes desmarcar:
    - SteamVR Driver
    - SlimeVR Feeder App
    - Controladores USB
- **Nota:** Asegúrate de haber ejecutado SteamVR al menos una vez antes de instalar, para evitar errores.

![Instalación SlimeVR](/assets/blog/inicio/paso0.png)

---

**2. Conexión inicial**

1. Conecta el receptor USB incluido con tus madTrackers.
2. Abre el programa **Servidor SlimeVR** desde el menú de inicio.
3. Enciende los trackers uno por uno. Cada tracker debería aparecer automáticamente en el servidor unos segundos después de encenderlo.
4. Si un tracker no aparece:
   - Revisa que tenga batería.
   - Intenta mantener presionado su botón hasta que parpadee el LED y luego soltar.

---

**3. Indicadores LED de los Trackers**

- **1 parpadeo:** Tracker listo y conectado.
- **2 parpadeos:** Buscando el servidor SlimeVR.
- **3 parpadeos:** Buscando receptor.
- **5 parpadeos:** Error general.

Si no enciende o se queda en parpadeos constantes, conecta el tracker vía USB para cargarlo.  
- **LED rojo:** Conexion.  
- **LED azul:** Carga.

---

**4. Asignación de partes del cuerpo**

Una vez que todos los trackers están conectados:

1. En el servidor SlimeVR, selecciona cada tracker.
2. Asigna su ubicación (pie izquierdo, muslo derecho, torso, etc.) desde la lista desplegable.
3. Puedes mover el tracker y observar en pantalla para confirmar su ubicación.

---

**5. Calibración**

- Colócate los trackers donde corresponde.
- Haz clic en **“Quick Reset”** (atajo: `F2`) para reiniciar orientaciones.
- Luego, realiza la **pose en T** (de pie, brazos estirados horizontalmente).
- En el servidor, selecciona “Full Body Calibration” para alinear todo el cuerpo.

---

**6. Activación en SteamVR (si usas VR en PC)**

- Abre SteamVR.
- Ve a **Configuración > Gestionar complementos**.
- Asegúrate de que “SlimeVR Driver” esté activado.
- Ejecuta el servidor SlimeVR.
- Reinicia SteamVR. Deberías ver los trackers activos.

![Complementos en SteamVR](/assets/blog/inicio/paso1.png)

---

**7. Ajustes Finales y Diagnóstico**

- En el servidor de SlimeVR puedes:
  - Ver batería, señal y estado de cada tracker.
  - Ajustar offsets, orientación y filtros si es necesario.
  - Aplicar resets rápidos cuando se desalineen.
- Con esto, ya estás listo para moverte libremente con seguimiento corporal completo.

![Servidor SlimeVR](/assets/blog/inicio/paso2.png)

[← Volver a los madTrackers](/)
