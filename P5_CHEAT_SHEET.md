# p5.js Cheat Sheet

Quick reference for p5.js sketches using **instance mode** and ES modules, matching [src/js/index.js](src/js/index.js).

## Sketch lifecycle

```js
import p5 from 'p5'

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(640, 480) // Runs once.
  }

  p.draw = () => {
    p.background(40) // Runs once per frame.
  }
}

new p5(sketch, document.getElementById('app'))
```

- `p.setup()` runs once when the sketch starts.
- `p.draw()` runs repeatedly after `p.setup()`.
- `p.noLoop()` stops `p.draw()`; `p.loop()` starts it again.
- `p.redraw()` requests one frame while looping is stopped.
- Every p5 function, constant, and property is accessed through the instance (`p.`) — nothing is global.

## Canvas and coordinates

```js
p.createCanvas(640, 480)
p.resizeCanvas(800, 600)
p.background(220)
p.clear()
```

- `(0, 0)` is the top-left corner in 2D mode.
- Positive `x` moves right; positive `y` moves down.
- `p.width` and `p.height` contain the current canvas dimensions.

## Shapes

```js
p.point(x, y)
p.line(x1, y1, x2, y2)
p.circle(x, y, diameter)
p.ellipse(x, y, width, height)
p.rect(x, y, width, height)
p.triangle(x1, y1, x2, y2, x3, y3)
p.quad(x1, y1, x2, y2, x3, y3, x4, y4)
p.arc(x, y, width, height, startAngle, stopAngle)
```

Custom shape:

```js
p.beginShape()
p.vertex(10, 20)
p.vertex(80, 30)
p.vertex(50, 90)
p.endShape(p.CLOSE)
```

## Color and style

```js
p.background(30) // Grayscale.
p.background(20, 40, 80) // RGB.

p.fill(255, 120, 40)
p.noFill()

p.stroke(255)
p.strokeWeight(3)
p.noStroke()
```

Alpha/transparency uses a fourth value:

```js
p.fill(255, 0, 0, 128)
```

## Positioning modes

```js
p.rectMode(p.CORNER) // x/y is the top-left corner (default).
p.rectMode(p.CENTER) // x/y is the rectangle center.

p.ellipseMode(p.CENTER) // x/y is the ellipse center (default).
p.ellipseMode(p.CORNER) // x/y is the bounding box's top-left corner.
```

## Mouse input

```js
p.mouseX
p.mouseY
p.pmouseX
p.pmouseY
p.mouseIsPressed
```

```js
p.mousePressed = () => {
  // Called once when a mouse button is pressed.
}

p.mouseReleased = () => {
  // Called once when it is released.
}
```

Callbacks are assigned directly on the instance — no `window` assignment needed in instance mode.

## Keyboard input

```js
p.key // Character for the latest key.
p.keyCode // Code such as p.LEFT_ARROW or p.SPACE.
p.keyIsPressed // true while any key is held.

if (p.keyIsDown(p.LEFT_ARROW)) {
  x -= speed
}

if (p.keyIsDown(32)) {
  // Space bar.
  jump()
}
```

```js
p.keyPressed = () => {
  if (p.key === 'r') {
    resetGame()
  }
}
```

## Time and animation

```js
p.deltaTime // Milliseconds since the previous frame.
p.frameCount // Number of frames drawn.
p.millis() // Milliseconds since the sketch started.
p.frameRate() // Approximate current frame rate.
```

Frame-rate-independent movement:

```js
p.draw = () => {
  const seconds = p.deltaTime / 1000
  x += velocity * seconds
}
```

## Transforms

```js
p.push()
p.translate(x, y)
p.rotate(angle) // Radians by default.
p.scale(2)
p.rect(0, 0, 40, 20)
p.pop()
```

- Transformations affect drawing that follows them.
- `p.push()` saves the current styles and transforms.
- `p.pop()` restores them.
- p5 resets transformations at the beginning of each `p.draw()` call.
- Useful angle constants: `p.PI`, `p.HALF_PI`, `p.QUARTER_PI`, `p.TWO_PI`.
- Convert with `p.radians(degrees)` and `p.degrees(radians)`.

## Math helpers

```js
p.random(10) // 0 up to 10.
p.random(5, 10) // 5 up to 10.
p.constrain(value, min, max)
p.map(value, inMin, inMax, outMin, outMax)
p.dist(x1, y1, x2, y2)
p.lerp(start, stop, amount)
```

## Text

```js
p.textSize(24)
p.textAlign(p.CENTER, p.CENTER)
p.fill(255)
p.text('Score: 10', p.width / 2, 30)
```

## Images

```js
let playerImage

const sketch = (p) => {
  p.preload = () => {
    playerImage = p.loadImage('./assets/player.png')
  }

  p.setup = () => {
    p.createCanvas(640, 480)
  }

  p.draw = () => {
    p.image(playerImage, x, y, 64, 64)
  }
}
```

## Vectors

```js
const position = p.createVector(100, 100)
const velocity = p.createVector(50, 0)

const seconds = p.deltaTime / 1000
position.add(p5.Vector.mult(velocity, seconds))
```

Common vector methods:

```js
vector.add(other)
vector.sub(other)
vector.mult(number)
vector.div(number)
vector.mag()
vector.normalize()
vector.limit(maximum)
vector.copy()
```

## ES modules in this project

Export a class:

```js
export class Player {
  #x = 0

  update(seconds) {
    this.#x += 100 * seconds
  }
}
```

Import it with a relative path and the `.js` extension:

```js
import { Player } from './model/Player.js'
```

Do not escape the extension:

```js
// Correct
import { Player } from './model/Player.js'

// Incorrect
import { Player } from './model/Player\.js'
```

The `@` alias points to `src/` and is configured in both `vite.config.js` and `jsconfig.json`, so it works at build/runtime and in editor IntelliSense:

```js
import { Player } from '@/model/Player.js'
```

Prefer the relative path for nearby files; reach for `@/...` mainly to avoid long `../../../` chains from deeply nested files.

Run the project through its server so browser module imports work:

```sh
npm run dev
```

Then open <http://localhost:3000>.

## Useful game-loop pattern

```js
import p5 from 'p5'
import { GameModel } from './model/model.js'
import { GameView } from './view/GameView.js'

const sketch = (p) => {
  let model
  let view

  p.setup = () => {
    model = new GameModel()
    view = new GameView(p, model, 640, 480)
  }

  p.draw = () => {
    const seconds = p.deltaTime / 1000
    model.update(seconds)
    view.draw(seconds)
  }
}

new p5(sketch, document.getElementById('app'))
```

## Common problems

- Nothing appears: call `p.createCanvas()` and check whether the shape is outside the canvas.
- Trails remain: call `p.background()` near the start of every `p.draw()`.
- Imports fail: use the local web server, correct letter casing, forward slashes, and `.js` extensions.
- A p5 call throws "not a function": check it's called on `p.`, not as a bare global.
- Movement changes with frame rate: multiply speed by `p.deltaTime / 1000`.
- A transform affects later shapes: wrap it in `p.push()` and `p.pop()`.
- An image is unavailable in `p.setup()`: load it in `p.preload()`.

## Reference

- [Official p5.js reference](https://p5js.org/reference/)
- [p5.js examples](https://p5js.org/examples/)
