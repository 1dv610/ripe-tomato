# Pass 1 — Uppstart, en tomat ritas ut

Det här dokumentet sammanfattar vad som gjorts i projektet hittills och hur koden fungerar just nu. Skrivet i efterhand utifrån commit-historiken på `main`.

## Vad är projektet?

`ripe-tomato` är ett föreläsningsexempel för 1DV610 byggt med [p5.js](https://p5js.org/) i instansläge och Vite som dev-server/byggverktyg. Enligt README byggs `main` upp stegvis under föreläsningen — startläget finns bevarat som taggen `start-here`. Se [README.md](./README.md) för fullständig projektbeskrivning och kom-igång-instruktioner.

## Tidslinje

### 2026-09-18 — föreläsningspass: skissen byggs upp

| Tid   | Commit    | Vad hände                                                                              |
| ----- | --------- | -------------------------------------------------------------------------------------- |
| 12:43 | `977f110` | Minimalt startprojekt med p5.js uppsatt, utan spelkod                                  |
| 15:20 | `942cc39` | Bakgrund och titel bryts ut till egna metoder                                          |
| 15:22 | `760e06c` | Tomat-formen läggs till i skissen                                                      |
| 15:22 | `12e25d8` | Marken läggs till i skissen                                                            |
| 16:11 | `3f1cde3` | `Camera` införs för att konvertera world-koordinater till canvas-koordinater           |
| 16:16 | `30c6dcb` | JSDoc-typer i `Camera` städas upp                                                      |
| 16:26 | `68e23ef` | Oanvänd `width` tas bort från `Camera`                                                 |
| 16:28 | `e1e9372` | `scale` byter namn till `SCALE` för konsekvent konstantnamngivning                     |
| 16:30 | `6b54aaa` | Dokumentation förtydligar att `convertToCanvasCoordinates` även returnerar skalfaktorn |
| 16:37 | `6dc2db3` | Importen av `Camera` i `index.js` byter till alias-sökvägen `@/js/Camera.js`           |

### 2026-09-20 — uppstädningspass

| Tid   | Commit    | Vad hände                                                                                                                                                                                                                                                                                                                                     |
| ----- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 07:56 | `c73ab60` | JSDoc-kommentarerna i `Camera` och `index.js` görs idiomatiska: namngiven `@typedef` för returvärdet från `convertToCanvasCoordinates`, `@property` för `Camera.height`, borttagna inkonsekventa bindestreck, och lifecycle-kommentarer på `p.setup`/`p.draw` som beskriver p5:s anropskontrakt istället för att bara upprepa funktionsnamnet |
| 08:06 | `90e19d9` | `drawBackground`, `drawTitle`, `drawTomato` och `drawGround` görs om från `p.xxx`-metoder till lokala `const`-funktioner i `sketch`-closuren, eftersom p5 aldrig anropar dem själv — bara `setup` och `draw` behöver hänga på p5-instansen                                                                                                    |

## Hur koden fungerar just nu

### `src/js/index.js` — skissen

Skriven i p5:s _instance mode_: `sketch = (p) => { ... }` skapas och skickas till `new p5(sketch, ...)`. Endast `p.setup` och `p.draw` hänger på p5-instansen `p`, eftersom det är de enda metoderna p5 själv anropar (`setup` en gång vid start, `draw` en gång per bildruta).

- `p.setup` skapar en 400×400-canvas och instansierar `camera = new Camera(p.height)`.
- `p.draw` anropar fyra lokala helper-funktioner i tur och ordning: `drawBackground`, `drawTitle`, `drawTomato(...)`, `drawGround`.
- Helper-funktionerna är vanliga `const`-arrow-funktioner i closuren (inte p5-metoder) och har därför redan tillgång till `p` och `camera` via closure.

### `src/js/Camera.js` — world-space till canvas-space

Skissen resonerar i ett abstrakt "world space" (t.ex. tomatens centrum vid `x=1, y=0.5` med diameter `1`) istället för pixelkoordinater. `Camera.convertToCanvasCoordinates(x, y)` gör om det till canvas-pixlar:

- `canvasX = x * SCALE + DISPLACEMENT`
- `canvasY = height - (y + GROUND_HEIGHT) * SCALE` — flippar y-axeln (world space är y-upp, canvas är y-ner) och ankrar `y = 0` i world space ovanför markremsan
- Returnerar även `scale` (`SCALE = 100`), som används för att skala world-space-mått (t.ex. tomatens diameter) till pixlar

Returtypen är namngiven som `@typedef CanvasCoordinates` i `Camera.js` och återanvänds i JSDoc för både `drawTomato` och `drawGround` i `index.js`, som båda destrukturerar `{ x, y, scale }` respektive `{ y, scale }` från anropet.

### Vad som ritas

1. **Bakgrund** — himmelsblå (`p.background(135, 206, 235)`), ritas varje bildruta.
2. **Titel** — texten "Ripe Tomato", centrerad nära canvasens topp.
3. **Tomat** — röd ellips vid world-koordinat `(1, 0.5)` med diameter `1`.
4. **Mark** — grön remsa längs botten, `GROUND_HEIGHT = 1` world-enhet hög, ritad via samma `Camera`-konvertering vid `(0, 0)`.

## Verktyg och konventioner

- **Vite** — dev-server/bygge, `src` är webbplatsens rot. Alias `@/*` → `src/*` (satt i både `jsconfig.json` och Vite-konfigurationen) används för importer, t.ex. `import { Camera } from '@/js/Camera.js'`.
- **ESLint** (`@lnu/eslint-config` + `eslint-plugin-jsdoc`) — kräver JSDoc med beskrivning, `@param` (namn + typ) och `@returns` (typ) på alla klasser, funktionsdeklarationer och arrow-funktioner. Bindestreck före parameterbeskrivning är avstängt i regeluppsättningen, och projektet har nu konsekvent valt bort dem.
- **Prettier** / **Stylelint** — formatering av JS respektive CSS.
- **Vitest** — testramverk finns konfigurerat (`npm test`, `npm run test:run`) men inga testfiler finns ännu i `src`.

## Öppna trådar

- Ingen interaktivitet eller spelmekanik än — bara statisk rendering av bakgrund, titel, tomat och mark.
- Inga tester skrivna ännu för `Camera` eller skissen.
