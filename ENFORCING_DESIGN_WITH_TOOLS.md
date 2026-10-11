# Låt verktygen hålla reglerna

Den här texten handlar om var ett designbeslut ska upprätthållas. Ett beslut som "modellen får inte bero på vyn" kan stå i ett dokument, byggas in i koden som skydd som körs varje gång programmet körs, eller kontrolleras av ett verktyg innan koden ens har körts. Valet påverkar hur lätt koden är att läsa, vad den kostar att köra och om regeln faktiskt följs. Därför hör frågan hemma i en kurs om mjukvarukvalitet: en regel som ingen kontrollerar är en önskan, och ett skydd som gör koden svårare att läsa kan kosta mer än det ger.

Exemplen kommer från Ripe Tomato, där arkitekturen beskrivs i [MVC_DESIGN.md](MVC_DESIGN.md). Ett eget avsnitt visar hur slutsatserna ändras i en Express-app, den MVC-variant som jämförs med spelloopen i [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md). Avsnittet om andra språk visar att samma fråga får olika svar beroende på vad språket självt kan uttrycka.

## Problemet: regler som bara finns i ett dokument

En arkitektur består till stor del av regler om vad som får känna till vad. I Ripe Tomato är de viktigaste att modellen inte känner till p5, vyerna eller kontrollerna, och att vyerna läser modellen men aldrig ändrar den. Reglerna är lätta att formulera. De är också lätta att bryta, och det sker sällan på en gång. Någon importerar `p5` i modellen "bara för att få `p.constrain`", eller låter en vy anropa `game.restart()` för att en knapp ska fungera. Var och en av genvägarna verkar ofarlig. Tillsammans kallas resultatet *arkitekturerosion*: strukturen bryts ned så långsamt att ingen märker när den slutade gälla.

### Två reflexer som inte hjälper

Det finns två vanliga reaktioner på risken, och båda har brister.

Den första är att **lita på konvention**. Regeln skrivs ned och förväntas följas, och kodgranskningen ska fånga avstegen. Men granskningar blir inte alltid av, och när de blir av letar granskaren efter mycket annat. En import på rad tre i en fil med hundra rader är lätt att missa.

Den andra är att **bygga in skyddet i koden**. Om vyn inte ska kunna ändra modellen, får den en kopia i stället för modellen. Om ett objekt inte ska ändras, fryses det med `Object.freeze`. Det fungerar, men skyddet körs varje gång programmet körs, och det gör koden längre. I Ripe Tomato skulle det betyda att modellens tillstånd kopieras till nya objekt sextio gånger per sekund. Kostnaden i processortid är liten. Den stora kostnaden är underhållet: varje fält beskrivs nu på två ställen, i modellen och i kopian, och de två måste hållas i takt med varandra.

Det finns ett tredje alternativ: att låta ett verktyg kontrollera regeln.

## Var en regel kan kontrolleras

En regel kan kontrolleras på flera nivåer. De skiljer sig åt i när felet upptäcks och vad kontrollen kostar.

```mermaid
flowchart LR
    L["1. Språket<br/>och typerna"] --> B["2. Bygg-<br/>strukturen"] --> A["3. Statisk<br/>analys"] --> T["4. Tester"] --> R["5. Kontroller<br/>i körande kod"] --> K["6. Konvention<br/>och granskning"]
```

| Nivå | Felet upptäcks | Kostar när programmet körs | Exempel |
| --- | --- | --- | --- |
| 1. Språket och typerna | när koden skrivs eller kompileras | nej | `readonly` i TypeScript, `&T` i Rust |
| 2. Byggstrukturen | när koden byggs | nej | moduler som inte exporterar allt, förbud mot cykler mellan projekt |
| 3. Statisk analys | när koden skrivs, i editorn | nej | ESLint-regler per mapp, arkitekturtester |
| 4. Tester | när testerna körs | nej | ett test som spelar igenom en bana |
| 5. Kontroller i körande kod | när koden körs | ja, varje gång | validering, defensiva kopior, `Object.freeze` |
| 6. Konvention och granskning | om någon ser det | nej | en regel i ett dokument |

