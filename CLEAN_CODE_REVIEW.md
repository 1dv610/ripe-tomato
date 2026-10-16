# Ripe Tomato mot Clean Code

> [!NOTE]
> En genomläsning av produktionskoden på grenen `spike/alt-mvc` mot principerna i Robert C. Martins *Clean Code*. Kapitelhänvisningar och koder som G25 avser boken. [CODE_METRICS.md](CODE_METRICS.md) ställer en annan fråga om samma kod: vad mätvärden kan säga om den.

Koden följer Clean Code väl i det stora. Två saker bryter tydligt mot principerna: magiska tal i vyerna och sifferargument i nivåbeskrivningen. Två brott är medvetna och motiverade: obligatoriska kommentarer och metoder som både frågar och ändrar. Resten är gränsfall.

## Det som följer principerna

**Namn som visar avsikt.** `circleIntersectsRect`, `isOnGround`, `consumeJump`, `createFirstLevel` och `#MAX_TIME_STEP` säger vad de gör utan att man behöver läsa koden. Enheterna står konsekvent i dokumentationen: "in tomatoes", "in seconds", "in pixels".

**Små funktioner på en abstraktionsnivå.** `GameView.draw` läses som en innehållsförteckning, där varje rad är ett steg på samma nivå:

```js
draw = () => {
  this.#camera.follow(this.#game.tomato.x)

  this.#drawSky()
  this.#drawGround()
  // Pits are drawn after the ground, so they show as holes in it.
  this.#game.obstacles.forEach(this.#obstacleView.draw)
  this.#drawFinishLine(this.#game.finishX)
  this.#tomatoView.draw(this.#game.tomato)
  this.#hudView.draw(this.#game)
}
```

**Polymorfi i stället för villkor.** `Game.update` frågar aldrig vilken sorts hinder det är. Varje hinder har sin egen `collidesWith`, och ett nytt hinder kräver ingen ändring i `Game`.

**Inkapsling.** Alla fält är privata. `Game.obstacles` returnerar en kopia, så ingen utanför kan lägga till eller ta bort hinder. `Obstacle` hindrar att den skapas direkt med `new.target`.

**Felhantering med undantag.** Konstruktorer och metoder kastar undantag i stället för att returnera felkoder, och de avbryter direkt vid ogiltiga argument. Ett objekt som inte går att skapa i ett ogiltigt tillstånd behöver aldrig kontrolleras igen.

**Rena gränser mot ramverket.** p5 når bara `index.js` och vyerna. `KeyboardInput` och `PointerInput` tar emot tangentnamn och koordinater som vanliga värden, så kontrollerna kan testas utan p5. Det är kapitel 8 om gränser i praktiken.

