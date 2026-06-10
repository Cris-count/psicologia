# MIND-SPHERE — Manifiesto de assets isométricos premium

Documento de referencia para conseguir o generar con IA el arte necesario para alcanzar el nivel visual del mockup (campus universitario isométrico HD, iluminación cálida, edificios detallados, personajes animados).

**Pipeline actual:** `pnpm assets:iso` → `public/assets/iso/`  
**Motor:** Phaser 3 + Tiled (orientación `isometric`, tile 128×64)  
**Regla:** Todo vive en el canvas Phaser — sin PNG pegados ni HTML sobre el mapa.

---

## 1. Tilesets necesarios

### 1.1 Tileset base del suelo — `campus-premium`

| Campo | Valor |
|-------|-------|
| **Archivo** | `campus-premium.png` + `campus-premium.tsj` |
| **Ubicación** | `public/assets/iso/tilesets/` |
| **Tamaño por tile** | **128 × 64 px** (diamante isométrico 2:1) |
| **Formato** | PNG RGBA, sin compresión con pérdida |
| **Tiles mínimos** | 9 (actual procedural) → **16–24** recomendado para producción |

| ID | Nombre | Uso |
|----|--------|-----|
| 1–3 | `grass-a/b/c` | Césped con variación (sin patrón obvio) |
| 4 | `path-stone` | Camino principal |
| 5 | `path-edge` | Borde de camino / transición |
| 6 | `plaza-stone` | Loseta plaza central |
| 7 | `water` | Fuentes / charcos decorativos |
| 8 | `garden` | Parterres con flores |
| 9 | `collision` | Solo editor — bloqueo invisible |

**Tiles adicionales para mockup premium (FALTANTES):**

| Tile | Tamaño | Notas IA |
|------|--------|----------|
| `curb-stone` | 128×64 | Bordillo acera |
| `crosswalk` | 128×64 | Paso peatonal |
| `dirt-patch` | 128×64 | Transición césped–tierra |
| `pavement-warm` | 128×64 | Acera plaza |
| `flower-bed-n/s/e/w` | 128×64 | 4 variantes direccionales |
| `shadow-tile` | 128×64 | Sombra proyectada suave (opcional) |

**Prompt IA sugerido (tile):**
> Isometric game tile, 128x64 diamond, top-down 2:1 ratio, hand-painted grass texture, soft green palette, subtle variation, no text, transparent corners, seamless edges, premium mobile game style, warm daylight.

---

## 2. Edificios independientes (sprites grandes)

Cada edificio es un **sprite PNG independiente**, no un tile repetido. Origin en juego: `(0.5, 0.92)` — base del edificio en el suelo.

| ID | Zona | Archivo | Tamaño recomendado | Estado |
|----|------|---------|-------------------|--------|
| `iso-building-hospital` | Hospital | `buildings/iso-building-hospital.png` | **280 × 320 px** | Procedural HD |
| `iso-building-police` | Comisaría | `buildings/iso-building-police.png` | **260 × 300 px** | Procedural HD |
| `iso-building-clinic` | Consultorio ψ | `buildings/iso-building-clinic.png` | **240 × 280 px** | Procedural HD |
| `iso-building-university` | Universidad | `buildings/iso-building-university.png` | **300 × 340 px** | Procedural HD |
| `iso-building-care-center` | Centro de atención | `buildings/iso-building-care-center.png` | **250 × 290 px** | Procedural HD |

**Para igualar el mockup de referencia, reemplazar con:**

- Fachadas ilustradas con ventanas, entradas, señalética legible
- Tejados con volumen y sombras pintadas
- Paleta cálida (crema, ladrillo, vidrio azulado)
- Detalle ψ en consultorio (símbolo discreto en fachada o toldo)
- Universidad: arcos, columnas, banderas
- Hospital: cruz médica, entrada amplia, rampa
- Comisaría: fachada institucional, vehículo policial en zona de parking

**Prompt IA sugerido (edificio):**
> Isometric hospital building sprite, single object on transparent background, 280x320px, hand-painted illustration, warm daylight, detailed windows and entrance, soft drop shadow baked in, premium educational game art, no ground tile included.

---

## 3. Props decorativos por capas

Ubicación: `public/assets/iso/props/`  
Capas Tiled: **Props**, **Nature**, **Lighting**

