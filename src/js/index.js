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
    p.background(220)
    p.textAlign(p.CENTER, p.CENTER)
    p.text('Hello, world!', p.width / 2, p.height / 2)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
