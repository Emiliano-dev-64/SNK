# Cómo Añadir Nuevas Regiones al Mapa

Este documento explica cómo añadir nuevas regiones al mapa interactivo de Shuen No Kokai.

## Estructura de una Región

Cada región se define en el archivo `data/champions.json` dentro del array `regions`. Aquí está la estructura básica:

```json
{
  "id": "nombre-region",
  "name": "Nombre de la Región",
  "description": "Descripción detallada de la región.",
  "image": "../img/imagen-panel.jpg",
  "heroImage": "../img/imagen-hero.jpg",
  "champions": ["id-champion1", "id-champion2"],
  "locations": [
    {
      "id": "nombre-lugar",
      "name": "Nombre del Lugar",
      "description": "Descripción del lugar.",
      "x": 50,
      "y": 50,
      "image": "../img/imagen-lugar.jpg"
    }
  ]
}
```

**Campos de imagen:**
- `image`: Se usa en el panel desplegable del mapa mundial (al clickear el hotspot)
- `heroImage`: Se usa como fondo del hero en la página `region.html`. Si no se define, usa `image` como fallback

## Pasos para Añadir una Nueva Región

### 1. Preparar las Imágenes

- **Imagen de la región**: Guarda una imagen representativa en `img/` (formato JPG recomendado).
- **Imágenes de los lugares**: Crea una imagen para cada lugar de la región.
- **Icono del hotspot** (opcional): Si quieres un icono personalizado para el mapa.

### 2. Editar `data/champions.json`

Agrega una nueva entrada en el array `regions`:

```json
{
  "id": "nueva-region",
  "name": "Nueva Región",
  "description": "Descripción de la nueva región.",
  "image": "../img/nueva-region.jpg",
  "champions": [],
  "locations": [
    {
      "id": "lugar-1",
      "name": "Primer Lugar",
      "description": "Descripción del lugar.",
      "x": 30,
      "y": 40,
      "image": "../img/lugar-1.jpg"
    }
  ]
}
```

### 3. Añadir Hotspot en el Mapa

Edita `world-map.html` y agrega un nuevo hotspot dentro de `#mapaZoom`:

```html
<div class="hotspot" style="top: 14%; left: 55%;" data-name="Nueva Región" data-region="nueva-region">
  <div class="hotspot__marker">
    <div class="hotspot__dot"></div>
    <div class="hotspot__ring"></div>
  </div>
</div>
```

**Parámetros importantes:**
- `top` y `left`: Posición porcentual en el mapa (0-100%).
- `data-name`: Nombre que se muestra al pasar el mouse.
- `data-region`: ID de la región (debe coincidir con el id en `champions.json`).

### 4. Añadir Lugar en el Mapa Mundial (Opcional)

Si la región debe aparecer también en la sección "El Mundo de Shuen No Kokai", agrega una entrada en el array `locations` de la región "mundo":

```json
{
  "id": "nueva-region",
  "name": "Nueva Región",
  "description": "Descripción breve.",
  "x": 55,
  "y": 15,
  "image": "../img/nueva-region.jpg",
  "linkedPage": "region.html?id=nueva-region"
}
```

### 5. Asociar Champions (Opcional)

Si hay personajes asociados a la región, agrega sus IDs al array `champions`:

```json
"champions": ["id-champion1", "id-champion2"]
```

Los IDs deben coincidir con los IDs definidos en el array `champions` del mismo archivo.

## Ejemplo Completo

```json
{
  "id": "isla-treasure",
  "name": "Isla Treasure",
  "description": "Una isla legendaria llena de tesoros y trampas mortales.",
  "image": "../img/isla-treasure.jpg",
  "champions": ["luffy", "zoro"],
  "locations": [
    {
      "id": "playa-treasure",
      "name": "Playa del Tesoro",
      "description": "La playa principal donde desembarcan los aventureros.",
      "x": 40,
      "y": 60,
      "image": "../img/playa-treasure.jpg"
    },
    {
      "id": "cueva-secreta",
      "name": "Cueva Secreta",
      "description": "Una cueva oculta donde se esconde el tesoro principal.",
      "x": 60,
      "y": 40,
      "image": "../img/cueva-secreta.jpg"
    }
  ]
}
```

## Notas Importantes

1. **Coordenadas**: Usa porcentajes (0-100) para `x` e `y` en los hotspots y lugares.
2. **Rutas de imagen**: Todas las rutas son relativas desde la raíz del proyecto.
3. **IDs únicos**: Cada región y lugar debe tener un ID único.
4. **Reiniciar servidor**: Después de hacer cambios, recarga la página para ver las actualizaciones.

## Solución de Problemas

- **La región no aparece**: Verifica que el ID en el hotspot coincida con el ID en `champions.json`.
- **Imagen no carga**: Asegúrate de que la ruta sea correcta y la imagen exista en `img/`.
- **Hotspot no funciona**: Revisa que el atributo `data-region` esté correctamente definido.