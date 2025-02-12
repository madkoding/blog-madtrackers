---
title: "Configuración Inicial"
excerpt: "Como debe ser la primera vez cuando tengas tus trackers y configurarlos correctamente."
coverImage: "/assets/blog/preview/conf-inicial.jpg"
date: "2024-07-06T22:40:07.322Z"
author:
  name: madKoding
  picture: "/assets/blog/authors/madkoding.jpg"
ogImage:
  url: "/assets/blog/preview/conf-inicial.jpg"
---
**1. Instalación del Servidor de SlimeVR:**

- **Descarga e Instalación:** Primero, descarga el [último instalador de SlimeVR desde el sitio web oficial](https://slimevr.dev/download). Ejecuta el instalador y sigue las instrucciones. Si solo vas a usar el servidor para uso independiente a través de OSC y no para realidad virtual en PC a través de SteamVR, puedes desmarcar las opciones de "SteamVR Driver", "SlimeVR Feeder App" y "Controladores USB".
- **Nota Importante:** Si no tienes SteamVR instalado y ejecutado previamente, es posible que encuentres errores durante la instalación.

![Instalacion](/assets/blog/inicio/paso0.png)

**2. Testeo de Trackers:**

- **Verificación de Funcionamiento:** Enciende cada tracker. Deberías ver un LED que parpadea brevemente al inicio y luego cada pocos segundos para indicar su estado. A continuación, te explicamos qué significa cada secuencia de parpadeos:
    - 1 parpadeo: Tracker listo.
    - 2 parpadeos: Conectando al servidor SlimeVR.
    - 3 parpadeos: Conectando a WiFi.
    - 5 parpadeos: Error del tracker.
- **Carga de Trackers:** Si un tracker no se inicia, intenta cargarlo conectándolo mediante un puerto USB a tu PC o cualquier cargador USB. Un LED rojo indicará que está cargando. Un LED verde o azul significa que está completamente cargado. Intenta encender el tracker mientras se carga para ver si funciona.

**3. Calibración de tracker:**

- **Instrucciones Específicas de Calibración:** Dependiendo del tipo de tracker que estés utilizando, necesitarás calibrarlo de manera diferente. Consulta la página de [Calibración de trackers](/posts/Calibracion_de_trackers).

**4. Verificación de la Carga y Conexión del Driver:**

- **Con SteamVR:** Inicia SteamVR, ve a "Configuración" > "Gestionar complementos". Verifica si SlimeVR aparece aquí y asegúrate de que esté activado.

![Gestionar complementos SteamVR](/assets/blog/inicio/paso1.png)

- **Iniciar el Servidor SlimeVR:** Inicia el Servidor SlimeVR a través del menú de inicio usando el acceso directo "Servidor SlimeVR".
- **Reinicio de SteamVR:** Después de iniciar el servidor SlimeVR, reinicia SteamVR. Ahora deberías ver 3 trackers activos en SteamVR y en el servidor SlimeVR, deberías poder ver el cambio de rotación para tu casco y controladores a medida que los mueves.

**5. Ajustes Finales:**

- **Configuración de Seguimiento:** Una vez que todo esté correctamente configurado y funcionando, podrás configurar las opciones de seguimiento para diferentes partes del cuerpo a través del servidor SlimeVR o aplicaciones asociadas.

![SlimeVR](/assets/blog/inicio/paso2.png)

[← Volver a los madTrackers](/)