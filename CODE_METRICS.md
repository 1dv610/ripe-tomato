# Vad kodmetriker säger om Ripe Tomato

> [!NOTE]
> Analysen bygger på en automatisk mätning av grenen `spike/alt-mvc`. Varje mätvärde som sticker ut är kontrollerat mot koden. Frågan är vad metrikerna ger i kombination med koden: vilka brister de visar, vilka de missar och vilka slutsatser som håller.

Metriker säger var det är värt att titta, inte vad man hittar där. En siffra som ser dålig ut kan ha en bra förklaring, och en siffra som ser bra ut kan dölja ett verkligt problem. Ripe Tomato har exempel på båda.

## Mätvärdena

| Mått | Produktionskod | Testkod |
| --- | ---: | ---: |
| Filer | 19 | 16 |
| Kodrader | 620 | 677 |
| Kommentarsrader | 742 | 112 |
| Funktioner | 84 | 151 |
| Cyklomatisk komplexitet (CC), snitt | 1,5 | 1,2 |
| CC, högsta | 6 (`Bird.js:41 constructor`) | 10 (`levels.test.js:35 playFrame`) |
| Funktioner med CC över 10 | 0 | 0 |
| Längsta funktion | 22 rader (`HudView.js:45 draw`) | 22 rader (`game.spec.js:20`) |
| Kontrollstrukturer | 31, alla `if` | 16, varav 11 `for` |
| `try` | 0 | 0 |

Övrigt: 14 exporterade klasser, 25 exporterade metoder, 4 exporterade funktioner, 1,09 rader testkod per rad produktionskod, 79 % av kommentarerna är dokumentationskommentarer (JSDoc). README täcker 12 % av det publika API:t och saknar enligt mätningen ett avsnitt om användning.

### Cyklomatisk komplexitet

Cyklomatisk komplexitet (CC) räknar hur många oberoende vägar som går genom en funktion: antalet beslutspunkter plus ett. Beslutspunkter är `if`, `else if`, loopar, `case`, `catch`, `?:` och de logiska operatorerna `&&`, `||` och `??`. Verktygen skiljer sig lite åt i vad de räknar. En funktion utan förgreningar har CC 1.

Måttet är intressant av två skäl. Det anger hur många testfall som krävs för att gå igenom varje oberoende väg, och funktioner med hög CC har i studier visat sig innehålla fler fel. En vanlig gräns är 10.

CC ser däremot inte vad ett villkor gör. En kontroll som avbryter direkt räknas lika som en förgrening som leder till olika beteenden. Måttet ser inte heller nästling, eftersom tre `if` i rad och tre `if` i varandra ger samma värde. Det ser inte komplexitet som flyttats ut ur funktionen: när varje hinder har sin egen `collidesWith` i stället för att `Game` frågar vilken sorts hinder det är, eller när `ObstacleView` slår upp ritfunktionen i en `Map` i stället för en `switch`, sjunker CC utan att logiken försvinner. Låg CC per funktion säger därför inget om hur komplext hela systemet är.

## Vad som stämmer direkt

Låga värden går att lita på utan att läsa koden. De säger att det inte finns något som larmar, och det stämmer här.

- **Låg komplexitet.** I snitt 1,5 vägar genom en funktion och ingen funktion i produktionskoden över 6. Funktionerna är i snitt cirka 7 rader och filerna cirka 33 rader.
- **Platt kontrollflöde.** Produktionskoden har inga loopar. Där spelet går igenom hindren används arraymetoder, till exempel `forEach` och `some` i [Game.js](src/js/models/Game.js) och `forEach` i [GameView.js](src/js/views/GameView.js).
- **Den längsta funktionen är kort.** `HudView.draw` är 22 rader men har CC 2. Raderna är en rak följd av p5-anrop (färg, textjustering, textstorlek, text) för tre texter.

## Mätvärden som sticker ut, kontrollerade mot koden

Sex mätvärden sticker ut. Ett av dem pekar på en verklig brist, ett pekar delvis rätt och fyra är falska larm.

| Mätvärde | Vad koden visar | Bedömning |
| --- | --- | --- |
| README täcker 12 % av API:t och saknar användningsavsnitt | README beskriver ett annat projekt än det som finns | Verklig brist, men av andra skäl än måttet |
| Fler kommentarsrader än kodrader | De flesta raderna är JSDoc-struktur som lintregler kräver | Delvis: några upprepningar |
| CC 6 i `Bird`-konstruktorn | Kontroll av argumenten | Falskt larm |
| CC 10 i `playFrame` | En spelare i testet, inte testets kontroll | Falskt larm |
| 0 `try` | Fel kastas på 16 ställen och ska inte fångas | Falskt larm |
| 1,8 metoder per klass | Getters räknas inte, klasserna har beteende | Falskt larm |

### README: verklig brist

