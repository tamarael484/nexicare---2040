# NexiCare — Micrositio 2040

Micrositio estático de diseño industrial especulativo, preparado para GitHub Pages.

## Estructura

- `index.html` — contenido y narrativa
- `css/style.css` — dirección visual responsive
- `js/main.js` — visor Three.js, carga GLB y fallback AR
- `assets/models/object.glb` — colocar aquí el GLB original
- `assets/models/object.usdz` — colocar aquí el USDZ para Apple Quick Look
- `assets/images/` — renders y visualizaciones

## Activar 3D

Conserva el GLB original y nómbralo `object.glb`, o cambia `MODEL_PATH` en `js/main.js`.

El visor calcula automáticamente bounding box, centro, escala y distancia de cámara. Si Three.js, WebGL o el GLB fallan, el contenido editorial permanece visible.

## Activar AR

Coloca el archivo USDZ original en `assets/models/object.usdz`. El enlace usa `rel="ar"`.

## GitHub Pages

El proyecto no requiere build step. Puede publicarse directamente desde la rama configurada para Pages.

## Nota conceptual

NexiCare se presenta como diseño especulativo para 2040. No debe comunicarse como producto existente, dispositivo médico validado ni tecnología actualmente disponible.


## Assets integrados

Se integraron el render PNG proporcionado, el GLB original y el USDZ original. El GLB se conserva sin conversión. El GLB presenta cabecera `glTF` y versión 2; el USDZ contiene el modelo y sus texturas.
