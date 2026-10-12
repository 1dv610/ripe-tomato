# Ripe Tomato: en MVC-design för en spelloop

> [!NOTE]
> Skrivet efter pass 3.

Det här dokumentet beskriver MVC-arkitekturen för Ripe Tomato. Designen togs fram utan hänsyn till den tidigare koden och är implementerad på grenen `spike/alt-mvc`. Kodexemplen är förkortade utdrag ur den koden. Avsnittet [Från tidigare kod](#från-tidigare-kod) visar vad som har ändrats. Diskussionen om MVC i request/response jämfört med en spelloop finns i [REFLECTION_SESSION_2.md](REFLECTION_SESSION_2.md). Här är fokus i stället konkret: vilka klasser som finns, vad de ansvarar för, vad filerna heter och hur objekten samverkar under en frame.

## Krav

- En tomat ska kunna förflyttas framåt och undvika hinder av olika typer.
- Tomaten ska kunna styras med både tangentbord och mus.
- p5 används i *instance mode*, genom en instans som skapas i `index.js`.

Utöver det tillkommer några kvalitetskrav som följer av kursen:

- Modellen ska kunna köras och testas utan gränssnittet.
- Rörelser ska vara oberoende av bildfrekvensen.
- En ny hindertyp ska kunna läggas till utan att `Game` eller de andra hindren ändras. Det enda som behöver läggas till utanför den nya klassen är en ritfunktion i `ObstacleView`.

## Översikt

Arkitekturen har tre roller och en startpunkt. Det finns inga fler lager än så. Det som bär designen är **beroenderiktningen**. Varje pil betyder "känner till": pilen går från den som beror på något till det den beror på.

```mermaid
flowchart LR
    S["index.js<br/>startpunkt och loop"]
    C["controllers/"]
    V["views/"]
    M["models/"]
    P(["p5"])

    S --> C
    S --> V
    S --> M
    S -->|"skapar instansen,<br/>tar emot händelser"| P
    C --> M
    V --> M
    C -->|"bara Camera"| V
    V -.->|"ritar via injicerat p"| P
```

Heldragna pilar är importer. Den streckade pilen är ett beroende som uppstår när koden körs: vyerna importerar inte p5, de får instansen `p` från `index.js` och ritar genom den. Alla pilar som rör `models/` pekar in mot den, och ingen går ut från den.

| Del | Får känna till | Får inte känna till |
| --- | --- | --- |
| `models/` | ingenting utanför `models/` | p5, pixlar, tangenter, musen |
| `views/` | modellen (läser), p5 | kontrollern |
| `controllers/` | modellen (kommandon), `Camera` | p5, ritning |
| `index.js` | allt | – |

Två regler gör separationen tydlig:

1. **Bara kontrollern skickar kommandon till modellen, och bara loopen driver tiden.** Kontrollern anropar `jump()`, `steer()` och `restart()`, och `index.js` anropar `update(dt)`. Vyn läser modellens tillstånd via getters men ändrar det aldrig.
2. **Bara `index.js` och vyerna ser p5.** Kontrollerns input-klasser tar emot vanliga värden (`'ArrowLeft'`, `x`, `y`), så de kan testas utan p5.

### Reglerna kontrolleras av lintern

> [!NOTE]
> **Begrepp**
>
> - **Beroende:** ett *källkodsberoende*, alltså en `import`. Att `views/` beror på `models/` betyder att vyns kod känner till modellen och inte kan kompileras eller köras utan den.
> - **Beroenderiktning:** vilket håll beroendena pekar. Pilarna i diagrammet ovan är beroenden.
> - **Beroende är inte samma sak som dataflöde.** Data flyttas från modellen till vyn varje frame, men beroendepilen pekar från vyn till modellen, eftersom det är vyn som känner till modellen. Modellen vet inte att någon läser den.
> - **Beroenderegeln** (*the Dependency Rule*, Robert C. Martin, *Clean Architecture*): beroenden ska peka mot det som är stabilt och bär reglerna, här modellen. Det som ändras ofta, som presentation och input, får bero på det stabila, men aldrig tvärtom.
> - **Arkitekturerosion:** att strukturen långsamt bryts ned genom små genvägar ("bara en import av `p5` i modellen"), där var och en verkar ofarlig.
> - **Fitness function** (Ford, Parsons och Kua, *Building Evolutionary Architectures*): en automatisk kontroll av en egenskap hos arkitekturen. Lintreglerna nedan är sådana kontroller.

En arkitekturregel som bara står i ett dokument följs så länge alla minns den och granskningen upptäcker avstegen. Därför kontrolleras beroenderiktningen också av lintern. Det har tre fördelar:

- **Snabb återkoppling.** Felet syns i editorn medan man skriver, inte i en granskning dagar senare, eller aldrig.
- **Regeln förklarar sig själv.** Varje regel har ett felmeddelande som säger *varför* den finns, till exempel att modellen ska kunna köras i Node. Dokumentationen syns alltså där överträdelsen sker.
- **Nästan ingen kostnad.** Ingenting körs när spelet körs, och reglerna är några rader konfiguration med ESLints inbyggda regler, utan extra beroenden.

Resonemanget om var en regel bör kontrolleras, och hur svaret skiljer sig mellan språk, finns i [ENFORCING_DESIGN_WITH_TOOLS.md](ENFORCING_DESIGN_WITH_TOOLS.md).

Lintern ersätter inte kodgranskningen, den avlastar den. Det som kan uttryckas som en mekanisk regel, som "modellen importerar inte p5", kontrolleras varje gång och utan undantag av verktyget. Granskningen behöver då inte leta efter den sortens fel, som lätt missas, och kan ägna sig åt det verktyg inte ser: om namnen är bra, om ansvaret ligger rätt och om designen håller för nästa krav.

Reglerna i `eslint.config.js`:

| Mapp | Regel | Förbjuder |
| --- | --- | --- |
| `models/` | `no-restricted-imports` | `p5`, `views/`, `controllers/`, `index.js` |
| `models/` | `no-restricted-globals` | `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `fetch` |
| `models/` | `no-restricted-properties` | `Math.random`, `Date.now`, `performance.now` |
| `views/` | `no-restricted-imports` | `controllers/`, `index.js` |
| `views/` | `no-restricted-syntax` | anrop av `jump`, `steer`, `restart` och `update` på ett objekt |
| `controllers/` | `no-restricted-imports` | `p5`, `views/` utom `views/Camera.js`, `index.js` |

Mönstren är i gitignore-stil (`**/views/**`) och fångar därför både alias-importer (`@/views/GameView.js`) och relativa (`../views/GameView.js`). Undantaget för `Camera` uttrycks med negation (`!**/views/Camera.js`).

Reglerna för globala variabler och egenskaper går längre än importerna. Förbudet mot `window`, `document` och `fetch` håller modellen fri från webbläsaren, så att den kan köras i Node.

Förbudet mot `Math.random`, `Date.now` och `performance.now` kan verka förvånande, eftersom de inte har något med gränssnittet att göra. De är ändå samma sorts beroende: de läser något från omgivningen som inte syns i metodens signatur. En metod som läser klockan själv har klockan som *dold indata*. Två anrop med samma argument kan då ge olika resultat, och den som läser signaturen kan inte se varför. Det får tre följder:

- **Testerna blir svåra att skriva och opålitliga.** Ett test av hur långt tomaten hoppar måste antingen vänta på riktigt eller manipulera den globala klockan, och ett test av en slumpad bana kan gå igenom ena gången och misslyckas nästa. Med `update(dt)` stegar testet fram exakt den tid det vill. Så fungerar alla tester i `Game.test.js` och `levels.test.js`.
- **Spelomgångar kan inte spelas upp igen.** Att verifiera en highscore genom att köra spelarens input genom samma modellkod på en server går bara om modellen ger samma resultat för samma indata.
- **Klockan och slumpen tillhör körmiljön,** precis som `window`, inte spelets regler.

Regeln om klockan inför inget nytt, utan kontrollerar beslutet att p5 äger klockan och modellen får tiden via `update(dt)`. Slump används inte i modellen i dag. Regeln finns för att `Math.random()` är det självklara första försöket när någon vill slumpa fram hinder. Alternativet är att injicera en slumpfunktion, på samma sätt som banan redan injiceras:

```js
// models/levels.js
export const createRandomLevel = (random) => ({
  finishX: 40,
  obstacles: Array.from({ length: 8 }, (_, i) => new Crate(6 + i * 4 + random() * 2, 1, 1)),
})

// index.js: production uses the real generator.
game = new Game(() => createRandomLevel(Math.random))

// A test: a fixed sequence gives the same level every time.
const game = new Game(() => createRandomLevel(() => 0.5))
```

Mönstret är etablerat i andra miljöer. Java har `java.time.Clock` och .NET har `TimeProvider`, så att klockan kan injiceras och bytas ut i tester.

Importreglerna kan inte skilja på att läsa modellen och att ändra den, eftersom vyn har rätt att importera modellen. Därför matchar en `no-restricted-syntax`-regel anrop av modellens kommandon *på namn* med AST-selektorn `CallExpression > MemberExpression.callee[property.type='Identifier'][property.name=/^(jump|steer|restart|update)$/]`. `this.#game.jump()` fångas, men `this.#camera.follow(...)` och privata metoder (`this.#jump()`) gör det inte. Regeln är en heuristik och inte en typkontroll: listan måste hållas i takt med kommandona i `Game`, och en vy som av andra skäl anropar en metod som heter `update` får ett falskt larm. Ett eget ESLint-plugin skulle kunna vara mer exakt, men det vore mer kod att underhålla än risken motiverar.

Typimporter i JSDoc (`@typedef {import('@/views/Camera.js').Camera}`) kontrolleras inte heller, eftersom ESLint inte tolkar kommentarer. De är dessutom bara typinformation och påverkar inte vad som körs.

> [!TIP]
> **Prova själv.** Lägg till `import p5 from 'p5'` överst i `src/js/models/Tomato.js`. Editorn markerar raden direkt, och `npm run lint` misslyckas med meddelandet att modellen ska kunna köras utan gränssnittet. Prova sedan `this.#game.jump()` i `GameView.draw()`, eller `Math.random()` i `Bird.update()`. Ta bort ändringarna efteråt.

> [!IMPORTANT]
> Lintern skyddar bara det den körs på. `npm run lint` och editorn täcker utvecklingen. Pipelinen i `.github/workflows/ci.yml` kör lint, formateringskontroll, tester och bygge vid varje push till `main` och i varje pull request. Först när jobbet görs till en *required status check* i GitHubs branch protection för `main` kan en pull request som bryter mot reglerna inte slås ihop. Det är en inställning i repot och inte en fil. En regel kan dessutom stängas av med en `eslint-disable`-kommentar, så granskningen behövs fortfarande.

## Katalogstruktur och namn

```text
src/js/
├── index.js                  # startpunkt: skapar objekten, kopplar p5-händelser, kör loopen
├── models/
│   ├── Game.js               # fasad mot modellen: update(dt), jump(), steer(), restart()
│   ├── GameStatus.js         # uppräkning: PLAYING, LOST, WON
│   ├── Tomato.js             # spelkaraktären: position, hastighet, gravitation
│   ├── levels.js             # createFirstLevel() → { obstacles, finishX }
│   ├── geometry.js           # rena funktioner, t.ex. circleIntersectsRect()
│   └── obstacles/
│       ├── Obstacle.js       # abstrakt basklass
│       ├── Crate.js          # står still på marken, hoppa över
│       ├── Bird.js           # rör sig upp och ner, tajma passagen
│       └── Pit.js            # hål i marken, landa inte i det
├── views/
│   ├── Camera.js             # world space ↔ canvas space, följer tomaten
│   ├── GameView.js           # ritordning och sammansättning
│   ├── TomatoView.js
│   ├── ObstacleView.js       # en ritfunktion per hindertyp
│   └── HudView.js            # titel, framsteg, meddelanden
└── controllers/
    ├── GameController.js     # avsikter → modellkommandon
    ├── KeyboardInput.js      # buffrar tangentbordets tillstånd
    └── PointerInput.js       # buffrar musens tillstånd
```

Namnkonventionerna:

- **PascalCase för filer som exporterar en klass** (`Tomato.js`), **camelCase för moduler med funktioner** (`levels.js`, `geometry.js`).
- **En mapp per roll** (`models/`, `views/`, `controllers/`), inte en mapp per del av spelet. Lint-reglerna för beroenderiktningen (se [Reglerna kontrolleras av lintern](#reglerna-kontrolleras-av-lintern)) uttrycks som sökvägsmönster, `src/js/models/**` får inte importera från `**/views/**`. Om en `tomato/`-mapp innehöll både modell och vy skulle reglerna behöva bygga på filnamn i stället, och de blir sköra. Mappstrukturen visar dessutom MVC-uppdelningen direkt för den som öppnar `src/js`. En undermapp (`obstacles/`) införs när en roll får en grupp klasser som hör ihop.
- **Domännamn framför generiska namn.** `Tomato` i stället för `GameCharacter`: det finns bara en sorts karaktär, och "Game" i namnet säger inget som inte redan framgår av sammanhanget. Vyklasser heter som det de ritar, plus `View` (`TomatoView`).
- **Enhetstester ligger bredvid koden de testar,** `Tomato.test.js` bredvid `Tomato.js`, en testfil per klass eller modul. **Integrationstester ligger i `tests/integration/`** i projektets rot, eftersom de inte hör till någon enskild fil. Vitest letar efter `*.test.js` i både `src/` och `tests/`. Se [Testbarhet](#testbarhet).

## Modellen

Modellen arbetar i **world space**: enheten är tomater, y-axeln pekar uppåt och marken ligger vid `y = 0`. Tid mäts i sekunder. Modellen vet inget om pixlar, tangenter eller p5.

```mermaid
classDiagram
    direction TB

    class Game {
        -Function createLevel
        -Tomato tomato
        -Obstacle[] obstacles
        -number finishX
        -string status
        +Tomato tomato
        +Obstacle[] obstacles
        +number finishX
        +string status
        +boolean isOver
        +update(dt)
        +jump()
        +steer(direction)
        +restart()
    }

    class GameStatus {
        <<enumeration>>
        PLAYING
        LOST
        WON
    }

    class Tomato {
        -number x
        -number y
        -number velocityY
        -number direction
        +number radius
        +boolean isOnGround
        +update(dt)
        +jump()
        +steer(direction)
    }

    class Obstacle {
        <<abstract>>
        +number x
        +number width
        +update(dt)
        +collidesWith(tomato) boolean
    }

    class Crate {
        +number height
        +collidesWith(tomato) boolean
    }

    class Bird {
        -number baseY
        -number amplitude
        -number period
        -number elapsed
        +number y
        +number height
        +update(dt)
        +collidesWith(tomato) boolean
    }

    class Pit {
        +collidesWith(tomato) boolean
    }

    Game --> GameStatus
    Game *-- Tomato
    Game *-- "0..*" Obstacle
    Obstacle <|-- Crate
    Obstacle <|-- Bird
    Obstacle <|-- Pit
```

### `Game`: fasaden

`Game` är modellens enda ingång för kontrollern. Den äger reglerna för hela spelet: när det är slut, vad som gäller vid kollision och när banan är klarad.

```js
export class Game {
  /** The longest step the simulation takes, in seconds. */
  static #MAX_TIME_STEP = 1 / 30
  static #START_X = 1 // where the tomato's center starts, in tomatoes

  #createLevel
  #tomato
  #obstacles
  #finishX
  #status

  /**
   * @param {() => { obstacles: Obstacle[], finishX: number }} createLevel
   */
  constructor(createLevel) {
    this.#createLevel = createLevel
    this.restart()
  }

  restart = () => {
    const { obstacles, finishX } = this.#createLevel()
    this.#tomato = new Tomato(Game.#START_X)
    this.#obstacles = obstacles
    this.#finishX = finishX
    this.#status = GameStatus.PLAYING
  }

  jump = () => {
    if (this.#status === GameStatus.PLAYING) this.#tomato.jump()
  }

  steer = (direction) => {
    if (this.#status === GameStatus.PLAYING) this.#tomato.steer(direction)
  }

  update = (dt) => {
    if (this.#status !== GameStatus.PLAYING) return

    const step = Math.min(dt, Game.#MAX_TIME_STEP)
    this.#tomato.update(step)
    this.#obstacles.forEach((obstacle) => obstacle.update(step))

    if (this.#obstacles.some((obstacle) => obstacle.collidesWith(this.#tomato))) {
      this.#status = GameStatus.LOST
    } else if (this.#tomato.x >= this.#finishX) {
      this.#status = GameStatus.WON
    }
  }

  get obstacles() {
    return [...this.#obstacles]
  }
  // ...getters for tomato, finishX, status and isOver
}
```

Några beslut som syns i koden:

- **`update(dt)` tar emot tiden.** p5 äger klockan (`p.deltaTime`), modellen äger reglerna. Ett test kan därför stega fram exakt den tid det vill.
- **Tidssteget begränsas i modellen.** När en flik har varit dold kan `deltaTime` bli flera sekunder, och tomaten skulle då kunna passera rakt igenom ett hinder. Gränsen är en spelregel och ligger därför i modellen, där den kan testas. Priset är att spelet går i slow motion om bildfrekvensen sjunker under 30 fps, eftersom den tid som överstiger gränsen inte simuleras.
- **Banan injiceras som en fabriksfunktion.** `restart()` anropar fabriken igen och får ett nytt hinderset med nollställt tillstånd. Startposition och mål hör till banan, inte till tomaten.
- **`obstacles` returnerar en kopia av listan.** Hindren själva lämnas ut som referenser. Att kopiera alla objekt varje frame vore onödigt, och konventionen är att vyn bara läser. Kopian av listan hindrar ändå att hinder läggs till eller tas bort utifrån.

### `Tomato`: spelkaraktären

```js
export class Tomato {
  static #RUN_SPEED = 4 // tomatoes per second
  static #JUMP_SPEED = 14 // tomatoes per second
  static #GRAVITY = 30 // tomatoes per second squared

  // #x, #y (center), #velocityY, #direction, #radius

  steer = (direction) => {
    if (![-1, 0, 1].includes(direction)) {
      throw new RangeError('direction must be -1, 0 or 1.')
    }
    this.#direction = direction
  }

  jump = () => {
    if (this.isOnGround) this.#velocityY = Tomato.#JUMP_SPEED
  }

  update = (dt) => {
    this.#x = Math.max(this.#radius, this.#x + this.#direction * Tomato.#RUN_SPEED * dt)
    this.#velocityY -= Tomato.#GRAVITY * dt
    this.#y += this.#velocityY * dt

    if (this.#y <= this.#radius) {
      this.#y = this.#radius
      this.#velocityY = 0
    }
  }
}
```

Med de här konstanterna når tomatens underkant drygt tre tomater upp (`v² / 2g ≈ 3.3`), och ett hopp varar i ungefär `2v / g ≈ 0.93` sekunder. På den tiden hinner tomaten fram knappt fyra tomater i full fart. Talen styr vilka hinder som går att klara och hör därför till spelreglerna.

Först var hopphastigheten 11, vilket ger ett hopp som är ungefär två tomater högt. En skriptad genomspelning (`levels.test.js`) visade att en låda på 1 × 1 då bara gick att klara om spelaren hoppade inom ett fönster på ungefär 60 ms. Med 14 är fönstret ungefär fem gånger större. Testet kör hela banan med en enkel spelstrategi, så om fysiken eller banan ändras så att banan inte längre går att klara märks det direkt.

### Hinder: polymorfi i modellen

Varje hindertyp avgör själv vad kollision betyder för den. `Game` behöver då inte känna till vilka typer som finns.

| Hinder | Beteende | Kollision |
| --- | --- | --- |
| `Crate` | står still på marken | cirkeln överlappar lådans rektangel |
| `Bird` | rör sig upp och ner längs en sinuskurva | cirkeln överlappar fågelns aktuella rektangel |
| `Pit` | hål i marken | tomaten står på marken med centrum ovanför hålet |

Metoderna i hinderhierarkin deklareras som vanliga prototypmetoder och inte som pilfunktionsfält, eftersom subklasserna ska kunna överskugga dem. Basklassen kastar ett `TypeError` om den instansieras direkt (`new.target === Obstacle`).

```js
export class Obstacle {
  update(dt) {}

  collidesWith(tomato) {
    throw new Error(`${this.constructor.name} must implement collidesWith().`)
  }
}

export class Bird extends Obstacle {
  // ...
  update(dt) {
    this.#elapsed += dt
  }

  get y() {
    return this.#baseY + this.#amplitude * Math.sin((2 * Math.PI * this.#elapsed) / this.#period)
  }

  collidesWith(tomato) {
    return circleIntersectsRect(tomato, { left: this.x, bottom: this.y - this.height / 2, width: this.width, height: this.height })
  }
}
```

Geometrin ligger i `geometry.js` som rena funktioner. Den används av flera hinder och är enkel att testa separat.

### Banan

```js
export const createFirstLevel = () => ({
  finishX: 40,
  obstacles: [
    new Crate(6, 1, 1),
    new Pit(11, 2),
    new Crate(16, 1, 1.5),
    new Bird(21, 1.6, 0.9, 2),
    new Pit(26, 1.8),
    new Crate(30, 1, 1),
    new Bird(34, 1.5, 1, 1.6),
  ],
})
```

Banan är data. Senare kan den läsas från JSON eller genereras slumpmässigt, och då injiceras slumpfunktionen så att testerna blir deterministiska.

## Vyn

Vyn ritar modellens aktuella tillstånd varje frame. Den får ändra sitt eget **presentationstillstånd**, till exempel var kameran står, men aldrig modellens tillstånd.

```mermaid
classDiagram
    direction LR

    class GameView {
        -p5 p
        -Game game
        -Camera camera
        -TomatoView tomatoView
        -ObstacleView obstacleView
        -HudView hudView
        +draw()
    }

    class Camera {
        -number offsetX
        +number groundY
        +follow(worldX)
        +worldToCanvas(x, y) CanvasCoordinates
        +canvasToWorld(x, y) WorldCoordinates
        +toPixels(length) number
    }

    class TomatoView {
        +draw(tomato)
    }

    class ObstacleView {
        -Map renderers
        +draw(obstacle)
    }

    class HudView {
        +draw(game)
    }

    GameView *-- TomatoView
    GameView *-- ObstacleView
    GameView *-- HudView
    GameView --> Camera
    TomatoView --> Camera
    ObstacleView --> Camera
    GameView ..> Game : läser
```

### Ritordningen

`GameView` är Information Expert för hur spelet ritas och har bara en publik metod:

```js
draw = () => {
  this.#camera.follow(this.#game.tomato.x)

  this.#drawSky()
  this.#drawGround()
  this.#game.obstacles.forEach(this.#obstacleView.draw)
  this.#drawFinishLine(this.#game.finishX)
  this.#tomatoView.draw(this.#game.tomato)
  this.#hudView.draw(this.#game)
}
```

Gropar ritas efter marken, så att de syns som hål i den.

### Hindren ritas i vyn, inte i modellen

Det enklaste vore att ge varje hinder en `draw(p)`-metod. Då skulle modellen bero på p5, och kontrollfrågan ("kan modellen köras utan gränssnittet?") skulle få svaret nej. I stället väljer `ObstacleView` ritfunktion utifrån hindrets klass:

```js
export class ObstacleView {
  #renderers = new Map([
    [Crate, (crate) => this.#drawCrate(crate)],
    [Bird, (bird) => this.#drawBird(bird)],
    [Pit, (pit) => this.#drawPit(pit)],
  ])

  draw = (obstacle) => {
    const render = this.#renderers.get(obstacle.constructor)
    if (!render) {
      throw new Error(`No renderer for ${obstacle.constructor.name}.`)
    }
    render(obstacle)
  }
}
```

En ny hindertyp kräver alltså en ny klass i `models/obstacles/` och en ny rad här. Saknas raden syns felet vid första frame.

### `Camera`: delat presentationstillstånd

`Camera` omvandlar mellan world space (tomater, y uppåt) och canvas space (pixlar, y nedåt), och den följer tomaten i sidled. Den ersätter `CoordinateConverter`. Namnet `Camera` sköts upp i pass 2 med hänvisning till YAGNI. Nu är det motiverat, eftersom klassen panorerar och omvandlar åt båda hållen.

```js
export class Camera {
  static #PIXELS_PER_TOMATO = 60
  static #GROUND_HEIGHT_PIXELS = 60
  static #LEAD_PIXELS = 200 // where the followed position appears, from the left edge

  #canvasHeight // validated in the constructor
  #offsetX = 0 // world x shown at the left edge

  follow = (worldX) => {
    this.#offsetX = Math.max(0, worldX - Camera.#LEAD_PIXELS / Camera.#PIXELS_PER_TOMATO)
  }

  worldToCanvas = (x, y) => ({
    x: (x - this.#offsetX) * Camera.#PIXELS_PER_TOMATO,
    y: this.groundY - y * Camera.#PIXELS_PER_TOMATO,
  })

  canvasToWorld = (x, y) => ({
    x: x / Camera.#PIXELS_PER_TOMATO + this.#offsetX,
    y: (this.groundY - y) / Camera.#PIXELS_PER_TOMATO,
  })

  // Public, because GameView draws the ground strip from it.
  get groundY() {
    return this.#canvasHeight - Camera.#GROUND_HEIGHT_PIXELS
  }
}
```

Markens höjd definieras här och bara här. I modellen är marken alltid `y = 0`. Hur tjock remsan ser ut är en presentationsfråga.

`Camera` skapas i `index.js` och injiceras i både vyn och kontrollern. Därmed är den öppna frågan i [SESSION_2.md](SESSION_2.md) om vem som äger konverteraren besvarad. Vyn flyttar kameran när den ritar, och kontrollern använder samma kamera i nästa frame. Ett musklick tolkas alltså mot det spelaren faktiskt såg.

## Kontrollern

Kontrollern översätter **avsikter** till modellkommandon. I Smalltalks ursprungliga MVC var kontrollern just den del som hanterade inputenheter. Input-klasserna hör därför till `controllers/` och inte till `views/`.

```mermaid
classDiagram
    direction LR

    class GameController {
        -Game game
        -Camera camera
        -KeyboardInput keyboard
        -PointerInput pointer
        +update()
        -pointerDirection() number
    }

    class KeyboardInput {
        -Set held
        -boolean jumpRequested
        +number direction
        +press(key)
        +release(key)
        +reset()
        +consumeJump() boolean
    }

    class PointerInput {
        -boolean down
        -boolean pressRequested
        +number x
        +number y
        +boolean isDown
        +press(x, y)
        +move(x, y)
        +release()
        +consumePress() boolean
    }

    GameController --> KeyboardInput
    GameController --> PointerInput
    GameController --> Camera
    GameController --> Game : kommandon
```

### Styrning

| Avsikt | Tangentbord | Mus |
| --- | --- | --- |
| Gå åt vänster | `←` eller `A` | håll nere till vänster om tomaten |
| Gå åt höger | `→` eller `D` | håll nere till höger om tomaten |
| Hoppa | `Space`, `↑` eller `W` | klicka |
| Börja om (efter vinst eller förlust) | samma som hopp | klicka |

När båda enheterna används samtidigt har tangentbordets riktning företräde.

### Händelser buffras och tillämpas i loopen

p5 anropar `keyPressed` och `mousePressed` när webbläsaren skickar händelsen, alltså någon gång mellan två frames. Om de anropen ändrade modellen direkt skulle modellen ändras utanför loopen. Input-klasserna sparar därför bara det som hänt, och kontrollern tillämpar det i början av nästa frame.

Det finns två sorters avsikter, och de buffras på olika sätt:

- **Hopp är en händelse.** Den registreras en gång och förbrukas med `consumeJump()`, så ett tryck blir exakt ett hopp.
- **Riktning är ett tillstånd.** Den gäller så länge tangenten hålls nere och läses med `direction`.

```js
const KEY_ACTIONS = new Map([
  ['arrowleft', 'left'], ['a', 'left'],
  ['arrowright', 'right'], ['d', 'right'],
  [' ', 'jump'], ['arrowup', 'jump'], ['w', 'jump'],
])

export class KeyboardInput {
  #held = new Set()
  #jumpRequested = false

  press = (key) => {
    const action = KEY_ACTIONS.get(key.toLowerCase())
    if (!action || this.#held.has(action)) return // unknown key, or auto-repeat
    this.#held.add(action)
    if (action === 'jump') this.#jumpRequested = true
  }

  release = (key) => {
    this.#held.delete(KEY_ACTIONS.get(key.toLowerCase()))
  }

  get direction() {
    return Number(this.#held.has('right')) - Number(this.#held.has('left'))
  }

  consumeJump = () => {
    const requested = this.#jumpRequested
    this.#jumpRequested = false
    return requested
  }
}
```

Klassen tar emot strängar och har inget p5-beroende. Ett test kan anropa `press('ArrowLeft')` och kontrollera `direction`.

### `GameController`

```js
export class GameController {
  static #DEAD_ZONE = 0.25 // tomatoes

  update = () => {
    // Consume both requests every frame, so a stale one is never applied later.
    const jumpRequested = this.#keyboard.consumeJump()
    const pressRequested = this.#pointer.consumePress()

    if (jumpRequested || pressRequested) {
      if (this.#game.isOver) this.#game.restart()
      else this.#game.jump()
    }
    this.#game.steer(this.#keyboard.direction || this.#pointerDirection())
  }

  #pointerDirection = () => {
    if (!this.#pointer.isDown) return 0

    const { x } = this.#camera.canvasToWorld(this.#pointer.x, this.#pointer.y)
    const distance = x - this.#game.tomato.x
    return Math.abs(distance) < GameController.#DEAD_ZONE ? 0 : Math.sign(distance)
  }
}
```

Båda förfrågningarna förbrukas innan de jämförs. Med `consumeJump() || consumePress()` skulle `||` kortsluta: ett klick i samma frame som ett tangenttryck skulle ligga kvar och ge ett andra hopp, eller en omstart, i nästa frame.

Det är kontrollern som avgör att samma avsikt betyder "hoppa" medan spelet pågår och "börja om" när det är slut. Det är en regel för gränssnittet och inte en spelregel, och därför ligger den inte i modellen.

## Startpunkten: `index.js`

Sketchen skapar objekten, kopplar p5:s händelser till input-klasserna och kör loopen. Den är den enda filen som känner till alla delar.

```js
import p5 from 'p5'
// ...imports

const sketch = (p) => {
  const keyboard = new KeyboardInput()
  const pointer = new PointerInput()

  let game
  let view
  let controller

  p.setup = () => {
    // The canvas must exist before the camera reads its size.
    p.createCanvas(800, 400)
    const camera = new Camera(p.height)

    game = new Game(createFirstLevel)
    view = new GameView(p, game, camera)
    controller = new GameController(game, camera, keyboard, pointer)

    // Keys released while the window is out of focus never send a release event.
    window.addEventListener('blur', keyboard.reset)
  }

  // Returning false makes p5 call preventDefault(), so Space doesn't scroll the page.
  p.keyPressed = (event) => {
    keyboard.press(event.key)
    return false
  }
  p.keyReleased = (event) => {
    keyboard.release(event.key)
    return false
  }

  // p5 2.x calls the mouse* hooks for every pointer type: mouse, touch and pen.
  p.mousePressed = () => {
    if (isInsideCanvas()) pointer.press(p.mouseX, p.mouseY)
  }
  p.mouseDragged = () => pointer.move(p.mouseX, p.mouseY)
  p.mouseReleased = () => pointer.release()

  p.draw = () => {
    controller.update() // 1. apply buffered input
    game.update(p.deltaTime / 1000) // 2. advance the simulation, in seconds
    view.draw() // 3. render the new state
  }

  const isInsideCanvas = () => p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height
}

new p5(sketch, document.querySelector('#app'))
```

Ordningen i `p.draw` är avsiktlig och samma varje frame: input, simulering, rendering. Det är hela loopens kontrakt. I p5 2.3.2 får `keyPressed` eventet som argument, och `return false` gör att p5 anropar `preventDefault()`.

`keyboard` och `pointer` kan skapas på toppnivå eftersom de inte behöver p5. Allt som behöver canvasen skapas i `p.setup`.

## Samverkan över tid

### Uppstart

```mermaid
sequenceDiagram
    participant P as p5
    participant S as index.js
    participant G as Game
    participant L as createFirstLevel
    participant Cam as Camera
    participant V as GameView
    participant C as GameController

    P->>S: setup()
    S->>P: createCanvas(800, 400)
    S->>Cam: new Camera(p.height)
    S->>G: new Game(createFirstLevel)
    G->>L: createLevel()
    L-->>G: { obstacles, finishX }
    S->>V: new GameView(p, game, camera)
    S->>C: new GameController(game, camera, keyboard, pointer)
```

### En frame

```mermaid
sequenceDiagram
    participant P as p5
    participant S as index.js
    participant C as GameController
    participant K as KeyboardInput
    participant G as Game
    participant T as Tomato
    participant O as Obstacle[]
    participant V as GameView
    participant Cam as Camera

    P->>S: draw()

    S->>C: update()
    C->>K: consumeJump()
    K-->>C: false
    C->>K: direction
    K-->>C: 1
    C->>G: steer(1)
    G->>T: steer(1)

    S->>G: update(p.deltaTime / 1000)
    G->>T: update(step)
    G->>O: update(step)
    G->>O: collidesWith(tomato)
    O-->>G: false

    S->>V: draw()
    V->>G: tomato.x
    V->>Cam: follow(x)
    V->>G: obstacles, finishX, status
    V->>P: background(), rect(), ellipse(), text()
```

Vyn läser bara från modellen. Alla anrop som ändrar modellen går via kontrollern eller `game.update()`.

### Ett hopp med tangentbordet

Tangenttrycket kommer mellan två frames. Det sparas och får effekt först i nästa frame.

```mermaid
sequenceDiagram
    actor A as Spelare
    participant P as p5
    participant S as index.js
    participant K as KeyboardInput
    participant C as GameController
    participant G as Game
    participant T as Tomato

    A->>P: trycker Space
    P->>S: keyPressed(event)
    S->>K: press(" ")
    Note over K: jumpRequested = true
    S-->>P: false (preventDefault)

    Note over P,T: nästa frame
    P->>S: draw()
    S->>C: update()
    C->>K: consumeJump()
    K-->>C: true
    C->>G: jump()
    G->>T: jump()
    Note over T: velocityY = JUMP_SPEED om tomaten står på marken
```

### Gå åt höger med musen

Musens position är i pixlar. Kontrollern omvandlar den till world space med samma kamera som vyn använde i förra framen.

```mermaid
sequenceDiagram
    actor A as Spelare
    participant P as p5
    participant S as index.js
    participant Ptr as PointerInput
    participant C as GameController
    participant Cam as Camera
    participant G as Game

    A->>P: håller ner musknappen till höger om tomaten
    P->>S: mousePressed()
    S->>Ptr: press(mouseX, mouseY)

    Note over P,G: nästa frame
    P->>S: draw()
    S->>C: update()
    C->>Ptr: consumePress()
    Ptr-->>C: true
    C->>G: jump()
    C->>Ptr: isDown, x, y
    C->>Cam: canvasToWorld(x, y)
    Cam-->>C: { x: worldX, y: worldY }
    C->>G: tomato.x
    Note over C: worldX - tomato.x > DEAD_ZONE → 1
    C->>G: steer(1)
```

Ett klick ger alltså också ett hopp, eftersom en tryckning är ett hopp och en nedhållen knapp är riktning, som med tangentbordet.

### Kollision och omstart

```mermaid
sequenceDiagram
    actor A as Spelare
    participant S as index.js
    participant C as GameController
    participant G as Game
    participant B as Bird
    participant V as GameView
    participant H as HudView

    S->>G: update(dt)
    G->>B: collidesWith(tomato)
    B-->>G: true
    Note over G: status = LOST

    S->>V: draw()
    V->>H: draw(game)
    Note over H: "Squashed! Press Space or click to try again."

    Note over S,G: frames passerar, update() gör ingenting
    A->>S: trycker Space (buffras)

    S->>C: update()
    C->>G: isOver
    G-->>C: true
    C->>G: restart()
    Note over G: ny bana från createLevel(), status = PLAYING
```

## Designbeslut och alternativ

| Fråga | Beslut | Alternativ | Varför |
| --- | --- | --- | --- |
| När ska input påverka modellen? | Buffras och tillämpas i början av varje frame | Kontrollern anropar `game.jump()` direkt i `keyPressed` | Modellen ändras bara i loopen, i en fast ordning, och input-klasserna kan testas utan p5 |
| Vem äger koordinatomvandlingen? | `Camera` skapas i `index.js` och delas av vy och kontroller | Vyn skapar den och lämnar ut den | Två klasser behöver den, så ingen av dem bör äga den |
| Var ritas hindren? | `ObstacleView` väljer ritfunktion efter klass | `obstacle.draw(p)` i modellen | Modellen förblir fri från p5 |
| Var begränsas tidssteget? | I `Game.update()` | I sketchen | Det är en spelregel, och den ska kunna testas |
| Hur når kontrollern modellen? | Bara via `Game` | Direkt till `Tomato` | Ett litet gränssnitt, och regler som "inga hopp efter game over" finns på ett ställe |
| Vem skapar canvasen? | `index.js` | `GameView`s konstruktor | Vyn kan testas med en mockad `p`, och varningen om initieringsordning behövs bara på ett ställe |
| Lämnar modellen ut sina objekt? | Ja, som referenser. Listor kopieras | Kopior, DTO:er eller skrivskyddade vyer varje frame | Underhållet av en andra beskrivning av samma form kostar mer än det skyddar. Konventionen är att vyn bara läser, och lintern fångar kommandoanrop från vyer |
| Hur upprätthålls beroenderiktningen? | ESLint-regler per mapp | Bara dokumentation och granskning | Felet syns direkt i editorn, och regeln gäller även när ingen granskar |

### Kompromisser

Designen har kompromisser. Alla är medvetna, och ingen är ett problem för dagens krav:

| Kompromiss | Konsekvens | Om det blir ett problem |
| --- | --- | --- |
| Modellen lämnar ut riktiga objekt (`game.tomato`) | En vy *kan* anropa en metod som ändrar modellen | Lintern fångar kommandon på namn. Destrukturera parametrar i lövvyerna (`draw({ x, y, radius })`) där det förenklar tester |
| `GameController` beror på `Camera` i `views/` | Kontrollern och vyn är kopplade | Injicera bara en funktion `toWorld(x, y)` i stället för hela kameran |
| Vyn flyttar kameran i `draw()` | Klick tolkas mot förra framens kamera | Inget att åtgärda, eftersom det är vad spelaren såg |
| `ObstacleView` väljer ritfunktion på exakt klass | En subklass till `Crate` får ingen ritfunktion | Slå upp via prototypkedjan, eller byt till en visitor |
| Variabelt tidssteg med tak | Slow motion under 30 fps, och fysiken skiljer sig något mellan olika bildfrekvenser | Fast tidssteg med ackumulator. Det krävs om spelomgångar ska kunna spelas upp exakt igen |
| Fysikkonstanterna är privata i `Tomato` | De kan inte variera per bana | Injicera en konfiguration, eller låt banan ange dem |
| Modellen exponerar tillstånd men inga händelser | Vyn kan inte spela ett ljud *när* tomaten hoppar | En händelsekö, se [Öppna frågor](#öppna-frågor) |

## Fler lager?

Nej, inte för det här problemet. Lager som service eller repository löser problem med persistens, transaktioner och logik som delas mellan flera gränssnitt, och sådana problem finns inte här. Ett extra lager skulle bara skicka vidare anrop. Arkitekturen ska kosta i proportion till den risk den tar bort.

Det som behövs är i stället tydliga gränser inom och runt de tre rollerna:

- **en startpunkt** (`index.js`) som är ensam om att känna till alla delar,
- **en gräns mot p5**: bara sketchen och vyerna ser p5-värden,
- **undermappar i en roll** (`models/obstacles/`) när den växer.

Om spelet får en startmeny, en poänglista och flera banor är nästa steg en `Scene`-abstraktion, där varje scen har sin egen modell, vy och kontroller och sketchen byter mellan dem. Det ger fler triader, inte fler lager.

### När lager lönar sig

Lager lönar sig när spelet får **I/O**, alltså server, lagring eller asynkrona anrop:

- **Banor från en server.** En bana blir data (JSON) som ska valideras och översättas till domänobjekt. Då behövs ett *repository* (`LevelRepository.get(id)`) och en fabrik som går från typnamn till klass. Banan laddas innan spelet startar, så att `Game` förblir synkron. `new Game(createLevel)` tar redan en fabrik och behöver inte ändras.
- **En highscore-lista.** Ett `HighscoreRepository` och ett tunt *applikationslager* som samordnar användningsfallet: banan är klarad, tiden räknas fram, resultatet skickas och nästa bana låses upp. Den samordningen hör varken hemma i `Game`, som är ren och synkron, eller i kontrollern, som översätter input.
- **Fusk med highscore.** Vem som helst kan skicka vilken tid som helst till servern. Det robusta motmedlet är att skicka inputloggen och låta servern spela upp den med *samma modellkod*. Det kräver ett fast tidssteg och seedad slump. Det går bara eftersom modellen saknar beroende till p5 och därför kan köras i Node, och det är därför lintern förbjuder `window`, `Math.random` och `Date.now` i modellen.
- **Spelets tillstånd på servern varje frame** är däremot fel väg. Latensen är flera frames lång, så tillståndet måste finnas i klienten. Det som sparas på servern är varaktigt, som framsteg och inställningar, och det sparas vid händelser.

DTO:er hör hemma vid sådana verkliga gränser, där JSON redan är en DTO och en översättning behövs ändå. Mellan modell och vy i samma process ger de mest underhåll.

```text
src/js/
├── models/           # oförändrad: ren, synkron, kan delas med servern
├── application/      # användningsfall: startLevel(id), submitScore(run)
├── infrastructure/   # HttpLevelRepository, HttpHighscoreRepository
├── scenes/           # MenuScene, PlayScene, HighscoreScene, var och en med egen M/V/C
├── views/
└── controllers/
```

## Testbarhet

| Klass | Vad testas | Behövs p5? |
| --- | --- | --- |
| `Tomato` | hopp bara från marken, gravitation, att tomaten landar på `y = radius`, fart oberoende av hur `dt` delas upp | nej |
| `Game` | statusövergångar, att `update` inte gör något efter game over, att `restart` ger ny bana, att tidssteget begränsas | nej |
| `Crate`, `Bird`, `Pit` | `collidesWith` i kantfall | nej |
| `levels.js` | att banan går att klara, med en skriptad spelare som hoppar framför lådor och gropar och väntar in fåglarna | nej |
| `geometry.js` | `circleIntersectsRect` | nej |
| `KeyboardInput`, `PointerInput` | tangentmappning, autorepeat, `consume…` förbrukar exakt en gång | nej |
| `GameController` | att avsikter blir rätt kommandon, med en fejkad `Game` och `Camera` | nej |
| `Camera` | `canvasToWorld(worldToCanvas(p))` ger `p` tillbaka | nej |
| vyerna | att rätt ritanrop görs, med en mockad `p` | mockad |

### Integrationstester

Enhetstesterna av `GameController` använder en fejkad `Game` och en fejkad `Camera`. JavaScript kontrollerar inte att en fejk har samma gränssnitt som klassen den ersätter. Om `Game` byter namn på `steer()` eller ändrar vad `isOver` betyder går controllertesterna fortfarande igenom, men spelet slutar fungera. `tests/integration/inputToGame.test.js` kopplar därför ihop riktiga `KeyboardInput`, `PointerInput`, `GameController`, `Game` och `Camera` på samma sätt som `index.js` och kör loopen utan p5. Testerna kontrollerar att ett tangenttryck får tomaten att hoppa, att en nedhållen musknapp till höger om tomaten får den att gå åt höger och att ett tangenttryck efter en kollision startar om spelet.

Modellens delar behöver inga egna integrationstester. `Game.test.js` använder riktiga hinder, och `levels.test.js` spelar igenom hela banan med riktiga objekt.

Kopplingen till p5 i `index.js` testas inte automatiskt. Det skulle kräva E2E-tester i en riktig webbläsare, och koden är för tunn för att det ska löna sig. Ett fel i ritordningen i `draw()`, eller en saknad `blur`-lyssnare, märks alltså bara när spelet körs.

```js
import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'

describe('Tomato', () => {
  it('moves the same distance regardless of frame rate', () => {
    const slow = new Tomato(0.5)
    const fast = new Tomato(0.5)
    slow.steer(1)
    fast.steer(1)

    slow.update(1 / 30)
    fast.update(1 / 60)
    fast.update(1 / 60)

    expect(fast.x).toBeCloseTo(slow.x)
  })

  it('ignores a second jump while airborne', () => {
    const once = new Tomato(0.5)
    const twice = new Tomato(0.5)
    once.jump()
    twice.jump()
    once.update(0.2)
    twice.update(0.2)

    twice.jump()
    once.update(0.2)
    twice.update(0.2)

    expect(twice.y).toBeCloseTo(once.y)
  })
})
```

## Från tidigare kod

| Tidigare (`main`) | Nu (`spike/alt-mvc`) |
| --- | --- |
| `models/GameCharacter.js` | `models/Tomato.js` med hastighet, `jump()`, `steer()` och `update(dt)` |
| `Game` med `jump()` som stub och `groundHeight` | `Game` som fasad med `update(dt)`, status och bana. Markens tjocklek finns bara i `Camera` |
| `views/Input.js` | `controllers/KeyboardInput.js` och `controllers/PointerInput.js` |
| `views/utils/CoordinateConverter.js` | `views/Camera.js` med `canvasToWorld` och `follow` |
| `GameView` skapar canvasen och konverteraren | `index.js` skapar canvasen och `Camera`, som injiceras |
| `GameController.update()` anropar `gameView.draw()` | `index.js` kör input, simulering och rendering i tur och ordning |

## Öppna frågor

- **Pekskärmar.** p5 2.x bygger på pointer events, så `mousePressed`, `mouseDragged` och `mouseReleased` anropas även vid touch. Det har inte provats på en riktig pekskärm.
- **Branch protection.** Pipelinen finns, men den stoppar ingenting förrän jobbet görs till en obligatorisk statuskontroll för `main` i GitHub.
- **Fast tidssteg.** Behövs först om spelomgångar ska spelas upp exakt igen, till exempel för att verifiera highscores. Se [Kompromisser](#kompromisser).
- **Flera banor och menyer.** Se `Scene`-resonemanget under [Fler lager?](#fler-lager).
- **Ljud och partiklar.** Det är presentation och hör hemma i vyn. Om vyn behöver veta *att* något hände, inte bara *hur* det ser ut nu, kan modellen exponera händelser som `game.events` som vyn läser och tömmer varje frame. Modellen behöver ändå inte känna till vyn.
