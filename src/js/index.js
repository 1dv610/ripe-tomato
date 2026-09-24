import p5 from 'p5'
import { GameView } from '@/views/GameView.js'
/**
 * The main sketch for the p5.js application.
 *
 * @param {p5} p The p5.js instance.
 */
const sketch = (p) => {
  const TOMATO_CENTER_X = 1
  const TOMATO_CENTER_Y = 0.5
  const TOMATO_DIAMETER = 1

  let gameView
  const tomatoCenterPosition = { x: TOMATO_CENTER_X, y: TOMATO_CENTER_Y }

  /**
   * Called once by p5.js before the draw loop starts. Creates the canvas and initializes the coordinate converter.
   */
  p.setup = () => {
    // The GameView is created here to ensure that the p5.js canvas is initialized before the
    // CoordinateConverter is instantiated.
    gameView = new GameView(p)
  }

  /**
   * Called by p5.js once per animation frame to render the scene.
   */
  p.draw = () => {
    tomatoCenterPosition.x++
    gameView.draw(tomatoCenterPosition, TOMATO_DIAMETER)
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