Tumregeln är att lägga kontrollen så tidigt i kedjan som språket och verktygen tillåter. Ju tidigare nivå, desto snabbare återkoppling och desto mindre kod som körs i onödan. Nivå 6 behövs alltid, men för det som verktyg inte kan se: om namnen är bra, om ansvaret ligger rätt och om designen håller för nästa krav.

Vilka nivåer som finns att välja på beror på språket. JavaScript har nästan ingenting på nivå 1 och 2, och det förklarar varför frestelsen att skriva defensiv kod är så stor just där.

## Exemplet Ripe Tomato

### Får vyn ändra modellen?

`Game` lämnar ut sina objekt som referenser. `GameView` får tillgång till `game.tomato` för att kunna rita tomaten, och därmed kan den tekniskt sett anropa `game.tomato.jump()`. Det är den sortens läcka som brukar kallas *privacy leak*. Fem sätt att hantera den diskuterades:

| Alternativ | Nivå | Skyddar | Kostar |
| --- | --- | --- | --- |
| Kopior (DTO:er) av modellens tillstånd varje frame | 5 | helt | en andra beskrivning av varje form, mappningskod, nya objekt varje frame |
| `Object.freeze` eller en skrivskyddad `Proxy` | 5 | helt, men först när koden körs | körtid, och fel som upptäcks sent |
| Destrukturering i vyernas parametrar, `draw({ x, y, radius })` | 1–3 | lövvyerna, eftersom de bara får värden | lite, men `GameView` har fortfarande `game` |
| Ett eget ESLint-plugin som förstår typer | 3 | nästan helt | ett eget paket med regelkod och tester att underhålla |
| En `no-restricted-syntax`-regel i den befintliga konfigurationen | 3 | anrop av modellens kommandon från vyer, matchade på namn | några rader konfiguration |

Valet blev det sista alternativet. Det ger inte ett fullständigt skydd. Regeln matchar metodnamn och inte typer, så listan måste hållas i takt med kommandona i `Game`. Men felet den skyddar mot är ovanligt och lätt att se, och regeln kostar nästan ingenting. Arkitekturen ska kosta i proportion till den risk den tar bort, och det gäller även verktygen.

```js
{
  files: ['src/js/views/**/*.js'],
  rules: {
    // Imports can't tell reading the model from changing it, so calls to Game's commands are
    // matched by name. Keep the list in sync with the commands Game exposes.
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression > MemberExpression.callee[property.type='Identifier'][property.name=/^(jump|steer|restart|update)$/]",
        message: 'Views only read the model. Commands are sent by the controller, and time is advanced by the loop.',
      },
    ],
  },
},
```

Selektorn är en AST-selektor, ungefär som CSS för syntaxträdet. Den matchar ett anrop vars mottagare är ett objekt och vars metodnamn är ett av modellens kommandon. `this.#game.jump()` fångas, medan `this.#camera.follow(...)` och privata metoder som `this.#jump()` passerar.

### Beroenderiktningen

Den viktigaste regeln i Ripe Tomato är att modellen inte beror på något utanför sig själv. Den kontrolleras med ESLints inbyggda `no-restricted-imports`, avgränsad till filerna i `models/`:

```js
{
  files: ['src/js/models/**/*.js'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['p5', '**/views/**', '**/controllers/**', '**/index.js'],
            message: 'The model must run without the interface (and in Node, e.g. to verify a score on a server).',
          },
        ],
      },
    ],
  },
},
```

Två detaljer gör regeln användbar. Mönstren är i gitignore-stil och fångar därför både alias-importer (`@/views/GameView.js`) och relativa sökvägar (`../views/GameView.js`). Felmeddelandet förklarar dessutom *varför* regeln finns. När någon bryter mot den får de skälet direkt i editorn, där det behövs, i stället för i ett dokument de kanske aldrig läser.

Samma idé går längre än importer. `no-restricted-globals` förbjuder `window`, `document` och `fetch` i modellen, och `no-restricted-properties` förbjuder `Math.random` och `Date.now`. Det håller modellen fri från webbläsaren, så att den kan köras i Node, och fri från dolda källor till tid och slump, så att den beter sig likadant varje gång. Ingen av reglerna kostar något när spelet körs.

### Pipelinen gör regeln bindande

En linter som bara körs lokalt är en hjälp, inte ett krav. Den som inte kör `npm run lint` märker ingenting. Därför körs samma kontroller i en pipeline, `.github/workflows/ci.yml`, vid varje pull request.

