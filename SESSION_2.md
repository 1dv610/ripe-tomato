# Ripe Tomato — Pass 2: Från sketch till vy och modell

Detta dokument slår ihop den tekniska sammanställningen av pass 2 (skriven i efterhand utifrån commit-historiken på `main`, från och med `e3a411a`) med resonemangen som fördes högt under själva livekodningen (från transkriptionen av föreläsningsinspelningen) - för att fånga både **vad** som byggdes och **varför** valen gjordes som de gjordes.

## Utgångsläge

Pass 1 slutade med en statisk scen där all ritkod låg i `sketch`-closuren i `src/js/index.js` och en `Camera`-klass konverterade world-koordinater till canvas-pixlar (se [SESSION_1.md](SESSION_1.md), taggen `session-1`).

Pass 2 går från den enfilsskissen till början på en model/view-uppdelning: `Camera` ersätts av `CoordinateConverter`, ritkoden flyttar in i en `GameView`, tomaten börjar röra sig och en första `Tomato`-modell tar form. Passet hölls efter föreläsningen om kommentarer, och flera av föreläsningens teman (varningskommentarer, `TODO`, framtabbade kommentarer, dokumentation utanför koden) syns direkt i koden och i uppstädningen efteråt.

## Tidslinje

### 2026-09-21 — förberedelse: sandlåda och spike

| Tid   | Commit    | Vad hände                                                                                                                                                                                             |
| ----- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14:11 | `e3a411a` | `.sandbox/` läggs i `.gitignore` som personligt kladdutrymme som aldrig checkas in                                                                                                                    |
| 14:18 | `890a3a8` | Spike: `Camera` ersätts av prototypen `CoordinateConverter` från sandlådan, med `worldToCanvas` och `pixelsPerTomato` i stället för `convertToCanvasCoordinates` och `scale`. Samma visuella resultat |

### 2026-09-24 — föreläsningspass: vy och modell (incheckat direkt efter passet)

| Tid   | Commit    | Vad hände                                                                                                                                |
| ----- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 16:07 | `7b41e5b` | `CoordinateConverter` flyttas till `src/js/views/utils/`                                                                                 |
| 16:07 | `51c1644` | Ritfunktionerna bryts ut ur skissen till klassen `GameView`, som också skapar canvasen och äger sin `CoordinateConverter` (markerad WIP) |
| 16:07 | `7485623` | `Tomato`-modellen läggs till med centrumposition och diameter som privata fält med getters (WIP, används inte än)                        |

### 2026-09-24 — uppstädningspass

| Tid   | Commit    | Vad hände                                                                                                                                                                           |
| ----- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16:32 | `258b60d` | Aliaset `@` pekar på `src/js` i stället för `src`, och `GameView` använder aliaset för sin import av `CoordinateConverter`                                                          |
| 16:32 | `60958f5` | `Tomato` dokumenteras med JSDoc                                                                                                                                                     |
| 16:32 | `0d08075` | JSDoc-typer i `GameView` och för skissens konstanter. `p5` och `Tomato` deklareras en gång med `@typedef`, och de svenska `TODO`-kommentarerna från livekodningen ersätts           |
| 16:32 | `781455b` | Namngivningsresonemanget (`Camera` kontra `CoordinateConverter`) tas bort ur källkoden. Commit-meddelandet hänvisar till `SESSION_1.md`, men resonemanget finns i stället här nedan |
| 18:40 | `d31e4e2` | `p5` låses till exakt `2.3.2`, eftersom `2.3.3` publicerades utan sin `types/`-katalog och `import('p5').default` då blir `any`                                                     |
| 18:43 | `2d869d7` | `GameView.draw`s parameter `tomatoCenter` typas som `{x, y}` i stället för `Tomato`, som den faktiskt inte tar emot                                                                 |

### 2026-09-25 — reflektion

| Tid   | Commit    | Vad hände                                                                                                                       |
| ----- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 08:18 | `4dcb7dd` | [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md) läggs till: MVC i request/response (Express) jämfört med en spelloop (p5.js) |

## Resonemangen bakom pass 2 (från transkriptionen)

