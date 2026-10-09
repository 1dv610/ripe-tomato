import p5 from 'p5'
import { GameCharacter } from '@/models/GameCharacter.js'
import { Game } from '@/models/Game.js'
import { GameController } from '@/controllers/GameController.js'
import { GameView } from '@/views/GameView.js'

/**
 * The main sketch for the p5.js application.
 *
 * @param {p5} p The p5.js instance.
 */
const sketch = (p) => {
  /**
   * The center x-coordinate of the tomato in world space.
   *
   * @type {number}
   */
  const TOMATO_CENTER_X = 1

  /**
   * The center y-coordinate of the tomato in world space.
   *
   * @type {number}
   */
  const TOMATO_CENTER_Y = 0.5

  /**
   * The diameter of the tomato in world space.
   *
   * @type {number}
   */
  const TOMATO_DIAMETER = 1

  let gameView
  let game
  let gameController

  /**
   * Called once by p5.js before the draw loop starts. Creates the canvas and initializes the coordinate converter.
   */
  p.setup = () => {
    game = new Game(new GameCharacter(TOMATO_CENTER_X, TOMATO_CENTER_Y, TOMATO_DIAMETER))
    // The GameView is created here to ensure that the p5.js canvas is initialized before the
    // CoordinateConverter is instantiated.
    gameView = new GameView(p, game)
    gameController = new GameController(game, gameView)
  }

  /**
   * Called by p5.js once per animation frame to render the scene.
   */
  p.draw = () => {
    gameController.update()
  }
}

// Create a new p5 instance and attach it to the 'app' div in the HTML.
new p5(sketch, document.querySelector('#app'))
