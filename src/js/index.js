import { GameController } from '@/controllers/GameController.js'
import { KeyboardInput } from '@/controllers/KeyboardInput.js'
import { PointerInput } from '@/controllers/PointerInput.js'
import { createFrame } from '@/frame.js'
import { Game } from '@/models/Game.js'
import { createFirstLevel } from '@/models/levels.js'
import { Camera } from '@/views/Camera.js'
import { GameView } from '@/views/GameView.js'
import p5 from 'p5'

/**
 * The composition root and game loop. The only module that knows every part
 * of the application.
 *
 * @param {p5} p The p5.js instance.
 */
const sketch = (p) => {
  /** @type {number} */
  const CANVAS_WIDTH = 800

  /** @type {number} */
  const CANVAS_HEIGHT = 400

  // The input buffers don't need p5, so they exist before setup and can
  // receive events as soon as p5 starts sending them.
  const keyboard = new KeyboardInput()
  const pointer = new PointerInput()

  // Created in setup, the earliest point where the p5 instance is ready.
  /** @type {(deltaTimeMs: number) => void} */
  let frame

  /**
   * Whether the pointer is over the canvas. p5 reports presses anywhere on the page.
   *
   * @returns {boolean} True if the pointer is inside the canvas, false otherwise.
   */
  const isPointerInsideCanvas = () => p.mouseX >= 0 && p.mouseX < p.width && p.mouseY >= 0 && p.mouseY < p.height

  /**
   * Called once by p5.js before the draw loop starts. Creates the canvas and wires the application together.
   */
  p.setup = () => {
    // The canvas must exist before the camera reads its size.
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const camera = new Camera(p.height)

    const game = new Game(createFirstLevel)
    const view = new GameView(p, game, camera)
    const controller = new GameController(game, camera, keyboard, pointer)
    frame = createFrame(controller, game, view)

    // Keys released while the window is out of focus never send a release event.
    window.addEventListener('blur', keyboard.reset)
  }

  /**
   * Called by p5.js when a key is pressed.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False, so p5 calls preventDefault() and Space or the arrows don't scroll the page.
   */
  p.keyPressed = (event) => {
    keyboard.press(event.key)
    return false
  }

  /**
   * Called by p5.js when a key is released.
   *
   * @param {KeyboardEvent} event The key event.
   * @returns {boolean} False, so p5 calls preventDefault().
   */
  p.keyReleased = (event) => {
    keyboard.release(event.key)
    return false
  }

  // Despite their names, p5 2.x calls the mouse* hooks for every pointer event (mouse, touch and
  // pen) and has no pointer* or touch* hooks. Check event.pointerType to tell them apart.

  /**
   * Called by p5.js when the mouse button is pressed, or a touch starts.
   */
  p.mousePressed = () => {
    if (isPointerInsideCanvas()) {
      pointer.press(p.mouseX, p.mouseY)
    }
  }

  /**
   * Called by p5.js when the pointer moves with the button held.
   */
  p.mouseDragged = () => {
    pointer.move(p.mouseX, p.mouseY)
  }

  /**
   * Called by p5.js when the mouse button is released, or a touch ends.
   */
  p.mouseReleased = () => {
    pointer.release()
  }

  /**
   * Called by p5.js once per animation frame. Hands over p5's clock, in milliseconds, to the frame.
   */
  p.draw = () => {
    frame(p.deltaTime)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