Commit-tabellen ovan visar **vad** som hände; transkriptionen av livekodningen visar **varför**.

### Refaktorering som start på ett pass

Passet började med en genomgång av commits som gjorts efter pass 1: gemena typnamn i JSDoc, den oanvända `width`, `SCALE` i versaler, alias-importen och ritfunktionerna som av misstag hängde på `p`. Arbetssättet formulerades explicit: först lösa problemet, sedan återvända till koden med nya ögon och rätta intetsägande kommentarer och namn som inte blev bra. Att försöka skriva perfekt kod från början upplevs som ett hinder för problemlösningen.

En refaktorering beskrevs också som ett bra sätt att inleda ett pass: den höjer kvaliteten, men den är också ett sätt att lära känna koden och se var ny kod (en tomat som rör sig, panorering) kommer att få plats.

Två verktygsval motiverades i samma veva. **Alias-importer** (`@/...`) gör att en fil hittar sina beroenden oavsett var i katalogstrukturen den ligger, utan `../../`-kedjor. Redan under passet konstaterades att `@` hellre borde peka på `src/js` än på `src`, vilket sedan gjordes i `258b60d`. **Debuggerinställningarna** i `.vscode/` finns för att brytpunkter ska ersätta `console.log`-spår som annars blir kvar i koden.

### `Camera` blir `CoordinateConverter`

Förslaget kom från sandlådan (`.sandbox/`, som inte checkas in) och provades i en spike-gren innan det togs in i `main`. Resonemanget, som först låg som en blockkommentar i källkoden (borttagen i `781455b`):

- **För tidig namngivning.** `Camera` hade bara en enda metod för koordinatkonvertering. Namnet "kamera" antyder zoom, panorering och linser, alltså funktionalitet som inte finns och kanske aldrig kommer att finnas. Ett namn ska säga vad koden gör _nu_. Med YAGNI som stöd skjuts ett eventuellt namnbyte till `Camera` upp tills klassen faktiskt får det ansvaret.
- **En känd abstraktion.** Konverteringen känns igen från MFC (Microsoft Foundation Classes) och dess `CDC` (device context), med metoder som `LPtoDP`/`DPtoLP` för att gå mellan logiska koordinater och enhetskoordinater. "Bara en konverterare" har alltså länge fungerat som ett eget, namngivet begrepp.
- **`scale` blir `pixelsPerTomato`.** `scale` ansågs för allmänt. `pixelsPerTomato` säger exakt vad talet är, i spelets egen enhet.
- **`convertToCanvasCoordinates` blir `worldToCanvas`,** med enheterna (tomater respektive pixlar) utskrivna i parametrarnas dokumentation och ett `@example` som syns i editorns IntelliSense.

Konstruktorn fick dessutom felhantering (`TypeError`/`RangeError` för en ogiltig höjd). En följd av att skalfaktorn blev en statisk getter är att `worldToCanvas` bara returnerar `{x, y}`. Därmed försvann också den "3D-koordinat" (`{x, y, scale}`) som kändes skum redan i pass 1.

Om spiken: en spike-gren är "död i och med att den skapas", eftersom den bara finns för att undersöka något. Den här gången kunde alla dess commits tas in i `main` rakt av, men det är ovanligt. Oftast är det bättre att cherry-picka det som är värt att behålla. Spike-grenen finns bara lokalt.

### Var hör `CoordinateConverter` hemma?

När ritkoden skulle flyttas till en vy blev frågan var konverteraren ska ligga. Två synsätt ställdes mot varandra, uttryckligen utan att det ena utses till det rätta:

- **Samla lika ansvar på samma ställe** (Mats). I en vykatalog hör bara kod hemma som direkt har med rendering att göra. Konverteraren är en hjälpklass och hör hemma i `utils`.
- **Paketet som en enhet med ett så litet publikt gränssnitt som möjligt** (Daniel). Vyerna kommer att göra mer än att rita (knappar, input, abstraktion av webbläsaren). Klasser som arbetar intimt tillsammans placeras tillsammans, så att ingen utanför behöver känna till dem. En separat `utils` motiveras först när ett andra paket använder konverteraren.

