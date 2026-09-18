import p5 from 'p5'

/**
 * The main sketch for the p5.js application.
 *
 * @param {p5} p - The p5.js instance.
 */
const sketch = (p) => {
  /**
   * Sets up the p5.js sketch by creating a canvas.
   */
  p.setup = () => {
    p.createCanvas(400, 400)
  }

  /**
   * The main drawing function for the p5.js sketch.
   */
  p.draw = () => {
    p.drawBackground()
    p.drawTitle()
    p.drawTomato()
    p.drawGround()
  }

  /**
   * Draws the background of the canvas with a specific color.
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
   */
  p.drawTomato = () => {
    const TOMATO_COLOR = [255, 0, 0]
    const TOMATO_POSITION = { x: p.width / 2, y: p.height / 2 }
    const TOMATO_SIZE = 100

    p.fill(TOMATO_COLOR)
    p.ellipse(TOMATO_POSITION.x, TOMATO_POSITION.y, TOMATO_SIZE)
  }

  /**
   * Draws the ground on the canvas with a specific color and height.
   */
  p.drawGround = () => {
    const GROUND_COLOR = [34, 139, 34]
    const GROUND_HEIGHT = 50

    p.fill(GROUND_COLOR)
    p.rect(0, p.height - GROUND_HEIGHT, p.width, GROUND_HEIGHT)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
