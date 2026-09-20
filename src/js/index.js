import p5 from 'p5'
import { Camera } from '@/js/Camera.js'

/**
 * The main sketch for the p5.js application.
 *
 * @param {p5} p The p5.js instance.
 */
const sketch = (p) => {
  /** @type {Camera} */
  let camera

  /**
   * Called once by p5.js before the draw loop starts. Creates the canvas and initializes the camera.
   */
  p.setup = () => {
    p.createCanvas(400, 400)
    camera = new Camera(p.height)
  }

  /**
   * Called by p5.js once per animation frame to render the scene.
   */
  p.draw = () => {
    const TOMATO_CENTER_X = 1
    const TOMATO_CENTER_Y = 0.5
    const TOMATO_DIAMETER = 1

    drawBackground()
    drawTitle()
    drawTomato(TOMATO_CENTER_X, TOMATO_CENTER_Y, TOMATO_DIAMETER)
    drawGround()
  }

  /**
   * Draws the background of the canvas with a sky blue color.
   */
  const drawBackground = () => {
    p.background(135, 206, 235)
  }

  /**
   * Draws the sketch title centered near the top of the canvas.
   */
  const drawTitle = () => {
    const TITLE_TEXT_TOP_DISPLACEMENT = 20
    const TITLE = 'Ripe Tomato'

    p.textAlign(p.CENTER, p.CENTER)
    p.fill(0)
    p.text(TITLE, p.width / 2, TITLE_TEXT_TOP_DISPLACEMENT)
  }

  /**
   * Draws a tomato shape on the canvas.
   *
   * @param {number} centerPositionX The x-coordinate of the tomato's center in world space.
   * @param {number} centerPositionY The y-coordinate of the tomato's center in world space.
   * @param {number} diameter The diameter of the tomato, in world-space units.
   */
  const drawTomato = (centerPositionX, centerPositionY, diameter) => {
    const TOMATO_COLOR = [255, 0, 0]

    const { x, y, scale } = camera.convertToCanvasCoordinates(centerPositionX, centerPositionY)

    p.fill(TOMATO_COLOR)
    p.ellipse(x, y, diameter * scale, diameter * scale)
  }

  /**
   * Draws the ground on the canvas with a specific color and height.
   */
  const drawGround = () => {
    const GROUND_COLOR = [34, 139, 34]
    const GROUND_HEIGHT = 1

    const { y, scale } = camera.convertToCanvasCoordinates(0, 0)

    p.fill(GROUND_COLOR)
    p.rect(0, y, p.width, GROUND_HEIGHT * scale)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