```mermaid
sequenceDiagram
    actor U as Utvecklare
    participant E as Editor
    participant G as GitHub
    participant CI as Pipeline

    U->>E: import p5 from 'p5' i models/Tomato.js
    E-->>U: rödmarkering med regelns förklaring
    Note over U,E: återkoppling inom sekunder

    U->>G: pull request (trots varningen)
    G->>CI: kör lint, formatering, tester och bygge
    CI-->>G: misslyckas på arkitekturregeln
    G-->>U: kan inte slås ihop
```

Det sista steget, att pull requesten inte kan slås ihop, kräver en inställning i GitHub: jobbet måste göras till en obligatorisk statuskontroll i *branch protection* för `main`. Först då är regeln bindande. Den gäller också när ingen granskar.

Det betyder inte att granskningen blir onödig. Den *avlastas*. Det som kan uttryckas som en mekanisk regel kontrolleras varje gång och utan undantag av verktyget. Granskaren behöver inte leta efter den sortens fel och kan i stället ägna sig åt det verktyg inte ser.

## När kontroller i körande kod är rätt

Resonemanget ovan betyder inte att kontroller i körande kod alltid är fel. De är rätt i tre situationer.

**Vid förtroendegränser.** Indata från användare, filer och nätverk kan vara vad som helst, och ingen linter kan veta vad en användare skriver eller vad en server skickar. Sådant måste valideras när programmet körs. Om Ripe Tomato en dag hämtar banor från en server, ska JSON-datat valideras innan det blir domänobjekt.

**I bibliotek som andra använder.** En lintregel skyddar bara den kod den körs på. Den som använder ett bibliotek kör inte bibliotekets linter. Ett bibliotek behöver därför skydda sina invarianter med språkets egna medel, som `#private`, `Object.freeze` och validering av argument, i högre grad än en applikation där all kod är ens egen.

**När säkerhet står på spel.** En lintregel kan stängas av med en kommentar. Den är ett skydd mot misstag, aldrig mot någon som medvetet försöker kringgå den.

Ripe Tomato har exempel på båda sidor av gränsen. `Tomato`s konstruktor kontrollerar att argumenten är ändliga tal och kastar ett `TypeError` annars. Kontrollen körs en gång per objekt och fångar felet där det uppstår, i stället för som ett `NaN` som dyker upp långt senare i ritkoden. Det är billigt och ger mycket. `Game.update(dt)` kontrollerar på samma sätt att `dt` är ett giltigt tal, men den kontrollen körs varje frame, och den enda som anropar metoden är spelets egen loop. Kostnaden är försumbar, men den är svårare att motivera. Den hade kunnat ersättas med ett test av loopen.

## Sammanhanget avgör: spelloop jämfört med Express

Slutsatserna om Ripe Tomato gäller Ripe Tomato. Principen är allmän: kontrollera varje regel på den tidigaste nivå som faktiskt fungerar, och lägg kontroller i körande kod vid förtroendegränserna. Men var förtroendegränserna går beror på vilken sorts applikation det är. I [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md) jämförs MVC i en spelloop med MVC i en Express-app som renderar HTML på servern. Samma jämförelse ger olika svar på frågorna i den här texten.

### Ripe Tomato har nästan inga förtroendegränser

Spelet körs helt i webbläsaren. Den enda indatan är tangentbord och mus, och den kan bara bli några få kända avsikter. Det finns inga hemligheter och ingen data som tillhör någon annan.

Klienten tillhör dessutom användaren. Den som vill fuska kan öppna webbläsarens utvecklarverktyg och ändra hopphastigheten. Inget skydd i klientkoden kan stoppa det. Skydd i körande kod kan alltså bara skydda mot programmerarens egna misstag, och sådana misstag fångas billigare av verktyg. Därför blir slutsatsen för Ripe Tomato så tydlig. Det enda skydd som verkligen behövs, att en highscore inte är fuskad, måste ligga på en server.

### I en Express-app korsar varje request en förtroendegräns

En Express-app tar emot `req.body`, `req.params`, query-strängar och cookies från vem som helst. Då ändras flera av svaren:

