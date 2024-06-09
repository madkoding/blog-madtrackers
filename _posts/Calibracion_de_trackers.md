---
title: "Calibración de trackers"
excerpt: "Todos los pasos iniciales para configurar y calibrar tus trackers de manera adecuada."
coverImage: "/assets/blog/preview/calibracion.jpg"
date: "2024-07-06T22:40:07.322Z"
author:
  name: madKoding
  picture: "/assets/blog/authors/madkoding.jpg"
ogImage:
  url: "/assets/blog/preview/calibracion.jpg"
---
### Pasos para la Calibración

Los trackers necesitan grabar una primera calibración la primera vez que los inicias, esta calibración luego se guarda en memoria para los siguiente usos. En el calibrado debes considerar el tracker como un dado o un cubo, tendrás que darlo vuelta en sus 6 caras. Sigue atentamente las instrucciones ya que de esto depende que tu tracker funcione de manera adecuada. Si no llegas a estar conforme con el movimiento, reintenta calibrar. 

### 1. Precalentamiento

Antes de iniciar la calibración, utiliza los trackers durante aproximadamente 10 minutos para asegurar que estén a una temperatura de operación adecuada.

### 2. Conexión con el Servidor SlimeVR

Conecta los trackers al servidor SlimeVR y verifica que todos los dispositivos estén reconocidos por el sistema.

### 3. Iniciar la Calibración

- Ingresa a la “Consola serial” de tu servidor SlimeVR, que se encuentra en “Ajustes”

![BotonReset](/assets/blog/calibracion/reset.png)

- **Pon tu tracker boca abajo (logo hacia abajo) y enciendelo**
- Presiona el botón “Reiniciar” en la consola serial
- En la consola aparecerán distintos mensajes en el siguiente orden
    
    - `Flip front in 5 seconds to start calibration`
    da vuelta el tracker boca arriba
    
    - `Starting calibration…`
    En este momento comenzará la calibración del tracker, vuelve a poner el tracker boca abajo por 5 segundos
    
    - `Put the device into 6 unique orientations (all sides), leave it still and do not hold/touch for 3 seconds each`
    `Waiting for position 1`
    Déjalo boca abajo como estaba  por 3 segundos mas hasta que pida la segunda posición, recuerda no sostenerlo en la mano ni tocarlo, debes hacerlo en una superficie lisa
        
    - `Recorded, waiting for position 2...` 
    Da vuelta de lado el tracker y espera a los 3 segundos hasta que te pida la siguiente posición y así hasta la 6ta
    
    - `Finished calculating accelerometer calibration` 
    Aquí ya habrá terminado la calibración y guardado las posiciones

[← Volver a los madTrackers](/)