Måtten passar inte en app. API-täckningen förutsätter ett bibliotek, men ingen ska anropa `Bird` utifrån. Användningsavsnittet finns också: [Kom igång](README.md#kom-igång) beskriver hur man startar spelet, men mätningen känner inte igen den svenska rubriken.

Ändå pekar siffrorna mot rätt fil, för README beskriver inte längre projektet:

- Den säger att repot "medvetet ingen färdig spelkod" innehåller. Grenen innehåller ett helt spel.
- Projektstrukturen visar bara `src/js/index.js`. Mapparna `models/`, `views/` och `controllers/`, testerna och designdokumenten saknas.
- Importexemplet `import { Player } from './model/Player.js'` med uppmaningen att alltid använda relativa sökvägar säger emot koden, som använder aliaset `@/` och mappen `models/`.
- Hur man spelar står ingenstans. Kontrollerna visas bara i spelet, i `HudView`.

README skrevs för startpunkten (taggen `start-here`) och har inte följt med när koden växte. Det är den enda bristen i genomgången som kan vilseleda någon som öppnar repot. Måtten träffade rätt fil av fel skäl: de hade gett samma värden för en README som var korrekt.

### Kommentarerna: delvis

742 kommentarsrader mot 620 kodrader ser ut som kommentarer som upprepar koden. Två saker förklarar det mesta.

För det första kräver kursens lintkonfiguration (`@lnu/eslint-config`) JSDoc med beskrivning, `@param` och `@returns` med typer. Projektet är JavaScript, så typerna i JSDoc är det enda som ger editorn typinformation.

För det andra består de flesta raderna av struktur, inte text. En ungefärlig uppdelning av produktionskoden, räknad med textsökning:

| Typ av rad | Antal |
| --- | ---: |
| Rader med bara `/**` eller `*/` | ca 250 |
| Tomma rader inuti JSDoc (` *`) | ca 90 |
| `@param`, `@returns`, `@throws` och `@type` i block | ca 155 |
| Enradiga `/** @type {...} */` | ca 57 |
| `@typedef` | ca 28 |
| Vanliga `//`-kommentarer | ca 13 |
| **Kvar: beskrivande text** | **högst ca 150** |

Ungefär 150 rader beskrivande text på 84 funktioner är under två rader per funktion.

Upprepningar finns ändå. "Creates a heads-up display." på `HudView`-konstruktorn och `@returns {number} The height.` på en getter som heter `height` säger inget som namnet inte redan säger. Andra kommentarer tillför det namnet inte kan säga: enheten ("in tomatoes"), vad som kastas och varför, och `//`-kommentarerna i [index.js](src/js/index.js) som förklarar varför tangentbordet nollställs när fönstret tappar fokus. Antalet rader skiljer inte på de två sorterna. Det gör bara läsningen.

### Bird-konstruktorn: falskt larm

Förgreningar i en konstruktor brukar betyda att den gör mer än att initiera. Här gör den inte det:

```js
constructor(x, baseY, amplitude, period) {
  super(x, Bird.#WIDTH)

  if (!Number.isFinite(baseY) || !Number.isFinite(amplitude) || !Number.isFinite(period)) {
    throw new TypeError('baseY, amplitude and period must be finite numbers.')
  }
  if (amplitude < 0) {
    throw new RangeError('amplitude must not be negative.')
  }
  if (period <= 0) {
    throw new RangeError('period must be a positive number.')
  }

  this.#baseY = baseY
  this.#amplitude = amplitude
  this.#period = period
}
```

De tre `if` och de två `||` ger tillsammans CC 6. Allt är kontroll av argumenten, och den hör hemma just i konstruktorn: ett objekt som inte går att skapa i ett ogiltigt tillstånd behöver aldrig kontrolleras igen. Att flytta ut kontrollerna till en hjälpfunktion sänker siffran men inte komplexiteten.

CC räknar varje villkor lika, oavsett om det är en kontroll som avbryter direkt eller en förgrening som leder till olika beteenden. Den skillnaden ser bara den som läser koden.

### playFrame: falskt larm

Förgreningar i testkod brukar göra testet svårt att lita på. `playFrame` i [levels.test.js](src/js/models/levels.test.js) har CC 10, men funktionen är inte en kontroll utan en spelare: den springer, hoppar framför lådor och gropar och väntar framför fåglar. Själva kontrollen i testet är rak: efter högst en minut ska spelet vara vunnet.

Det avgörande är åt vilket håll ett fel i spelaren slår. En spelare med en bugg kan bara misslyckas med att vinna, och då blir testet rött. Den kan inte få testet att bli grönt för en nivå som inte går att klara.

De 11 `for`-looparna i testkoden stegar fram ett antal bildrutor i simuleringen, utom två som går igenom pixlarna på canvasen i e2e-testet. Det är vad spelloopen också gör.

### Noll try: falskt larm

Noll `try` betyder att ingen kod fångar fel, inte att fel inte hanteras. Produktionskoden kastar fel på 16 ställen i 7 filer: konstruktorer och metoder i `Game`, `Tomato`, `Obstacle`, `Bird`, `Crate`, `Camera` och `ObstacleView` kontrollerar sina argument och avbryter direkt vid ogiltiga värden.

Att inget fångar felen är rätt. Ett ogiltigt argument här är ett programmeringsfel, inte något en spelare kan orsaka, och ett `try` skulle bara dölja det. Spelet har ingen extern indata som kan vara felaktig: nivån byggs i kod i [levels.js](src/js/models/levels.js), och tangenter och musklick översätts av kontrollerna till ett fåtal giltiga kommandon.

Måttet räknar bara den ena halvan av felhanteringen. Antalet `throw` hade sagt mer.

### Få metoder per klass: falskt larm

25 exporterade metoder på 14 klasser låter som klasser som mest bär data. Mätningen räknar dock inte getters, och produktionskoden har 19 sådana. Modellklasserna har dessutom beteende: `Bird` beräknar sin position i `y`, flyttar sig i `update` och avgör kollisioner i `collidesWith`. Varje hinder bestämmer själv vad en kollision betyder, så `Game` behöver aldrig fråga vilken sorts hinder det är. Små klasser med få metoder är här ett resultat av att ansvaret är uppdelat.

## Vad metrikerna missar

**Om innehållet stämmer.** Den största bristen, en README som beskriver ett annat projekt, syns inte i något mått. Mätningen räknar rubriker, kodexempel och nämnda namn, men kan inte jämföra det som står med det som finns.

**Var testerna finns.** 1,09 rader testkod per rad produktionskod säger hur mycket test det finns, inte vad som testas. Vyerna `GameView`, `HudView` och `TomatoView` saknar enhetstester. E2e-testerna täcker en del av dem genom att läsa pixlar på canvasen: tomaten hittas på sin röda färg och banderollen på sin mörka ton. Procenttalet och kontrolltexterna kontrolleras inte alls.

**Om designen hålls.** Projektets viktigaste kvalitetsegenskap är beroenderiktningen från [MVC_DESIGN.md](MVC_DESIGN.md): modellen känner inte till vyn, kontrollerna eller p5. Ingen siffra ovan säger om den följs. Det gör i stället lintkonfigurationen i [eslint.config.js](eslint.config.js), som förbjuder modellen att importera p5, vyer eller kontroller, att läsa klockan och att använda `Math.random`, och som förbjuder vyerna att anropa modellens kommandon. Se [ENFORCING_DESIGN_WITH_TOOLS.md](ENFORCING_DESIGN_WITH_TOOLS.md).

**Om koden gör rätt.** Låg komplexitet och korta funktioner säger att koden är lätt att läsa, inte att den är korrekt. Det avgör testerna.

**Om koden är läsbar.** Magiska tal, långa rader med sifferargument och funktioner uppdelade i sektioner ger varken högre komplexitet eller längre funktioner. En genomläsning mot Clean Code hittar dem, se [CLEAN_CODE_REVIEW.md](CLEAN_CODE_REVIEW.md).

## Slutsatser

1. **Låga värden går att lita på, höga värden måste läsas.** Att ingen funktion har hög komplexitet stämmer och kräver ingen kontroll. Av de sex värden som stack ut var fyra falska larm när koden lästes.
2. **CC ser inte vad ett villkor gör.** Kontroller som avbryter direkt räknas som förgreningar. En konstruktor som kontrollerar sina argument får därför högre CC än en som inte gör det, fast den är bättre.
3. **Kvoter speglar projektets regler.** Antalet kommentarsrader beror mer på vad lintkonfigurationen kräver än på hur utförligt någon skriver. Ett mått som jämför kommentarer med kod behöver läsas mot de reglerna.
4. **Dokumentationsmåtten är byggda för bibliotek.** API-täckning och användningsavsnitt säger lite om en app, och ett mått som letar efter vissa rubriker missar andra språk.
5. **De viktigaste bristerna kräver läsning.** En inaktuell README, otestade vyer och om designen hålls går inte att räkna fram. Metrikerna pekade ut README, men av fel skäl.

Metrikerna fungerar alltså bäst som ett första urval: de visar var det är värt att läsa, och de bekräftar att resten inte larmar. Bedömningen kräver koden.

## Åtgärder, i prioritetsordning

1. **Skriv om README för grenen.** Beskriv vad spelet är, hur man spelar, den faktiska mappstrukturen, aliaset `@/` och var designdokumenten finns. Behåll hänvisningen till `start-here` för den som vill börja om.
2. **Stickprova JSDoc-beskrivningarna.** Skriv om de som bara upprepar namnet, så att de säger något namnet inte kan: enhet, giltiga värden eller varför. Ta inte bort dem, lintkonfigurationen kräver dem.
3. **Överväg ett test av HUD-texten**, till exempel med en p5-attrapp som spelar in anropen till `text`. Det är billigt men skyddar bara mot ett litet fel, så det kan också vänta.

Ingen åtgärd behövs för `Bird`-konstruktorn, `playFrame`, avsaknaden av `try` eller antalet metoder per klass.