| Fråga | Ripe Tomato | Express med serverrenderade vyer |
| --- | --- | --- |
| Förtroendegränser | nästan inga | varje request |
| Kontroller i körande kod | undantag | krav vid gränsen, till exempel med zod, joi eller express-validator |
| Vad en läcka betyder | en vy *kan* anropa `jump()`, vilket är ett designfel | ett modellobjekt med `passwordHash` skickas till klienten, vilket är ett säkerhetsfel |
| DTO:er | en andra beskrivning av samma form, mest underhåll | en säkerhetsåtgärd, både för utdata och för indata |
| Kostnaden för kopior | sextio gånger per sekund, i en inre loop | en gång per request, försumbart jämfört med databasanropen |
| Vydata | vyn läser modellen direkt | `res.render(view, viewData)` bygger redan ett vydataobjekt, eftersom mallen är kortlivad |
| Fler lager | inte motiverat, eftersom spelet saknar I/O | ofta motiverat, eftersom databas och I/O finns från början |
| Klocka och slump injiceras i modellen | för determinism och uppspelning | främst för testbarhet |

### En DTO är ett designval i spelet men ett säkerhetskrav på servern

Det är den viktigaste skillnaden. I Ripe Tomato valdes DTO:er bort, och det var rätt där. Men den som drar slutsatsen att DTO:er i allmänhet är onödiga, och sedan skickar modellobjekt rakt ut från en Express-app, har lärt sig fel sak:

```js
// Sends every field of the document to the client, including passwordHash.
res.json(await User.findById(req.params.id))

// Sends exactly the fields the client may see.
const user = await User.findById(req.params.id)
res.json({ id: user.id, name: user.name })
```

Samma sak gäller åt andra hållet. `User.create(req.body)` låter klienten sätta vilket fält som helst, till exempel `isAdmin`. Det kallas *mass assignment*. Indata ska valideras och plockas fält för fält innan den når modellen. OWASP räknar båda felen, för mycket data ut och okontrollerad data in, till samma risk bland de vanligaste API-riskerna: *API3:2023 Broken Object Property Level Authorization*.

Ingen linter kan avgöra vilka fält som är känsliga. Här är en kontroll i körande kod, i form av en explicit projektion eller ett valideringsschema, rätt nivå.

### Mallmotorn är en kontroll på nivå 1

I en Express-app är vyerna ofta mallar och inte JavaScript, och ESLint kontrollerar dem inte. Då blir valet av mallmotor en arkitekturfråga. En logikfattig mallmotor som Handlebars upprätthåller regeln "vyn läser bara" genom själva språket: mallen kan visa värden, iterera och anropa registrerade hjälpfunktioner, men inte köra godtycklig kod. Sedan version 4.6 blockerar Handlebars dessutom åtkomst till egenskaper på objektens prototyp som standard. EJS tillåter däremot godtycklig JavaScript i mallen, och då vilar regeln återigen på konvention. Det är samma resonemang som i språkjämförelsen nedan, tillämpat på mallspråk: ju mer språket kan uttrycka, desto mindre behöver kontrolleras på annat sätt.

### Det som inte ändras

Beroenderegeln och tekniken för att kontrollera den är desamma. I en Express-app ska modellen inte känna till HTTP, och det kontrolleras med samma regel som i Ripe Tomato:

```js
{
  files: ['src/models/**/*.js'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['express', '**/controllers/**', '**/routes/**', '**/views/**'],
            message: 'The model must not know about HTTP. Controllers translate requests into model calls.',
          },
        ],
      },
    ],
  },
},
```

Arbetsfördelningen mellan verktyg och granskning är också densamma. Skillnaden är att en Express-app har fler regler som *inte* kan kontrolleras av verktyg, eftersom de handlar om vilken data som är känslig och vem som får se den. Det gör granskningen viktigare där, inte mindre viktig.

## Språken gör olika mycket av jobbet

Hur mycket som behöver kontrolleras av verktyg beror på hur mycket språket självt kan uttrycka. Nedan visas samma två regler i några olika språk: att modellen inte får bero på vyn, och att vyn inte får ändra det den läser.

### JavaScript

JavaScript har nästan ingenting på nivå 1 och 2. Privata fält (`#x`) och `Object.freeze` kontrolleras först när koden körs, och modulsystemet låter vilken fil som helst importera vilken annan fil som helst. Därför blir verktygen viktigare än i de flesta andra språk: ESLint för regler per mapp, och JSDoc med `checkJs` för typkontroll i editorn.