| Sprite | Tamaño (px) | Capa | Estado |
|--------|-------------|------|--------|
| `iso-prop-fountain` | 120×140 | Props | Procedural |
| `iso-prop-lamp` | 48×96 | Lighting | Procedural |
| `iso-prop-bench` | 80×48 | Props | Procedural |
| `iso-prop-tree-oak` | 96×128 | Nature | Procedural |
| `iso-prop-tree-pine` | 80×120 | Nature | Procedural |
| `iso-prop-bush` | 64×48 | Nature | Procedural |
| `iso-prop-flowers` | 56×40 | Nature | Procedural |
| `iso-prop-fence` | 72×40 | Props | Procedural |
| `iso-prop-statue` | 64×96 | Props | Procedural |
| `iso-prop-entrance-gate` | 200×120 | Props | Procedural |
| `iso-prop-map-board` | 72×88 | Props | Procedural |
| `iso-prop-ambulance` | 100×56 | Props | Procedural |
| `iso-prop-police-car` | 100×56 | Props | Procedural |
| `iso-prop-psi-banner` | 48×80 | Props | Procedural |
| `iso-prop-plant` | 40×56 | Props | Procedural |
| `iso-prop-sign-hospital` | 40×64 | Props | Procedural |
| `iso-prop-sign-police` | 40×64 | Props | Procedural |
| `iso-prop-signpost` | 48×72 | Props | Procedural |
| `iso-prop-books` | 48×40 | Props | Procedural |

**Props FALTANTES para mockup premium:**

| Sprite | Tamaño | Descripción |
|--------|--------|-------------|
| `iso-prop-bus-stop` | 120×100 | Parada con techo de vidrio |
| `iso-prop-bike-rack` | 80×60 | Bicicletero |
| `iso-prop-trash-bin` | 32×48 | Papelera urbana |
| `iso-prop-cafe-table` | 64×56 | Mesa exterior universidad |
| `iso-prop-flag-pole` | 40×120 | Asta con bandera |
| `iso-prop-wheelchair-ramp` | 100×48 | Accesibilidad hospital |
| `iso-prop-parking-sign` | 48×64 | Señal parking |
| `iso-prop-street-sign` | 56×80 | Nombres de calles del campus |
| `iso-prop-bird-flock` | 64×32 | Silueta pájaros (animación opcional) |
| `iso-prop-cloud-shadow` | 256×128 | Sombra de nube móvil (overlay) |

---

## 4. Personajes — sprite sheets

Ubicación: `public/assets/iso/characters/`

### 4.1 Estudiante jugador — `student-sheet.png`

| Campo | Valor |
|-------|-------|
| **Frame** | **48 × 64 px** |
| **Layout** | 4 filas (direcciones) × 7 columnas (frames) |
| **Direcciones** | down, up, left, right |
| **Frames por dir** | 0–2 idle, 3–5 walk, 6 run (o interact) |
| **Formato** | PNG RGBA, fondo transparente |

**Animaciones requeridas:**

| Animación | Frames | FPS |
|-----------|--------|-----|
| `iso-player-idle-{dir}` | 3 | 5 |
| `iso-player-walk-{dir}` | 3 | 10 |
| `iso-player-run-{dir}` | 4 | 14 |
| `iso-player-interact-{dir}` | 1 | — |

**Estado actual:** Silueta procedural con mochila.  
**Para mockup:** Personaje estilo visual novel / RPG premium, ropa casual universitaria, mochila, expresión neutra, proporción ~1:1.3 cabeza-cuerpo.

### 4.2 Gary (guía) — `gary-sheet.png`

| Campo | Valor |
|-------|-------|
| **Frame** | 48 × 64 px |
| **Frames mínimos** | 4 (idle, point, talk, encourage) |
| **Uso** | NPC en capa Phaser — **no** usar cutout `nexa-bust-premium` |

**Animaciones FALTANTES:**

| Animación | Descripción |
|-----------|-------------|
| `gary-idle` | Respiración sutil |
| `gary-point` | Señala objetivo de misión |
| `gary-talk` | Habla (boca/ gesto) |
| `gary-encourage` | Gestos de apoyo |

**Prompt IA:**
> Isometric game character sprite sheet, friendly male psychology guide "Gary", green shirt, 48x64 per frame, 4 directions optional, transparent background, consistent lighting, premium educational game, 4 expression frames horizontal strip.

### 4.3 NPCs ambientales — `npc-sheet.png`

| Campo | Valor |
|-------|-------|
| **Frame** | 48 × 64 px |
| **Variantes** | 4+ personajes (estudiante, docente, visitante, personal salud) |
| **Animación** | idle 2–3 frames por variante (opcional) |

---

## 5. Mapa Tiled

| Campo | Valor |
|-------|-------|
| **Orientación** | `isometric` |
| **Dimensiones** | 44 × 44 tiles (5632 × 2816 px aprox. mundo) |
| **Archivo JSON** | `public/assets/iso/tiled/mind-sphere-campus.iso.json` |
| **Plantilla TMX** | `mind-sphere-campus.iso.tmx` |
| **Guía editor** | `public/assets/iso/tiled/TILED-SETUP.md` |

### Capas

