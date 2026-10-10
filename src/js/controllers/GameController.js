/**
 * @typedef {import('@/models/Game.js').Game} Game
 * @typedef {import('@/views/Camera.js').Camera} Camera
 * @typedef {import('@/controllers/KeyboardInput.js').KeyboardInput} KeyboardInput
 * @typedef {import('@/controllers/PointerInput.js').PointerInput} PointerInput
 */

/**
 * Translates the player's intentions into commands on the game.
 *
 * Keyboard and mouse produce the same intentions: a direction to move in and
 * a request to jump. When both give a direction, the keyboard wins. Whether a
 * jump request means "jump" or "start over" depends on whether the game is
 * over; that is a rule for the interface, not a game rule, so it lives here.
 */
export class GameController {
  /**
   * How close to the tomato, in tomatoes, a held mouse button is ignored, so
   * the tomato doesn't jitter around the pointer.
   *
   * @type {number}
   */
  static #DEAD_ZONE = 0.25

  /** @type {Game} */
  #game

  /** @type {Camera} */
  #camera

  /** @type {KeyboardInput} */
  #keyboard

  /** @type {PointerInput} */
  #pointer

  /**
   * Creates a controller.
   *
   * @param {Game} game The game to send commands to.
   * @param {Camera} camera The camera the view draws with, used to convert pointer positions to world space.
   * @param {KeyboardInput} keyboard The buffered keyboard input.
   * @param {PointerInput} pointer The buffered mouse input.
   */
  constructor(game, camera, keyboard, pointer) {
    this.#game = game
    this.#camera = camera
    this.#keyboard = keyboard
    this.#pointer = pointer
  }

  /**
   * Applies the input buffered since the last frame.
   */
  update = () => {
    // Consume both requests every frame, so a stale one is never applied later.
    const jumpRequested = this.#keyboard.consumeJump()
    const pressRequested = this.#pointer.consumePress()

    if (jumpRequested || pressRequested) {
      if (this.#game.isOver) {
        this.#game.restart()
      } else {
        this.#game.jump()
      }
    }

    this.#game.steer(this.#keyboard.direction || this.#pointerDirection())
  }

  /**
   * The direction from the tomato to a held mouse button.
   *
   * @returns {-1 | 0 | 1} -1 if the pointer is to the left, 1 if it is to the right, otherwise 0.
   */
  #pointerDirection = () => {
    if (!this.#pointer.isDown) {
      return 0
    }

    const { x } = this.#camera.canvasToWorld(this.#pointer.x, this.#pointer.y)
    const distance = x - this.#game.tomato.x
    if (Math.abs(distance) < GameController.#DEAD_ZONE) {
      return 0
    }
    return distance < 0 ? -1 : 1
  }
}