För regler som omfattar hela beroendegrafen, till exempel ett förbud mot cykler, finns `dependency-cruiser`. Regler skrivs med reguljära uttryck för sökvägar:

```js
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    {
      name: 'model-depends-on-nothing',
      severity: 'error',
      from: { path: '^src/js/models' },
      to: { path: '^src/js/(views|controllers)' },
    },
  ],
}
```

Verktyget kan också rita beroendegrafen. Då syns arkitekturen som den faktiskt är och inte som man tror att den är.

### TypeScript

TypeScript flyttar mycket av ansvaret till nivå 1. Typerna försvinner vid kompileringen, så de kostar ingenting när programmet körs. Läckan i Ripe Tomato löses utan kopior genom att modellen lämnar ut sitt objekt med en skrivskyddad typ:

```ts
interface TomatoState {
  readonly x: number
  readonly y: number
  readonly radius: number
}

class Game {
  #tomato = new Tomato(1)

  // The view sees only the state. jump() isn't part of the type.
  get tomato(): TomatoState {
    return this.#tomato
  }
}
```

Det är samma referens som förut, men kompilatorn vägrar `game.tomato.jump()`. Skyddet går att kringgå med `as any`, så det är ett skydd mot misstag, precis som lintregeln. Beroenderiktningen kontrolleras däremot inte av typsystemet, så i TypeScript behövs ESLint eller `dependency-cruiser` för den, precis som i JavaScript.

### Java och C#

I Java och C# bär språket och byggsystemet mycket. Åtkomstmodifierare som `package-private` i Java och `internal` i C# döljer klasser utanför sitt paket eller sin assembly. Javas modulsystem exporterar bara de paket som anges i `module-info.java`, och både Java-moduler och C#-projekt kan inte bero på varandra i cykler. Den som delar upp ett C#-program i projekt för modell och vy kan inte låta modellprojektet referera till vyprojektet om vyprojektet redan refererar till modellprojektet. Beroenderiktningen följer då av projektstrukturen.

Det som strukturen inte täcker kontrolleras med *arkitekturtester*, som skrivs som vanliga enhetstester. I Java är ArchUnit vanligast:

```java
@ArchTest
static final ArchRule modelDependsOnNothing =
    noClasses().that().resideInAPackage("..model..")
        .should().dependOnClassesThat().resideInAPackage("..view..");
```

I .NET finns NetArchTest med ett liknande gränssnitt:

```csharp
var result = Types.InAssembly(typeof(Game).Assembly)
    .That()
    .ResideInNamespace("RipeTomato.Models")
    .ShouldNot()
    .HaveDependencyOn("RipeTomato.Views")
    .GetResult()
    .IsSuccessful;
```

Arkitekturtester är etablerad praxis i båda språken. De ger samma sorts kontroll som lintreglerna i Ripe Tomato, men de körs med testerna och syns inte direkt i editorn.

### Python

Python har en uttalad kultur av konvention: ett understreck (`_x`) betyder "privat", men ingenting hindrar någon från att använda fältet. Uttrycket som brukar användas är *"we're all consenting adults"*. Därför ligger kontrollen nästan helt hos verktygen. `mypy` kontrollerar typer, och `import-linter` kontrollerar beroenden med kontrakt i en konfigurationsfil:

```ini
[importlinter]
root_package = ripe_tomato

[importlinter:contract:model]
name = The model must not import the view
type = forbidden
source_modules = ripe_tomato.models
forbidden_modules = ripe_tomato.views
```

Det finns även en kontraktstyp för lager, där tillåten beroenderiktning anges för en hel kedja av moduler i ett svep.

### Go

Go låter kompilatorn bära en del av beroenderiktningen. Importcykler är ett kompileringsfel, så om vyn importerar modellen kan modellen inte importera vyn. Paket i en katalog som heter `internal/` kan bara importeras av kod i delträdet under katalogen ovanför `internal/`, vilket ger paketsynlighet av det slag som JavaScript saknar. Kulturen i Go föredrar dessutom enkel och direkt kod framför skyddande konstruktioner, och verktyg som `go vet` och `staticcheck` tar resten.

