# Ripe Tomato — Pass 3: Game, GameController och top-down-design

Detta dokument slår ihop den tekniska sammanställningen av pass 3 (skriven i efterhand utifrån commit-historiken på `main`, från och med `9e5c138`) med resonemangen som fördes högt under själva livekodningen (från transkriptionen av föreläsningsinspelningen) - för att fånga både **vad** som byggdes och **varför** valen gjordes som de gjordes.

## Utgångsläge

Pass 2 slutade med en `GameView` som ritade scenen, en `Tomato`-modell som ännu inte användes och en skiss som höll tomatens position i ett vanligt `{x, y}`-objekt och flyttade den en tomat per bildruta (se [SESSION_2.md](SESSION_2.md), taggen `session-2`).

Pass 3 tar modellen i bruk och ger koden en första MVC-struktur för spelloopen: `Tomato` blir `GameCharacter`, en ny modell `Game` håller spelets tillstånd, en `GameController` driver varje bildruta och en `Input` abstraherar inmatningen. Inför passet bytte Mats och Daniel roller: Mats kodade och Daniel navigerade.

## Tidslinje

### 2026-10-09 — föreläsningspass (incheckat direkt efter passet)

| Tid   | Commit    | Vad hände                                                                                                                                                                                       |
| ----- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16:13 | `9e5c138` | `Tomato` byter namn till `GameCharacter` (fil och klass). Den saknade argumentvalideringen noteras som en `TODO`                                                                                |
| 16:13 | `daea4dc` | `Game` (karaktären och markens höjd), `GameController` och `Input` läggs till. Markdetektering och inmatning är stubbar med `TODO`                                                              |
| 16:13 | `84ef089` | `p.draw` delegerar till `GameController.update`, och `GameView` får `Game` i konstruktorn och läser karaktären och markens höjd därifrån i stället för att ta emot dem som argument till `draw` |
| 16:13 | `01226af` | Bakgrundsfärgen för en inaktiv statusrad sätts i `.vscode/settings.json`                                                                                                                        |

### 2026-10-09 — uppstädningspass

| Tid   | Commit    | Vad hände                                                                                                                                                                                                                                                     |
| ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16:25 | `3883cdf` | `GameCharacter` validerar sina argument med `Number.isFinite` (`TypeError`) och kräver en positiv diameter (`RangeError`). En `typeof`-kontroll hade släppt igenom `NaN`                                                                                      |
| 16:25 | `3a4295d` | Koden kraschade på första bildrutan: `Input` skickades aldrig till `GameController`, den privata gettern `#isGameCharacterOnGround` anropades som en funktion och `GameCharacter` saknade `jump`. Input skickas nu in, och själva hoppet lämnas som en `TODO` |
| 16:25 | `7ac3595` | JSDoc-typer för `GameController`, `GameView` och `Input`                                                                                                                                                                                                      |

## Resonemangen bakom pass 3 (från transkriptionen)

Commit-tabellerna ovan visar **vad** som hände; transkriptionen av livekodningen visar **varför**.

### En gemensam bild av arkitekturen

Mats inledde med sin bild av problemet med att programmera i par utan gemensam design: de kan enas om variabelnamn och klassnamn, men utan en gemensam bild av arkitekturen vet han inte vad Daniel vill bygga. Ett förslag som `CoordinateConverter` kan visa sig bortkastat när man inte känner till helheten. Det handlar alltså om mer än kod. Klassdiagram, sekvensdiagram och en beskriven arkitektur behövs innan det blir effektivt att prata kod.

### Två bilder av MVC i p5.js

Mats ritade upp sin syn på MVC i p5.js: p5:s huvudloop anropar `draw` ungefär 60 gånger per sekund, och händelser som `mousePressed` och `keyPressed` landar i p5-loopen och skickas därifrån till kontrollern, som uppdaterar modellen. Vyn läser från modellen och ritar.

Daniel såg inte synsätten som oförenliga. För honom har p5 i sig vy-egenskaper, eftersom det både skapar output och hanterar input, och han ville ha ett mellanlager för input.

**MVC:s ursprung.** Mats beskrev Daniels spelvariant som närmare det ursprungliga mönstret. I det ursprungliga MVC från Smalltalk-80 var det dock kontrollern som tog emot användarens input från mus och tangentbord, medan vyn läste direkt från modellen och notifierades om ändringar (i princip Observer-mönstret). Båda synsätten har alltså rötter i originalet.

### Från `Tomato` till `GameCharacter`

Passet började med refaktorering. `Tomato` döptes om till `GameCharacter`: en ny programmerare förstår direkt vilken karaktär spelaren styr (jämför "don't be cute"). Namnet `diameter` lyftes fram som bra, eftersom `size` lämnar öppet om det är radien eller diametern.

