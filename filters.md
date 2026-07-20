# Cómo Gestionar los Filtros de Personajes

Los filtros en la página de Personajes (`champions.html`) permiten filtrar personajes por región.

## Cómo Funciona

1. El usuario hace clic en un botón de filtro (ej: "Cozia")
2. `champion-grid.js` compara el `data-filter` del botón con el campo `region` de cada champion
3. Solo se muestran los champions cuya región coincide

## Estructura de un Filtro

Cada filtro tiene dos partes:

### 1. Botón HTML en `champions.html`

```html
<button class="filter-tag" data-filter="ID-REGION">Texto Visible</button>
```

- `data-filter`: debe coincidir exactamente con el `id` de la región en `champions.json`
- El texto entre las etiquetas es lo que ve el usuario

### 2. Región en `champions.json`

```json
{
  "id": "ID-REGION",
  "name": "Nombre de la Región",
  ...
}
```

Y cada champion debe tener el campo `region` con el mismo ID:

```json
{
  "id": "nombre-champion",
  "region": "ID-REGION",
  ...
}
```

## Cambiar el Nombre Visible de un Filtro

Solo necesitas editar `champions.html`:

```html
<!-- ANTES -->
<button class="filter-tag" data-filter="cozia">Cozia</button>

<!-- DESPUÉS -->
<button class="filter-tag" data-filter="cozia">Nueva Cozia</button>
```

No toques `data-filter` ni el JSON.

## Añadir un Filtro Nuevo

### Paso 1: Crear la región en `champions.json`

Agrega una nueva entrada en el array `regions`:

```json
{
  "id": "nueva-region",
  "name": "Nueva Región",
  "description": "Descripción de la región.",
  "image": "../img/imagen-region.jpg",
  "champions": [],
  "locations": []
}
```

### Paso 2: Asignar champions a la región

En el array `champions`, cambia el campo `region` de los champions que pertenezcan:

```json
{
  "id": "mi-champion",
  "region": "nueva-region",
  ...
}
```

### Paso 3: Agregar el botón de filtro en `champions.html`

Agrega un nuevo `<button>` dentro de `.filter-bar__tags`:

```html
<div class="filter-bar__tags">
  <button class="filter-tag active" data-filter="all">Todos</button>
  <button class="filter-tag" data-filter="filo-maldito">Filo maldito</button>
  <button class="filter-tag" data-filter="cozia">Cozia</button>
  <button class="filter-tag" data-filter="archipielago-cozia">Archipiélago Cozia</button>
  <button class="filter-tag" data-filter="nueva-region">Nueva Región</button>
</div>
```

**Importante**: El valor de `data-filter` debe ser exactamente igual al `id` de la región en el JSON (minúsculas, guiones, sin espacios).

### Paso 4: (Opcional) Agregar hotspot en el mapa

Si la región debe aparecer en el mapa mundial, edita `world-map.html` y agrega un hotspot, y agrega una entrada en la región `mundo` de `champions.json`.

## Eliminar un Filtro

1. Elimina el `<button>` de `champions.html`
2. (Opcional) Elimina la región de `champions.json` si ya no se usa
3. Cambia el `region` de los champions afectados a otra región

## Orden de los Filtros

Los filtros se muestran en el orden en que aparecen en el HTML. Para cambiar el orden, simplemente reorganiza los `<button>` en `champions.html`.

## Notas Importantes

- El filtro "Todos" (`data-filter="all")` siempre debe existir y ser el primero
- No hay límite en la cantidad de filtros
- Si un champion tiene una región que no tiene filtro, no se mostrará al usar filtros (pero sí con "Todos")
- El campo `region` del champion y el `id` de la región en el array `regions` son independientes: uno es para filtrar, el otro para la página de detalle de región