### Rust

Rust löser läckan i typsystemet. En referens `&Tomato` är skrivskyddad, och kompilatorn tillåter inga anrop av metoder som kräver `&mut self` genom den. Om vyn får `&Tomato` kan den alltså inte anropa `jump()`, och det kostar ingenting när programmet körs. Det enda undantaget är typer som uttryckligen tillåter ändring genom en delad referens (*interior mutability*, som `Cell` och `RefCell`), och de syns i typen. Synligheten mellan moduler styrs med `pub` och `pub(crate)`, och ett program kan delas upp i flera crates med en beroenderiktning som `cargo` upprätthåller.

### Sammanställning

| Språk | Språket och bygget bär | Verktygen bär | Läckan i Ripe Tomato |
| --- | --- | --- | --- |
| JavaScript | nästan inget | ESLint, `checkJs`, `dependency-cruiser` | konvention plus lintregel |
| TypeScript | skrivskyddade typer | beroenderiktningen | löses i typen |
| Java, C# | synlighet, moduler, inga cykler mellan projekt | ArchUnit, NetArchTest | löses med interface eller oföränderliga typer |
| Python | nästan inget | `mypy`, `import-linter` | konvention plus verktyg |
| Go | inga importcykler, `internal/` | `go vet`, `staticcheck` | konvention |
| Rust | skrivskyddade referenser, synlighet, crates | Clippy | kan inte uppstå |

Mönstret är tydligt: ju mer språket kan uttrycka, desto mindre behövs både verktyg och skydd i körande kod. I JavaScript blir verktygen därför *viktigare*, inte mindre viktiga, eftersom det enda skydd språket erbjuder är det som kostar när programmet körs. Det är också ett argument för att använda JSDoc-typer och `checkJs` även i ett projekt som medvetet inte använder TypeScript.

## Gränserna

Verktyg ersätter inte omdöme, och de har egna kostnader.

- **Heuristiker ger falska larm och missar fel.** Regeln mot kommandoanrop i Ripe Tomato matchar på namn. En vy som av andra skäl anropar en metod som heter `update` får ett falskt larm, och ett nytt kommando i `Game` skyddas inte förrän någon lägger till det i listan.
- **Regler kan stängas av.** En `eslint-disable`-kommentar räcker. ESLint kan rapportera kommentarer som inte längre behövs (`--report-unused-disable-directives`), men själva avstängningen är synlig bara för den som läser koden.
- **Verktygskonfiguration är också kod.** Den ska läsas, förstås och underhållas. En regel för ett fel som aldrig inträffar är lika onödig som ett skydd i koden för samma fel.
- **Verktyg ser bara form, inte mening.** En linter kan se att modellen inte importerar vyn. Den kan inte se att en klass har fått fel ansvar, att ett namn är missvisande eller att en abstraktion inte håller.

Den sista punkten är skälet till att granskningen behövs även när alla mekaniska regler kontrolleras av verktyg. Skillnaden är att granskningen inte längre behöver lägga tid på det mekaniska.

## Sammanfattning

Ett designbeslut kan upprätthållas på flera nivåer: i språket, i byggstrukturen, med statisk analys, med tester, med kontroller i körande kod eller genom konvention. Ju tidigare nivå, desto snabbare återkoppling och desto mindre kod som körs i onödan. Kontroller i körande kod är rätt vid förtroendegränser, i bibliotek och när säkerhet står på spel, men inte som ett allmänt skydd mot den egna kodens misstag. Var förtroendegränserna går beror på sammanhanget. I ett spel som körs helt i klienten finns de knappt, medan de i en Express-app finns vid varje request. Därför kan samma princip leda till att DTO:er väljs bort i det ena fallet och krävs i det andra. Hur mycket som behöver kontrolleras av verktyg beror på språket. I JavaScript, där språket ger minst hjälp, ger verktygen mest.

Två kontrollfrågor fungerar oavsett språk:

> Kan regeln uttryckas så att ett verktyg kontrollerar den?

> Om skyddet måste finnas i körande kod: skyddar det mot något utanför min kontroll?

Om svaret på den första frågan är ja, hör regeln hemma i verktygen. Om svaret på den andra är nej, är skyddet troligen onödigt.