**Kommentarer som förklarar varför.** De bästa kommentarerna säger det namnen inte kan säga: varför `#MAX_TIME_STEP` finns ([Game.js:16-23](src/js/models/Game.js#L16-L23)), varför `Obstacle` använder prototypmetoder i stället för pilfunktioner ([Obstacle.js:5-11](src/js/models/obstacles/Obstacle.js#L5-L11)) och varför tangentbordet nollställs när fönstret tappar fokus ([index.js:53](src/js/index.js#L53)).

## Tydliga brott

### Magiska tal i vyerna (G25)

Det tydligaste brottet. Fågelns näbb och vinge ritas så här i [ObstacleView.js:111-114](src/js/views/ObstacleView.js#L111-L114):

```js
p.triangle(x + width * 0.1, y - height * 0.15, x + width * 0.1, y + height * 0.15, x - width * 0.15, y)
p.fill(ObstacleView.#BIRD_COLOR)
p.ellipse(x + width / 2, y, width, height)
p.triangle(x + width * 0.35, y, x + width * 0.75, y, x + width * 0.6, y - height * 0.9)
```

Samma mönster finns på fler ställen:

- [TomatoView.js:50-51](src/js/views/TomatoView.js#L50-L51): stjälkens mått `0.45`, `0.18`, `0.62`, `0.04` och `0.08`.
- [GameView.js:105-114](src/js/views/GameView.js#L105-L114): flaggstångens höjd `3`, flaggans storlek `0.6` och dess bredd `1.4`.
- [HudView.js:51-64](src/js/views/HudView.js#L51-L64): textstorlekarna `20`, `14` och `12` och marginalerna `12`, `16` och `10`.

Kontrasten mot resten av koden är tydlig. I modellen har varje konstant ett namn: `#RUN_SPEED`, `#GRAVITY`, `#DEAD_ZONE`. Vyerna har namn på färgerna men inte på måtten.

Alla tal behöver inte ett eget namn. Proportionerna i en ritad näbb blir inte tydligare av `BEAK_TIP_OFFSET_RATIO`. Men flaggstångens höjd, textstorlekarna och marginalerna är beslut som någon kommer att vilja ändra, och då ska de gå att hitta.

### Sifferargument i nivåbeskrivningen (kap. 3)

Den första nivån beskrivs i [levels.js:24-30](src/js/models/levels.js#L24-L30):

```js
new Crate(6, 1, 1),
new Pit(11, 2),
new Crate(16, 1, 1.5),
new Bird(21, 1.6, 0.9, 2),
```

`new Bird(21, 1.6, 0.9, 2)` är fyra tal i rad. Vad de betyder går bara att ta reda på genom att öppna `Bird`. Clean Code säger att tre eller fler argument kräver en motivering och föreslår ett argumentobjekt:

```js
new Bird({ x: 21, baseY: 1.6, amplitude: 0.9, period: 2 })
```

Det väger tyngre här än någon annanstans, eftersom nivån är den kod som oftast kommer att ändras. Den som justerar svårighetsgraden ska inte behöva läsa konstruktorernas dokumentation.

## Medvetna brott

### Obligatoriska kommentarer (kap. 4)

Clean Code räknar "mandated comments" som en egen sorts dålig kommentar: kommentarer som finns för att en regel kräver dem, inte för att de tillför något. Kursens lintkonfiguration kräver JSDoc med beskrivning, `@param` och `@returns` på varje funktion, och resultatet blir rader som de här i [TomatoView.js:23-28](src/js/views/TomatoView.js#L23-L28):

```js
/**
 * Creates a tomato view.
 *
 * @param {p5} p The p5.js instance.
 * @param {Camera} camera The camera to draw with.
 */
```

Kursens regel och bokens står här mot varandra. Regeln har ett skäl: projektet är JavaScript, och typerna i JSDoc är det enda som ger editorn typinformation. Beskrivningarna kunde ändå säga mer, till exempel att kameran delas med kontrollern.

### Metoder som både frågar och ändrar (kap. 3)

`consumeJump` i [KeyboardInput.js:90](src/js/controllers/KeyboardInput.js#L90) och `consumePress` i [PointerInput.js:84](src/js/controllers/PointerInput.js#L84) returnerar ett värde och nollställer samtidigt ett tillstånd. Det bryter mot principen att skilja kommandon från frågor (Command Query Separation).

Brottet går att försvara. Läsningen och nollställningen måste ske tillsammans: delar man upp dem kan en begäran gå förlorad eller användas två gånger. Det är samma mönster som `pop()` på en stack, och namnet "consume" säger att anropet ändrar något.

### Val av ritfunktion efter typ (G23)

[ObstacleView.js:45-71](src/js/views/ObstacleView.js#L45-L71) slår upp ritfunktionen i en `Map` som har hindrets klass som nyckel. Det är i praktiken en switch på typ, och Clean Code föredrar polymorfi.

Klassens kommentar motiverar valet: med en `draw(p)`-metod på varje hinder skulle modellen bero på p5. Polymorfi hade här kostat designens viktigaste regel, att modellen inte känner till gränssnittet. Valet sker dessutom på ett enda ställe, och ett hinder utan ritfunktion avbryter programmet direkt. Clean Code godtar en switch på typ om den bara finns på ett ställe och resten av koden slipper känna till typerna. Det gäller här.

## Gränsfall

**Sektioner i en funktion.** [HudView.js:45](src/js/views/HudView.js#L45) `draw` består av fyra block åtskilda av tomrader: titel, procent, kontroller och meddelande. Enligt Clean Code är sektioner i en funktion ett tecken på att den gör mer än en sak. `GameView` bryter ut motsvarande delar till `#drawSky`, `#drawGround` och `#drawFinishLine`, men `HudView` gör det inte. Samma kodbas har alltså två stilar.

**Överraskande beteende.** [Tomato.js:61](src/js/models/Tomato.js#L61) gör `this.#x = Math.max(radius, x)`. `new Tomato(0)` ger alltså `x = 0.5`, utan fel och utan att dokumentationen nämner det. Det strider mot principen om minsta förvåning (G2).

**Upprepning (G5).** Samma kontroll av argument, `Number.isFinite` följt av ett `RangeError` om värdet inte är positivt, finns i `Tomato`, `Obstacle`, `Crate`, `Bird` och `Camera`. `consumeJump` och `consumePress` har samma tre rader. Upprepningen är liten, och en gemensam hjälpfunktion skulle göra felmeddelandena mindre exakta. Det är inte självklart att den ska brytas ut.

**Smart kod.** [KeyboardInput.js:81](src/js/controllers/KeyboardInput.js#L81) räknar ut riktningen så här:

```js
return /** @type {-1 | 0 | 1} */ (Number(this.#held.has('right')) - Number(this.#held.has('left')))
```

Uttrycket är kort men kräver en typomvandling och en stunds eftertanke. Två `if` hade varit längre men lättare att läsa.

**Lintundantag.** [Obstacle.js:66](src/js/models/obstacles/Obstacle.js#L66) och [Obstacle.js:76](src/js/models/obstacles/Obstacle.js#L76) stänger av `no-unused-vars` för parametrarna i basklassens tomma metoder. Det är rimligt i en abstrakt klass, men det är undantag från en regel.

## Vad metrikerna inte ser

Inget av de tydliga brotten syns i mätvärdena i [CODE_METRICS.md](CODE_METRICS.md). Magiska tal och sifferargument ger varken högre komplexitet eller längre funktioner. `HudView.draw` med sina sektioner fick godkänt: 22 rader och CC 2. Det enda brottet som syns indirekt är de obligatoriska kommentarerna, genom kvoten mellan kommentarsrader och kodrader, men den kvoten kan inte skilja dem från kommentarerna som förklarar varför.

Metrikerna mäter struktur. Clean Code handlar till stor del om läsbarhet, och den går bara att bedöma genom att läsa.

## Åtgärder, i prioritetsordning

1. **Ge nivåbeskrivningen namngivna argument.** Låt `Crate`, `Pit` och `Bird` ta ett objekt, så att [levels.js](src/js/models/levels.js) går att läsa utan att öppna klasserna.
2. **Namnge måtten i vyerna som någon kommer att vilja ändra:** flaggstångens höjd, textstorlekarna och marginalerna. Låt proportionerna i ritade former vara.
3. **Dokumentera eller ta bort begränsningen av `x` i `Tomato`.** Antingen säger dokumentationen att `x` flyttas in i världen, eller så kastar konstruktorn ett fel som de andra kontrollerna.
4. **Bryt ut sektionerna i `HudView.draw`** till privata metoder, som i `GameView`, så att vyerna har samma stil.

Brotten mot reglerna om kommandon och frågor och om val efter typ kräver ingen åtgärd. Båda är motiverade i koden.