Konstruktorn borde validera att koordinaterna är tal och att diametern är större än noll. Under passet blev det en `TODO` (`9e5c138`). I uppstädningen (`3883cdf`) implementerades valideringen med `Number.isFinite`, eftersom `typeof NaN` är `'number'` och `NaN <= 0` är `false`, så en `typeof`-kontroll hade släppt igenom `NaN`. En diameter som inte är positiv ger ett `RangeError`.

**Ska tomaten känna till sin egen färg?** Daniels svar: modellen kan hålla en _logisk_ färg (till exempel "röd"), som vyn översätter till en specifik RGB-färg, en gråskala på en svartvit skärm eller en sprite. En RGB-färg hör däremot inte hemma i modellen. I koden ligger färgen fortfarande enbart i vyn (`TOMATO_COLOR` i `GameView.#drawTomato`).

### `Game`: en modell för spelets tillstånd

`GameView` tog tidigare emot tomatens position och diameter som separata argument. Nu skickas hela `GameCharacter`-objektet till `#drawTomato`, och omvandlingen till primitiva värden sker vid gränsen mot p5. Mats föreslog destrukturering för att visa vilka tre egenskaper som används, men duck typing räckte här.

En ny modellklass, `Game`, fick ansvaret för spelets aktuella tillstånd. Ett nytt spel ger ett nytt `Game`-objekt, med en ny `GameCharacter` på startpositionen. `Game` injiceras i `GameView`s konstruktor, så att `draw` inte längre behöver några argument och vyn själv läser karaktären via en getter.

- **Privacy leak.** Mats påpekade direkt att gettern `gameCharacter` returnerar en referens till ett privat fält, så vyn skulle kunna ändra objektet. Det dokumenterades i en kommentar i stället för att lösas (samma avvägning som i pass 2).
- **Markens höjd är en spelregel.** Den låg som en konstant i vyn men flyttades till `Game` (`groundHeight`), kanske senare till en `Level`.
- **Modellen känner inte till vyn.** Ska något visuellt hända på grund av något i modellen, som ketchup som sprutar när tomaten slår i marken, kan Observer-mönstret (en listener) användas som indirektion.

### `GameController` och top-down-design

För att tomaten ska kunna röra sig tillkom en `GameController` med en `update`-metod som anropas från `p.draw`. Kontrollern får `Game`, `GameView` och en `Input` via konstruktorn. Namnet valdes med tanke på framtiden: en meny får en `MenuController`, ett kartläge en `MapController` och så vidare.

Daniel designade **top-down**: han skrev anrop till klasser och metoder som ännu inte fanns, på hög abstraktionsnivå, och lät implementationen komma senare:

```js
if (this.#input.playerWantToJump()) {
  this.#game.jump()
}
```

- **`Input`** placerades bland vyerna och returnerar tills vidare alltid `true`, med en `TODO` om tangentbord, mus och liknande. Därmed skjuts beslutet om hur input ska hanteras upp, oavsett plattform. Mats frågade varför `GameView` har suffixet `View` men inte `Input`. Daniels svar: `GameView` är spelets "master view", medan `Input` bara abstraherar inmatningen.
- **`Game` avgör om karaktären får hoppa,** eftersom bara den känner till både karaktären och marken. Det sker via en privat getter, `#isGameCharacterOnGround` (Mats valde `is`-prefixet för en boolesk egenskap).

Mats frågade om top-down-kodning inte bara är ett tecken på att designarbetet inte är gjort. Daniel menade att han har en domänmodell i huvudet efter att ha skrivit flera spel, men höll med om att en regel som "man måste vara på marken för att hoppa" (i vissa spel finns double jump) är ett beslut som borde ha kommunicerats först. Diskussionen knyter tillbaka till passets inledning: det som för den ena är en självklar domänmodell är för den andra en oväntad designregel.

### Ett pass som slutar i trasig kod

Passet slutade med kod som inte fungerade: första bildrutan kastade ett fel. Uppstädningen efteråt (`3a4295d`) rättade tre saker:

1. `Input` skapades aldrig och skickades inte till `GameController`, så `this.#input.playerWantToJump()` anropades på `undefined`.
2. Den privata gettern anropades som en funktion, `this.#isGameCharacterOnGround()`, fast en getter läses som en egenskap.
3. `Game.jump` anropade `this.#gameCharacter.jump()`, men `GameCharacter` har ingen `jump`-metod. Anropet är bortkommenterat och själva hoppet återstår som en `TODO`.

Precis som i pass 2 fick uppstädningen bara rätta det som lämnats trasigt och komplettera kommentarer, inte lägga till funktionalitet.

## Hur koden fungerar just nu

### `src/js/index.js` — skissen

