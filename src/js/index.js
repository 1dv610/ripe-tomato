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
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
