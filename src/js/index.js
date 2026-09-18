import p5 from 'p5'
import { Camera } from './Camera.js'

/**
 * The main sketch for the p5.js application.
 *
 * @param {p5} p - The p5.js instance.
 */
const sketch = (p) => {
  /** @type {Camera} */
  let camera

  /**
   * Sets up the p5.js sketch by creating a canvas.
   */
  p.setup = () => {
    p.createCanvas(400, 400)
    camera = new Camera(p.height, p.width)
  }

  /**
   * The main drawing function for the p5.js sketch.
   */
  p.draw = () => {
    const TOMATO_CENTER_X = 1
    const TOMATO_CENTER_Y = 0.5
    const TOMATO_DIAMETER = 1

    p.drawBackground()
    p.drawTitle()
    p.drawTomato(TOMATO_CENTER_X, TOMATO_CENTER_Y, TOMATO_DIAMETER)
    p.drawGround()
  }

  /**
   * Draws the background of the canvas with a sky blue color.
   */
  p.drawBackground = () => {
    p.background(135, 206, 235)
  }

  /**
   * Draws the title text on the canvas.
   */
  p.drawTitle = () => {
    const TITLE_TEXT_TOP_DISPLACEMENT = 20
    const TITLE = 'Ripe Tomato'

    p.textAlign(p.CENTER, p.CENTER)
    p.fill(0)
    p.text(TITLE, p.width / 2, TITLE_TEXT_TOP_DISPLACEMENT)
  }

  /**
   * Draws a tomato shape on the canvas.
   *
   * @param {number} centerPositionX - The x-coordinate of the tomato's center in world space.
   * @param {number} centerPositionY - The y-coordinate of the tomato's center in world space.
   * @param {number} diameter - The diameter of the tomato.
   */
  p.drawTomato = (centerPositionX, centerPositionY, diameter) => {
    const TOMATO_COLOR = [255, 0, 0]

    const { x, y, scale } = camera.convertToCanvasCoordinates(centerPositionX, centerPositionY)

    p.fill(TOMATO_COLOR)
    p.ellipse(x, y, diameter * scale, diameter * scale)
  }

  /**
   * Draws the ground on the canvas with a specific color and height.
   */
  p.drawGround = () => {
    const GROUND_COLOR = [34, 139, 34]
    const GROUND_HEIGHT = 1

    const { y, scale } = camera.convertToCanvasCoordinates(0, 0)

    p.fill(GROUND_COLOR)
    p.rect(0, y, p.width, GROUND_HEIGHT * scale)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
