---
title:
  es: "Configuración Inicial para madTrackers"
  en: "Initial Setup for madTrackers"
excerpt:
  es: "Guía paso a paso para configurar correctamente tus nuevos madTrackers con el sistema SlimeVR."
  en: "Step-by-step guide to properly configure your new madTrackers with SlimeVR system."
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
- **Nota:** Asegúrate de haber ejecutado SteamVR al menos una vez antes de instalar, para evitar errores.

![Instalación SlimeVR](/assets/blog/inicio/paso0.png)

---

**2. Conexión inicial**

1. Conecta el receptor USB incluido con tus madTrackers.
2. Abre el programa **Servidor SlimeVR** desde el menú de inicio.
3. Enciende los trackers uno por uno. Cada tracker debería aparecer automáticamente en el servidor unos segundos después de encenderlo.
4. Si un tracker no aparece:
   - Revisa que tenga batería.
   - Intenta hacer 1 click a su botón (Reset) hasta que parpadee el LED rojo.

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
- Haz clic en **"Quick Reset"** (atajo: `F2`) para reiniciar orientaciones.
- Luego, realiza la **pose en T** (de pie, brazos estirados horizontalmente).
- En el servidor, selecciona "Full Body Calibration" para alinear todo el cuerpo.

---

**6. Activación en SteamVR (si usas VR en PC)**

- Abre SteamVR.
- Ve a **Configuración > Gestionar complementos**.
- Asegúrate de que "SlimeVR Driver" esté activado.
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

---LANG-SEPARATOR---

**1. Install the SlimeVR Server**

- **Download the latest installer:** From the [official SlimeVR page](https://slimevr.dev/#download).
- **During installation:**
  - If you're going to use it without SteamVR (e.g., via OSC), you can uncheck:
    - SteamVR Driver
    - SlimeVR Feeder App
    - USB Controllers
- **Note:** Make sure you've run SteamVR at least once before installing to avoid errors.

![SlimeVR Installation](/assets/blog/inicio/paso0.png)

---

**2. Initial Connection**

1. Connect the USB receiver included with your madTrackers.
2. Open the **SlimeVR Server** program from the start menu.
3. Turn on the trackers one by one. Each tracker should appear automatically in the server a few seconds after turning it on.
4. If a tracker doesn't appear:
   - Check that it has battery.
   - Try holding its button until the LED blinks and then release.

---

**3. Tracker LED Indicators**

- **1 blink:** Tracker ready and connected.
- **2 blinks:** Looking for SlimeVR server.
- **3 blinks:** Looking for receiver.
- **5 blinks:** General error.

If it doesn't turn on or gets stuck in constant blinking, connect the tracker via USB to charge it.
- **Red LED:** Connection.
- **Blue LED:** Charging.

---

**4. Body Part Assignment**

Once all trackers are connected:

1. In the SlimeVR server, select each tracker.
2. Assign its location (left foot, right thigh, torso, etc.) from the dropdown list.
3. You can move the tracker and observe on screen to confirm its location.

---

**5. Calibration**

- Put on the trackers where they belong.
- Click **"Quick Reset"** (shortcut: `F2`) to reset orientations.
- Then, perform the **T-pose** (standing, arms stretched horizontally).
- In the server, select "Full Body Calibration" to align the entire body.

---

**6. SteamVR Activation (if using PC VR)**

- Open SteamVR.
- Go to **Settings > Manage Add-ons**.
- Make sure "SlimeVR Driver" is enabled.
- Run the SlimeVR server.
- Restart SteamVR. You should see the trackers active.

![SteamVR Add-ons](/assets/blog/inicio/paso1.png)

---

**7. Final Settings and Diagnostics**

- In the SlimeVR server you can:
  - View battery, signal and status of each tracker.
  - Adjust offsets, orientation and filters if necessary.
  - Apply quick resets when they become misaligned.
- With this, you're ready to move freely with full body tracking.

![SlimeVR Server](/assets/blog/inicio/paso2.png)

[← Back to madTrackers](/)