Kompromissen blev `src/js/views/utils/`: konverteraren ligger avskild som hjälpkod men inne i vy-paketet. JavaScript kan inte uttrycka paketsynlighet, så det är katalogstrukturen som får bära avsikten.

### `GameView`: Feature Envy och Information Expert

När ritfunktionerna flyttats till `GameView` anropade skissen fyra metoder i rad på samma objekt (`gameView.drawBackground()`, `drawTitle()`, `drawTomato()`, `drawGround()`). Det pekades ut som **Feature Envy**: koden är mer intresserad av ett annat objekts metoder än av sina egna. Lösningen blev en enda publik `draw`-metod på `GameView`, som är **Information Expert** för hur spelet ritas. De fyra hjälpmetoderna blev privata (`#drawBackground` osv.), och vyns publika yta krympte till en metod. Kohesionen motiverar samlingen: alla metoderna använder samma fält, `this.#p`.

### Dependency injection, in och ut igen

Frågan var om `GameView` ska skapa sin `CoordinateConverter` själv eller ta emot den i konstruktorn:

- Att dölja konverteraren helt stämmer med tanken om ett litet publikt gränssnitt: ingen utanför behöver veta att den finns.
- Att injicera den gör klassen testbar, eftersom ett test då kan skicka in en mockad konverterare. En mellanväg som föreslogs var en parameter med standardvärde (`constructor(p, coordinateConverter = new CoordinateConverter(...))`), ibland kallat "poor man's DI".

Beslutet att injicera "för testningens skull" ansågs viktigt nog att dokumentera i konstruktorns kommentar. I stunden blev det en `TODO` så att tanken inte skulle försvinna. Senare under passet, när canvasen skulle skapas i konstruktorn, togs injektionen bort igen med motiveringen att den var för tidig eftersom det inte finns några tester än. Priset (sämre testbarhet) konstaterades öppet. `TODO`-kommentaren ersattes i uppstädningen (`0d08075`).

En närliggande fråga, **privacy leak**, lyftes men lämnades medvetet: att lagra en referens i ett privat fält hindrar inte den som skickade in objektet från att ändra det. Att åtgärda det kräver kopiering och frågor om vem som äger objektet, vilket inte är motiverat nu.

### p5:s initieringsordning och en kommentar som varning

Efter flytten blev canvasen svart. Orsaken var ordningen: `GameView` skapades på skissens toppnivå, innan p5 var initierat, och konverteraren behöver canvasens höjd. Lösningen byggdes i två steg:

1. `p.createCanvas(400, 400)` flyttades in i `GameView`s konstruktor, före konverteraren, med en kommentar om att canvasen måste finnas innan konverteraren skapas. Den skrevs uttryckligen som en **varning**, inte som en `TODO`: raderna får inte byta plats.
2. `GameView` skapas i `p.setup`, det tidigaste stället där p5-instansen är redo. Därför är `gameView` deklarerad med `let` i skissen. Det här var något man just hade lärt sig, och det fick en förklarande kommentar eftersom någon annars kan frestas att göra den till en `const` högst upp.

Båda kommentarerna är exempel på den sortens information som föreläsningen argumenterade för: den syns inte i koden och den varnar för en "förbättring" som skulle ta sönder något.

### Två `draw`, och var simuleringen hör hemma

En fråga från publiken gällde att det nu finns två `draw` (`p.draw` och `gameView.draw`). `p.draw` styrs av p5 och kan inte döpas om. Vyns metod hade med andra ramverksvanor kunnat heta `update` eller `updateView`. Tanken framåt är att även `createCanvas` och liknande uppsättning hamnar i vyn, medan **simuleringen** (att tomaten rör sig) inte hör till vyn. Tomaten ska bli en styrbar spelkaraktär, alltså affärslogik, och dess förflyttning ska ske i en modell som har en egen `update`.

### Tomaten rör sig och en modell tar form

