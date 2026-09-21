# Föreläsningsexempel: Ripe Tomato

Ett minimalt startprojekt för föreläsningsexempel med [p5.js](https://p5js.org/). Repot innehåller medvetet ingen färdig spelkod. Tanken är att modellen, vyn och spelmekaniken ska kunna byggas upp steg för steg under föreläsningen.

## Startpunkt för föreläsningen

`main` byggs vidare under föreläsningen och innehåller därför inte längre exakt samma kod som vid kursstart. Ursprungsläget är taggat som [`start-here`](https://github.com/1dv610/ripe-tomato/tree/start-here) och ändras inte.

Vill du utgå från samma startpunkt som föreläsningen började från:

```sh
git clone https://github.com/1dv610/ripe-tomato.git
cd ripe-tomato
git checkout start-here
```

Vill du fortsätta jobba därifrån på en egen branch:

```sh
git checkout -b eget-branch-namn start-here
```

## Vad är p5.js?

p5.js är ett JavaScript-bibliotek för kreativ programmering, visualiseringar, animationer och interaktiva upplevelser i webbläsaren. Biblioteket förenklar arbete med HTML-canvas och ger färdiga funktioner för bland annat former, färger, bilder, tangentbord, mus och animation.

En p5-skiss bygger vanligtvis på två funktioner:

```js
function setup() {
  // Körs en gång när skissen startar.
}

function draw() {
  // Körs om och om igen, normalt cirka 60 gånger per sekund.
}
```

Detta kallas *global mode*. Det här projektet använder istället *instance mode*, där `setup` och `draw` kopplas till en p5-instans istället för att vara globala funktioner — se [Börja rita](#börja-rita) nedan.

Se [p5.js Cheat Sheet](./P5_CHEAT_SHEET.md) för en snabb översikt över de vanligaste funktionerna och återkommande mönster.

## Projektets upplägg

```text
ripe-tomato/
├── public/
│   ├── favicon.png      # Webbplatsens favicon
│   └── robots.txt       # Instruktioner till sökmotorer
├── src/
│   ├── css/
│   │   └── styles.css   # Stilmall
│   ├── js/
│   │   └── index.js     # Startpunkt för p5-skissen
│   └── index.html       # HTML-sidan som Vite bygger utifrån
├── P5_CHEAT_SHEET.md     # Snabbreferens för p5.js
├── eslint.config.js     # ESLint-konfiguration
├── prettier.config.js   # Prettier-konfiguration
├── stylelint.config.js  # Stylelint-konfiguration
├── vite.config.js       # Vite- och Vitest-konfiguration (dev-server, bygge och tester)
├── package.json         # Projektets npm-kommandon och beroenden
├── package-lock.json    # Låsta versioner av npm-beroenden
└── LICENSE              # Unlicense (public domain)
```

Mappen `src` är webbplatsens rot i Vite, medan `public` publiceras oförändrad på webbplatsens rot. Det innebär att `src/index.html` visas på `/`, `src/js/index.js` blir tillgänglig som `/js/index.js` och `public/favicon.png` som `/favicon.png`.

`p5` installeras som ett npm-beroende och importeras som en vanlig ES-modul i `src/js/index.js`. Ingen CDN-anslutning behövs för att köra skissen.

## Kom igång

Du behöver [Node.js](https://nodejs.org/) och npm installerat.

1. Installera projektets beroenden:

   ```sh
   npm install
   ```

2. Starta utvecklingsservern:

   ```sh
   npm run dev
   ```

3. Öppna [http://localhost:5173](http://localhost:5173) i webbläsaren (Vite väljer nästa lediga port om 5173 redan är upptagen).

Vite bevakar filerna under `src` och `public`. När en fil ändras uppdateras den öppna sidan automatiskt via Hot Module Replacement.

## Börja rita

`src/js/index.js` innehåller startpunkten för p5-skissen. p5.js körs i instansläge, vilket innebär att `setup` och `draw` kopplas till p5-instansen `p` istället för att göras globala:

```js
import p5 from 'p5'

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(640, 480)
  }

  p.draw = () => {
    p.background(40)
    p.circle(p.width / 2, p.height / 2, 50)
  }
}

new p5(sketch, document.querySelector('#app'))
```

Fler JavaScript-filer kan läggas under `src/js` och importeras med vanliga ES-moduler:

```js
import { Player } from './model/Player.js'
```

Använd alltid relativa sökvägar, vanliga snedstreck och filändelsen `.js`.

## Felsökning (debugging)

Rekommenderade VS Code-tillägg finns i [.vscode/extensions.json](.vscode/extensions.json) och föreslås automatiskt när projektet öppnas.

### Skissen i webbläsaren

En färdig debug-konfiguration finns i [.vscode/launch.json](.vscode/launch.json). Sätt en brytpunkt i valfri fil under `src/js`, öppna Run & Debug (`Ctrl+Shift+D`) och kör **"Debug Ripe Tomato (Vite)"**. Den startar utvecklingsservern automatiskt och öppnar skissen i Chrome med brytpunkterna aktiva.

### Tester (Vitest)

Installera tillägget **Vitest** (`vitest.explorer`) för en Testing-panel i VS Code med kör- och debugknappar per test, per fil eller för hela sviten. Brytpunkter i test- och källfiler fungerar direkt utan egen konfiguration.

## Kommandon

```sh
npm run dev            # Startar Vites utvecklingsserver med HMR
npm run build          # Bygger produktionsversionen till dist/
npm run serve          # Förhandsgranskar den byggda versionen lokalt
npm test               # Kör tester i bevakningsläge (Vitest)
npm run test:run       # Kör tester en gång
npm run lint           # Kontrollerar koden med ESLint och Stylelint
npm run lint:fix       # Rättar automatiskt det som går med ESLint och Stylelint
npm run format         # Formaterar koden med Prettier
npm run format:check   # Kontrollerar att koden är formaterad med Prettier
```

Stoppa utvecklingsservern med `Ctrl+C` i terminalen.

## Licens

Projektet distribueras under [Unlicense](./LICENSE) och släpps därmed till public domain.