- Konstanterna `TOMATO_CENTER_X = 1`, `TOMATO_CENTER_Y = 0.5` och `TOMATO_DIAMETER = 1` används som startvärden för karaktären.
- `p.setup` skapar i tur och ordning `Game` (med en ny `GameCharacter`), `GameView(p, game)`, `Input` och `GameController(game, gameView, input)`. Allt skapas i `setup` eftersom `GameView` behöver en initierad p5-instans.
- `p.draw` anropar bara `gameController.update()`.

### `src/js/controllers/GameController.js` — kontrollern

- `update()` frågar `Input` om spelaren vill hoppa, anropar i så fall `game.jump()` och ritar sedan vyn med `gameView.draw()`.

### `src/js/models/Game.js` — spelets tillstånd

- Håller `GameCharacter` och `groundHeight` (`1`) som privata fält med getters. Gettern `gameCharacter` har en kommentar om privacy leak.
- `jump()` kontrollerar den privata gettern `#isGameCharacterOnGround` (alltid `true` än så länge) men gör ingenting mer.

### `src/js/models/GameCharacter.js` — spelkaraktären

- Centrumposition (`centerX`, `centerY`) och `diameter` (standard `1`) i world space, som privata fält med getters.
- Konstruktorn kastar `TypeError` om något argument inte är ett ändligt tal och `RangeError` om diametern inte är positiv.

### `src/js/views/GameView.js` och `src/js/views/Input.js` — vyerna

- `GameView` tar emot `p` och `Game`, skapar canvasen och sin `CoordinateConverter`. `draw()` tar inga argument och läser karaktären och markens höjd från `Game`.
- `Input.playerWantToJump()` returnerar alltid `true`.

### Vad som ritas

Samma scen som i pass 1 (himmel, titel, tomat och mark). Den bildrutsberoende rörelsen från pass 2 (`tomatoCenterPosition.x++`) är borta, så tomaten står still på startpositionen. Kontrollern anropar `game.jump()` varje bildruta, men hoppet är inte implementerat.

## Verktyg och konventioner

Utöver det som beskrivs i [SESSION_1.md](SESSION_1.md) och [SESSION_2.md](SESSION_2.md):

- **Katalogstruktur:** `controllers/` tillkommer. `Input` ligger i `views/`, eftersom inmatning räknas till gränssnittet mot användaren.
- **Kontrollernamn** följer spelets lägen: `GameController` nu, `MenuController` och `MapController` om de lägena tillkommer.
- **Booleska egenskaper** får `is`-prefix (`#isGameCharacterOnGround`).

## Öppna trådar

- **Hoppet är inte implementerat.** `Input.playerWantToJump()` returnerar alltid `true`, `#isGameCharacterOnGround` returnerar alltid `true` och `GameCharacter` saknar både `jump` och möjlighet att ändra position (bara getters). Det finns heller ingen hastighet eller `update(dt)` i modellen.
- **Regeln "hopp bara från marken"** är införd utan att ha diskuterats som designbeslut (double jump?).
- **Privacy leak i `Game.gameCharacter`** är dokumenterad men inte åtgärdad.
- **Markens höjd är fortfarande definierad två gånger:** `Game.groundHeight` och `CoordinateConverter.#GROUND_HEIGHT_TOMATOES`. Om den ska flyttas vidare till en `Level` är inte avgjort.
- **Färg i modellen eller vyn?** Idén om en logisk färg i modellen är inte genomförd.
- **Observer för modellhändelser** (ketchup när tomaten landar) är bara en idé.
- **Inaktuella namn och kommentarer.** `GameCharacter`s JSDoc talar fortfarande om "a tomato" och "Creates a new Tomato", och `@param diameter` slutar mitt i meningen. Skissens konstanter heter `TOMATO_*`, och JSDoc för `p.setup` säger att den skapar canvasen och konverteraren. `#groundHeight` i `Game` saknar `@type`, och `playerWantToJump` borde grammatiskt heta `playerWantsToJump`.
- **Ingen gemensam arkitekturbeskrivning.** Passets inledande poäng, att klass- och sekvensdiagram behövs innan det blir effektivt att prata kod, är ännu inte omsatt i något dokument.
- **Inga tester** trots att Vitest och jsdom är konfigurerade. `GameView` skapar fortfarande både canvas och konverterare själv.

## Källor

- Kod och commit-historik: [github.com/1dv610/ripe-tomato](https://github.com/1dv610/ripe-tomato/tree/main), commits `9e5c138` till `7ac3595`, verifierat mot `src/js/index.js`, `src/js/controllers/GameController.js`, `src/js/models/Game.js`, `src/js/models/GameCharacter.js`, `src/js/views/GameView.js` och `src/js/views/Input.js`.
- Transkription av föreläsningsinspelningen från pass 3 (2026-10-09), livekodningsavsnittet.
