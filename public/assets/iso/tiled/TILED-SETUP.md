# Tiled — Campus isométrico MIND-SPHERE

## Configuración del proyecto Tiled

1. **Nuevo mapa** → Orientación: **Isométrico**
2. **Tamaño de tile:** 128 × 64 px
3. **Tamaño del mapa:** 44 × 44 tiles (ajustable en `scripts/iso/iso-layout-data.mjs`)
4. **Render order:** Right Down

## Tileset

- Archivo: `../tilesets/campus-premium.tsj`
- Imagen: `../tilesets/campus-premium.png`
- Regenerar: `pnpm assets:iso`

## Capas (orden)

| Capa | Tipo | Uso |
|------|------|-----|
| Ground | Tile | Césped base |
| Paths | Tile | Caminos y plaza |
| Nature | Tile | Jardines |
| Collision | Tile | Bloqueo (invisible en juego) |
| Buildings | Object | Edificios (sprite key en prop `sprite`) |
| Props | Object | Decoración |
| Lighting | Object | Faroles (`kind=lamp`) |
| NPCs | Object | Personajes ambientales |
| Interaction | Object | Zonas de interacción / puertas |

## Propiedades de objetos

- **building:** `sprite`, `zoneIndex`, `label`, `tileX`, `tileY`
- **prop/decor:** `sprite`, `kind`
- **npc:** `sprite`, `role`
- **interaction:** `zoneIndex`, `doorX`, `doorY`, `label`

## Exportar

- Formato: **JSON** (no CSV)
- Archivo destino: `mind-sphere-campus.iso.json`
- Tras editar en Tiled: `pnpm assets:iso` (si cambiaste layout en código) o copiar JSON manualmente.

## Plantilla

Abrir `mind-sphere-campus.iso.tmx` como referencia de capas.