Tomatens konstanter flyttades upp i skissen och samlades i objektet `tomatoCenterPosition = { x, y }`. `GameView.draw` tar emot det objektet i stället för x och y var för sig, så antalet argument gick från tre till två. Namnet "center" behölls eftersom det är mer precist än "position". Under passet föreslogs också att konstanterna skulle döpas om till startvärden (`TOMATO_START_CENTER_X` osv.), men det gjordes inte.

För att få en animering lades `tomatoCenterPosition.x++` till i `p.draw`. Eftersom enheten är hela tomater försvann tomaten ut ur canvasen nästan direkt.

Därmed fanns det kod som hör hemma i en modell. Alternativen var en `GameModel` som gör allt (risk för mycket kod i en klass) eller att hålla sig till tomatkontexten. Valet blev `src/js/models/Tomato.js` med privata fält och getters. Två frågor om vad tomaten ska känna till:

- **Startposition:** i ett spel med banor (jämför Super Mario) är det troligen banan som vet var tomaten startar, inte tomaten. Det lämnades dock utan åtgärd, eftersom man inte behöver planera så långt framåt nu.
- **Diameter:** hör till tomaten, eftersom enskilda tomater kan vara olika stora även om världen mäts i "tomater". Därför har `Tomato` en `diameter` med standardvärdet `1`.

Passet avslutades medvetet med kod som inte är färdig: det är okej att lämna projektet i ett läge som inte fungerar fullt ut så länge det är tydligt markerat. Därför är `51c1644` och `7485623` märkta WIP. Uppstädningen efteråt fick bara röra kommentarer och sådant som lämnats halvfärdigt, inte lägga till funktionalitet.

### Kommentarerna i praktiken

Föreläsningen före passet handlade om kommentarer, och pass 2 ger konkreta exempel:

- **Framtabbade kommentarer.** Många JSDoc-block tabbades fram under livekodningen för att tysta lintern, och tomma `@param {*}` rättades först i uppstädningen (`60958f5`, `0d08075`).
- **`TODO` som tillfällig markör.** De två svenska `TODO`-kommentarerna fyllde sin funktion under passet och ersattes efteråt, den ena med en varningskommentar och den andra genom att DI-beslutet revs upp.
- **Varningar och sådant som inte syns i koden.** Initieringsordningen i p5 (se ovan).
- **Romanen hör hemma i Markdown.** Det långa namngivningsresonemanget flyttades från `CoordinateConverter.js` till det här dokumentet.
- **Exempel i kommentarer.** `@example` i `worldToCanvas` lyftes fram som något som gör nytta i editorns hovring.

## Hur koden fungerar just nu

Se även [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md), som jämför det här mellanläget med MVC i en Express-app.

### `src/js/index.js` — skissen

- Konstanterna `TOMATO_CENTER_X = 1`, `TOMATO_CENTER_Y = 0.5` och `TOMATO_DIAMETER = 1` (world space, i tomater) och objektet `tomatoCenterPosition`.
- `p.setup` skapar `gameView = new GameView(p)`. Det måste ske här och inte tidigare, eftersom p5-instansen inte är redo förrän `setup` anropas.
- `p.draw` ökar `tomatoCenterPosition.x` med 1 per bildruta och anropar `gameView.draw(tomatoCenterPosition, TOMATO_DIAMETER)`.

### `src/js/views/GameView.js` — vyn

- Konstruktorn tar emot `p`, skapar en 400×400-canvas och därefter sin egen `CoordinateConverter(p.height)`. Ordningen är obligatorisk.
- Den enda publika metoden, `draw(tomatoCenter, tomatoDiameter)`, anropar de privata `#drawBackground`, `#drawTitle`, `#drawTomato` och `#drawGround`.
- `p` används bara här, så ingen annan del av koden anropar p5:s ritfunktioner.

### `src/js/views/utils/CoordinateConverter.js` — world space till canvas space

