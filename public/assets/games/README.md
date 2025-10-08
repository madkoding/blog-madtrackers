# Juegos Compatibles con Full Body Tracking

Este directorio contiene los logos de los juegos de VR que son compatibles con el sistema de Full Body Tracking utilizando trackers SlimeVR.

## Lista de Juegos

| Juego | Steam App ID | Logo | Estado |
|-------|-------------|------|--------|
| VRChat | 438100 | vrchat.png | ✅ Descargado |
| Resonite | 2519830 | resonite.png | ✅ Descargado |
| ChilloutVR | 661130 | chillout-vr.png | ✅ Descargado |
| Blade & Sorcery | 629730 | blade-and-sorcery.png | ✅ Descargado (logo) |
| Dragon Fist: VR Kung Fu | 1481780 | dragon-fist.png | ✅ Descargado (logo) |
| Sairento VR | 555880 | sairento-vr.png | ✅ Descargado (logo) |
| Dance Dash | 2005050 | dance-dash.png | ✅ Descargado (logo) |
| Holodance | 422860 | holodance.png | ✅ Descargado (logo) |
| VRWorkout | 1346850 | vrworkout.png | ✅ Descargado (logo) |
| Final Soccer VR | 555060 | final-soccer-vr.png | ✅ Descargado (logo) |
| Tornuffalo | 534720 | tornuffalo.png | ✅ Descargado (header) |
| VR Monster Awakens | 566870 | vr-monster-awakens.png | ✅ Descargado (header) |
| Climbey | 520010 | climbey.png | ✅ Descargado (logo) |

## Fuentes

Los logos fueron descargados desde Steam CDN usando las siguientes URLs:

**Logos oficiales:**
```
https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{APP_ID}/logo.png
```

**Headers (cuando no hay logo disponible):**
```
https://steamcdn-a.akamaihd.net/steam/apps/{APP_ID}/header.jpg
```

### Logos Oficiales (PNG con transparencia, 640x360)
- VRChat
- Resonite  
- ChilloutVR
- Blade & Sorcery
- Dragon Fist: VR Kung Fu
- Sairento VR
- Dance Dash
- Holodance
- VRWorkout
- Final Soccer VR
- Climbey

### Headers de Steam (JPEG, 460x215)
- Tornuffalo
- VR Monster Awakens

## Formato de Archivos

- **PNG**: Todos los archivos tienen extensión .png (aunque algunos son JPEG internamente por compatibilidad con Next.js Image)
- **Logos oficiales**: Resolución de 640x360 píxeles (formato PNG con transparencia)
- **Headers de Steam**: Resolución de 460x215 píxeles (formato JPEG)
  - Se usan cuando el juego no tiene un logo oficial disponible en la CDN de Steam
  - Incluyen las imágenes promocionales oficiales del juego

## Uso en el Componente

Los logos se utilizan en el componente `SupportedGamesCarousel.tsx` que muestra un carrusel animado de todos los juegos compatibles. Cada logo es clickeable y redirige a la página del juego en Steam.

## Actualización de Logos

Para actualizar o agregar nuevos logos:

1. Descarga el logo desde Steam CDN o SteamGridDB
2. Guárdalo en este directorio con el formato: `nombre-del-juego.png`
3. Actualiza el array `games` en `SupportedGamesCarousel.tsx`
4. Actualiza este README con la información del nuevo juego
