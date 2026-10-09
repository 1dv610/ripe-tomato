/**
 * @typedef {import('@/models/Game.js').Game} Game
 * @typedef {import('@/views/GameView.js').GameView} GameView
 * @typedef {import('@/views/Input.js').Input} Input
 */

/**
 * GameController is responsible for updating the game state and view based on user input.
 */
export class GameController {
  #game
  #gameView
  #input

  /**
   * Creates a new GameController.
   *
   * @param {Game} game The game to control.
   * @param {GameView} gameView The view for the game.
   * @param {Input} input The input for the game.
   */
  constructor(game, gameView, input) {
    this.#game = game
    this.#gameView = gameView
    this.#input = input
  }

  /**
   * Updates the game state and view based on user input.
   * If the player wants to jump, the game character will jump.
   * The game view will be drawn after updating the game state.
   */
  update = () => {
    if (this.#input.playerWantToJump()) {
      this.#game.jump()
    }
    this.#gameView.draw()
  }
}
