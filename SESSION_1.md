# Ripe Tomato — Pass 1: Uppstart och resonemang

Detta dokument slår ihop den tekniska sammanställningen av pass 1 (skriven i efterhand utifrån commit-historiken pa `main`) med resonemangen som fördes högt under själva livekodningen (från transkriptionen av forelasningsinspelningen) - för att fånga både **vad** som byggdes och **varför** valen gjordes som de gjordes.

## Vad är projektet?

`ripe-tomato` är ett föreläsningsexempel för 1DV610, byggt med [p5.js](https://p5js.org/) i instansläge och Vite som dev-server/byggverktyg. Enligt README byggs `main` upp stegvis under föreläsningen — startläget finns bevarat som taggen `start-here`.

Detta pass (pass 1) täcker tiden från tomt startprojekt till en statisk scen: himmel, titel, en tomat och en markremsa, samt den `Camera`-klass som konverterar mellan spelets eget koordinatsystem och skärmens pixlar.

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

## Resonemangen bakom pass 1 (från transkriptionen)

Commit-tabellen ovan visar **vad** som hände; transkriptionen av livekodningen visar **varför**. Källäget på [GitHub](https://github.com/1dv610/ripe-tomato/tree/main) bekräftar att slutresultatet följer exakt de namn och värden som diskuteras nedan.

### Från skärmkoordinater till "world space"

Titeltexten låg till en början centrerad mitt på canvasen (p5:s standardläge för `p.text`). Det första magiska talet som dyker upp — en förskjutning på `20` för att flytta upp texten mot toppen — bryts direkt ut till en konstant, med en namnkonvention som formuleras explicit under lektionen: **UPPER\_SNAKE\_CASE** för värden som är bokstavligen skrivna i källkoden vid skrivtillfället (t.ex. `TITLE_TEXT_TOP_DISPLACEMENT`), men **camelCase** för värden som är beräknade uttryck (t.ex. `20 * 2` hade fått ett camelCase-namn, eftersom det då är ett uttryck och inte en ordagrann konstant). Den slutgiltiga koden följer detta rakt av: `TITLE_TEXT_TOP_DISPLACEMENT`, `TOMATO_COLOR`, `GROUND_COLOR`, `GROUND_HEIGHT`, `SCALE` och `DISPLACEMENT` är alla `UPPER_SNAKE_CASE`-namngivna bokstavliga värden.

Därefter upptäcktes ett större problem: tomatens position uttrycktes i ett eget koordinatsystem ("tomat-enheter", där `1` motsvarar tomatens egen höjd/diameter) helt frikopplat från canvasens pixelkoordinater — det klassiska glappet mellan **model-koordinater** och **skärmkoordinater** i spelprogrammering. Lösningen byggdes fram stegvis och delvis genom trial-and-error direkt på skärmen (bland annat via `console.log` för att se vilka värden som faktiskt kom ut), innan den landade i en enda konverteringsfunktion: `convertToCanvasCoordinates(x, y)`, som både skalar (`* SCALE`), förskjuter (`+ DISPLACEMENT`) och flippar y-axeln (world space är y-upp, canvas är y-ner).

Att funktionen också returnerar `scale` väckte tveksamhet i stunden — "det är skumt att få en 3D-koordinat ut" konstaterades under lektionen, eftersom en 2D-koordinatkonvertering rimligen borde returnera bara `{x, y}`. Avvägningen som gjordes där och då (häll fast vid lösningen, men dokumentera kontraktet tydligt i kommentaren) syns direkt i den slutliga koden: JSDoc:ens `@typedef CanvasCoordinates` namnger explicit att returvärdet är `{x, y, scale}`, och `drawTomato`/`drawGround` destrukturerar bara de fält de faktiskt behöver (`{ x, y, scale }` respektive `{ y, scale }`).

### Namnval: `Camera`, inte `CameraView`

När konverteringslogiken bröts ut till en egen klass diskuterades både fil- och klassnamn högt — "Camera view" föreslogs som filnamn innan de landade i det enklare `Camera` för både fil och klass, med motiveringen att den här typen av koordinatkonverterande komponent brukar kallas en "kameraklass" i spelsammanhang. Slutresultatet: `src/js/Camera.js`, `export class Camera`.

### Abstraktionsnivå styr uppdelningen av ritfunktionerna

Bakgrund och titel ritades ursprungligen i en och samma kodrad-grupp. Regeln "håll en abstraktionsnivå per funktion" motiverade uppdelningen i `drawBackground` och `drawTitle`. Ett konkret litet exempel på gränsdragning: den (assistentgenererade) kommentaren för `drawTitle` jämfördes ord för ord med funktionsnamnet för att se om kommentaren röjde en implementationsdetalj (att texten ritas på en "canvas") som hellre bör döljas än läggas till i namnet — den slutliga kommentaren ("Draws the sketch title centered near the top of the canvas") nämner fortfarande "canvas", vilket visar att den här typen av avvägning sällan har ett givet facit.

### Från hårdkodade värden till argument

Tomatens position och storlek låg till en början hårdkodade inuti `drawTomato`. De lyftes ut till parametrar (`centerPositionX`, `centerPositionY`, `diameter`) med motiveringen att positionen och storleken bör gå att styra utifrån — till exempel av tangentbord eller mus i en senare version. I den färdiga koden anropas `drawTomato` från `p.draw` med tre egna, namngivna konstanter (`TOMATO_CENTER_X`, `TOMATO_CENTER_Y`, `TOMATO_DIAMETER`) som argument — samma mönster som diskuterades för `drawTitle`s magiska tal, tillämpat konsekvent.

## Hur koden fungerar just nu

### `src/js/index.js` — skissen

Skriven i p5:s _instance mode_: `sketch = (p) => { ... }` skapas och skickas till `new p5(sketch, ...)`. Endast `p.setup` och `p.draw` hänger på p5-instansen `p`, eftersom det är de enda metoderna p5 själv anropar (`setup` en gång vid start, `draw` en gång per bildruta).

- `p.setup` skapar en 400×400-canvas och instansierar `camera = new Camera(p.height)`.
- `p.draw` anropar fyra lokala helper-funktioner i tur och ordning: `drawBackground()`, `drawTitle()`, `drawTomato(TOMATO_CENTER_X, TOMATO_CENTER_Y, TOMATO_DIAMETER)`, `drawGround()`.
- Helper-funktionerna är vanliga `const`-arrow-funktioner i closuren (inte p5-metoder) och har därför redan tillgång till `p` och `camera` via closure.

### `src/js/Camera.js` — world-space till canvas-space

Skissen resonerar i ett abstrakt "world space" (t.ex. tomatens centrum vid `x=1, y=0.5` med diameter `1`) istället för pixelkoordinater. `Camera.convertToCanvasCoordinates(x, y)` gör om det till canvas-pixlar:

- `canvasX = x * SCALE + DISPLACEMENT` (`SCALE = 100`, `DISPLACEMENT = 10`)
- `canvasY = height - (y + GROUND_HEIGHT) * SCALE` (`GROUND_HEIGHT = 1`) — flippar y-axeln (world space är y-upp, canvas är y-ner) och ankrar `y = 0` i world space ovanför markremsan
- Returnerar även `scale`, som används för att skala world-space-mått (t.ex. tomatens diameter) till pixlar

Returtypen är namngiven som `@typedef CanvasCoordinates` i `Camera.js` och återanvänds i JSDoc för både `drawTomato` och `drawGround` i `index.js`, som båda destrukturerar `{ x, y, scale }` respektive `{ y, scale }` från anropet.

### Vad som ritas

1. **Bakgrund** — himmelsblå (`p.background(135, 206, 235)`), ritas varje bildruta.
2. **Titel** — texten "Ripe Tomato", centrerad nära canvasens topp, förskjuten `TITLE_TEXT_TOP_DISPLACEMENT = 20` pixlar ner från toppen.
3. **Tomat** — röd ellips (`TOMATO_COLOR`) vid world-koordinat `(1, 0.5)` med diameter `1`.
4. **Mark** — grön remsa (`GROUND_COLOR`) längs botten, `GROUND_HEIGHT = 1` world-enhet hög, ritad via samma `Camera`-konvertering vid `(0, 0)`.

## Verktyg och konventioner

- **Vite** — dev-server/bygge, `src` är webbplatsens rot. Alias `@/*` → `src/*` (satt i både `jsconfig.json` och Vite-konfigurationen) används för importer, t.ex. `import { Camera } from '@/js/Camera.js'`.
- **ESLint** (`@lnu/eslint-config` + `eslint-plugin-jsdoc`) — kräver JSDoc med beskrivning, `@param` (namn + typ) och `@returns` (typ) på alla klasser, funktionsdeklarationer och arrow-funktioner. Bindestreck före parameterbeskrivning är avstängt i regelupppsättningen, och projektet har nu konsekvent valt bort dem.
- **Prettier** / **Stylelint** — formatering av JS respektive CSS.
- **Vitest** — testramverk finns konfigurerat (`npm test`, `npm run test:run`) men inga testfiler finns ännu i `src`.

## Öppna trådar

- Ingen interaktivitet eller spelmekanik än — bara statisk rendering av bakgrund, titel, tomat och mark.
- Inga tester skrivna ännu för `Camera` eller skissen.
- **Nästa livekodningspass** aviserades i slutet av inspelningen: ritkoden ska bryta ut till en egen vy-klass (`Camera` blir sannolikt grunden för, eller kompletteras av, en `View`), och tomatens tillstånd (position, storlek) ska flyttas till en egen modellklass — en riktig model/view-uppdelning börjar alltså ta form i pass 2.

## Källor

- Kod och commit-historik: [github.com/1dv610/ripe-tomato](https://github.com/1dv610/ripe-tomato/tree/main), verifierat mot `src/js/Camera.js`, `src/js/index.js` och repots egen första version av denna fil, `SESSION_1.md`.
- Transkription av föreläsningsinspelningen "Funktioner och Livekodning" (2026-09-18), livekodningsavsnittet.
