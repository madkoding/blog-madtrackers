---
title: "madTrackers"
excerpt: "Los trackers inalámbricos son dispositivos que capturan y transmiten la posición del usuario en tiempo real a un servidor en su PC mediante una conexión WiFi de 2.4 GHz."
coverImage: "/assets/blog/preview/cover.jpg"
date: "2024-07-06T22:40:07.322Z"
author:
  name: madKoding
  picture: "/assets/blog/authors/madkoding.jpg"
ogImage:
  url: "/assets/blog/preview/cover.jpg"
---
# Servidor NodeJS para lectura OSC

Para crear un servidor en Node.js que pueda capturar la posición de tus trackers SlimeVR a través de OSC (Open Sound Control), necesitarás instalar algunas dependencias y configurar tu servidor para recibir los datos OSC. A continuación, te proporciono un ejemplo completo de cómo hacerlo.

### **Paso 1: Crear el proyecto y configurar el entorno**

1. Crea una carpeta para tu proyecto y navega dentro de ella:
    
    ```bash
    mkdir slimevr-osc-server
    cd slimevr-osc-server
    ```
    
2. Inicializa un proyecto de Node.js:
    
    ```bash
    npm init -y
    ```
    
3. Instala las dependencias necesarias:
    
    ```bash
    npm install osc express
    ```
    

### **Paso 2: Crear el servidor OSC**

Crea un archivo llamado **`server.js`** y agrega el siguiente código:

```jsx
javascriptCopiar código
const osc = require('osc');
const express = require('express');
const app = express();
const port = 3000;

// Configuración del servidor OSC
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 5000
});

// Evento cuando se recibe un mensaje OSC
udpPort.on("message", function (oscMessage) {
    console.log("Mensaje OSC recibido:", oscMessage);
});

// Manejo de errores
udpPort.on("error", function (error) {
    console.log("Error en el puerto OSC: ", error.message);
});

// Abrir el puerto OSC
udpPort.open();

// Servidor HTTP para recibir las posiciones de los trackers
app.post('/trackers', express.json(), (req, res) => {
    const { id, x, y, z } = req.body;
    console.log(`Tracker ID: ${id}, Posición - X: ${x}, Y: ${y}, Z: ${z}`);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Servidor HTTP escuchando en http://localhost:${port}`);
});
```

### **Paso 3: Ejecutar el servidor**

Para ejecutar el servidor, usa el siguiente comando:

```bash
node server.js
```

OSC ocupara el puerto 5000

Express utilizara el puerto 3000

*En el puerto 3000 encontrara un endpoint. Se define una ruta POST `/trackers` para recibir datos en formato JSON. Con este código, tu servidor de Node.js podrá capturar la posición de tus trackers SlimeVR a través de OSC y también recibir datos de los trackers a través de una solicitud HTTP POST*