- `canvasX = x * PIXELS_PER_TOMATO + DISPLACEMENT_PIXELS` (`100` respektive `10`).
- `canvasY = height - (y + GROUND_HEIGHT_TOMATOES) * PIXELS_PER_TOMATO`, där `GROUND_HEIGHT_TOMATOES = 1`. Y-axeln flippas, och `y = 0` hamnar precis ovanför markremsan.
- `worldToCanvas(x, y)` returnerar `{x, y}` (`@typedef CanvasCoordinates`). Skalfaktorn nås via den statiska gettern `CoordinateConverter.pixelsPerTomato`.
- Konstruktorn kastar `TypeError` om höjden inte är ett tal och `RangeError` om den inte är ett positivt heltal.

### `src/js/models/Tomato.js` — modellen (används inte än)

Centrumposition (`centerX`, `centerY`) och `diameter` (standard `1`) i world space, som privata fält med getters. Klassen har inget beroende till p5.

### Vad som ritas

Samma scen som i pass 1 (himmel, titel, tomat och mark), men tomaten flyttar sig en tomat (100 px) åt höger per bildruta och lämnar canvasen efter några få bildrutor.

## Verktyg och konventioner

Utöver det som beskrivs i [SESSION_1.md](SESSION_1.md):

- **Alias** `@/*` → `src/js/*` (i både `jsconfig.json` och `vite.config.js`), t.ex. `import { GameView } from '@/views/GameView.js'`.
- **Katalogstruktur:** `views/` för presentation, `views/utils/` för vyns interna hjälpklasser och `models/` för spellogik utan beroende till p5.
- **`p5` låst till `2.3.2`** (utan `^`) tills typdeklarationerna finns tillbaka i en senare version.
- **JSDoc:** externa typer deklareras en gång per fil med `@typedef {import('p5').default} p5` i stället för inline-`import()` vid varje användning.
- **`.sandbox/`** är ignorerat och används för personliga prototyper. Spike-grenar hålls lokala.

## Öppna trådar

- **Modellen används inte.** Skissen håller fortfarande tomatens tillstånd i konstanter och ett vanligt `{x, y}`-objekt, och `GameView.draw` tar position och diameter var för sig. `GameView` deklarerar en `@typedef Tomato` som inte används längre, och `@param diameter` i `Tomato`s konstruktor slutar mitt i meningen ("in world-space").
- **Rörelsen är beroende av bildfrekvensen.** `tomatoCenterPosition.x++` flyttar en tomat (100 px) per bildruta. Det finns ingen `update(dt)`, och `Tomato` har bara getters, så modellen kan ännu inte flyttas.
- **Konstanterna är startvärden** men heter fortfarande `TOMATO_CENTER_X`/`TOMATO_CENTER_Y`. Om startpositionen hör till tomaten eller till en bana är inte avgjort.
- **Markens höjd är definierad två gånger:** `CoordinateConverter.#GROUND_HEIGHT_TOMATOES` och `GROUND_HEIGHT` i `GameView.#drawGround`.
- **`GameView` är svår att testa.** Konstruktorn skapar canvasen (hårdkodad 400×400) och sin egen `CoordinateConverter`. Dependency injection togs bort som för tidig och får tas upp igen när det finns tester.
- **Inga tester** trots att Vitest och jsdom är konfigurerade.
- **Inaktuella kommentarer i `index.js`.** JSDoc för `p.setup` säger att den skapar canvasen och initierar konverteraren, men båda görs nu av `GameView`. Kommentaren om varför `GameView` skapas i `setup` förklarar ordningen canvas/konverterare, fast skälet är att p5-instansen måste vara redo. `let gameView` saknar JSDoc-typ.
- **Vem äger konverteraren** när inputsidan (musklick) också behöver den, och i omvänd riktning (`canvasToWorld`)? Frågan diskuteras vidare i [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md).

## Källor

- Kod och commit-historik: [github.com/1dv610/ripe-tomato](https://github.com/1dv610/ripe-tomato/tree/main), commits `e3a411a` till `4dcb7dd`, verifierat mot `src/js/index.js`, `src/js/views/GameView.js`, `src/js/views/utils/CoordinateConverter.js` och `src/js/models/Tomato.js`.
- Namngivningsresonemanget för `CoordinateConverter`: den blockkommentar som togs bort i `781455b`.
- Transkription av föreläsningsinspelningen "Kommentarer" (F3, 2026-09-24), livekodningsavsnittet.