| Capa | Tipo | Función |
|------|------|---------|
| Ground | Tile | Base |
| Paths | Tile | Rutas y plaza |
| Nature | Tile | Jardines |
| Collision | Tile | Pathfinding + física |
| Buildings | Object | Hitboxes + metadata zona |
| Props | Object | Decoración |
| Lighting | Object | Faroles (origen de glow) |
| NPCs | Object | Spawn NPC |
| Interaction | Object | Puertas / zonas E |

---

## 6. Sistemas de juego (ya implementados)

| Sistema | Archivo |
|---------|---------|
| Colisiones | Capa `Collision` + muros estáticos edificios |
| Pathfinding A* | `iso-pathfinding.ts` |
| Interacción puertas | `mission-phaser.iso-scene.ts` |
| Profundidad Y-sort | `iso.depth.ts` |
| Iluminación | `iso-lights.ts` (cielo, viñeta, faroles) |
| Navegación misión | `mission-navigation.ts` |
| Gary en mundo | `iso-gary-npc.ts` |

---

## 7. Estructura de zonas escalable

Definida en `scripts/iso/iso-layout-data.mjs`:

| Zona | `zoneId` | Edificio |
|------|----------|----------|
| Plaza Central | `plaza` | Fuente + bancas (decor) |
| Hospital | `hospital` | `iso-building-hospital` |
| Comisaría | `police` | `iso-building-police` |
| Consultorio Psicológico | `clinic` | `iso-building-clinic` |
| Universidad | `university` | `iso-building-university` |
| Centro de Atención | `care-center` | `iso-building-care-center` |

Para añadir una zona nueva: editar `iso-layout-data.mjs` → `pnpm assets:iso`.

---

## 8. Recursos visuales FALTANTES (checklist producción)

Prioridad **P0** (impacto máximo vs mockup):

- [ ] Tileset ilustrado HD (reemplazar diamantes procedurales)
- [ ] 5 edificios ilustrados con fachadas únicas
- [ ] Sprite sheet estudiante ilustrado (28 frames)
- [ ] Gary ilustrado con 4+ expresiones
- [ ] Árboles y fuente plaza con detalle pintado
- [ ] Faroles con halo de luz baked + glow runtime

Prioridad **P1**:

- [ ] 4 NPCs ambientales distintos
- [ ] Vehículos (ambulancia, patrulla) detallados
- [ ] Señalética campus (mapa, calles, ψ)
- [ ] Partículas: hojas, polvo, reflejos agua fuente
- [ ] Sombra dinámica del jugador (blob suave — ya hay elipse)

Prioridad **P2** (pulido AAA):

- [ ] Animación agua fuente (3–4 frames)
- [ ] Puertas edificios (frame abierto/cerrado)
- [ ] Día/noche ciclo suave (tinte cielo + intensidad faroles)
- [ ] Audio ambiente (pájaros, fuente, campus)

---

## 9. Formatos y convenciones técnicas

| Tipo | Formato | Notas |
|------|---------|-------|
| Tiles / sprites | **PNG RGBA** | Sin JPG; esquinas transparentes en tiles |
| Sprite sheets | PNG + opcional `.json` metadata | Phaser usa `frameWidth`/`frameHeight` |
| Mapa | **Tiled JSON** 1.10 | Tileset embebido o TSJ externo |
| UI HUD | CSS Angular (fuera del mapa) | Paneles misión/energía — permitido |
| Compresión WebP | Solo si se añade loader | PNG es fuente de verdad |
| Nomenclatura | `iso-{tipo}-{nombre}` | kebab-case, coherente con manifest |

### Tamaños de referencia rápida

```
Tile isométrico:     128 × 64
Edificio grande:     240–320 alto
Prop medio:          48–120 alto
Personaje frame:     48 × 64
Mundo 44×44 tiles:   ~5632 × 2816 px
```

---

## 10. Comandos

```bash
# Regenerar todo el pack isométrico
pnpm assets:iso

# Build verificación
pnpm build

# Desarrollo
pnpm dev
```

---

## 11. Comparación: procedural actual vs mockup objetivo

| Elemento | Ahora (`assets:iso`) | Objetivo mockup |
|----------|----------------------|-----------------|
| Suelo | Diamantes HD procedurales | Textura pintada orgánica |
| Edificios | Bloques con tejado simple | Ilustración arquitectónica |
| Personaje | Pixel/silueta 48×64 | Character art consistente con Gary |
| Gary | Sprite verde procedural | Mentor ilustrado integrado |
| Iluminación | Gradiente + faroles runtime | Baked shadows + luces cálidas |
| NPCs | 4 frames silueta | Variantes con idle animado |

Los assets procedurales actuales son **placeholders de pipeline** — la arquitectura ya no depende de Kenney 16px ni cutouts HTML. Sustituir cada PNG en `public/assets/iso/` por arte final mantiene el juego funcionando sin cambios de código.
