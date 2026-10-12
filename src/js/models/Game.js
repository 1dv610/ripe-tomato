import { GameStatus } from '@/models/GameStatus.js'
import { Tomato } from '@/models/Tomato.js'

/**
 * @typedef {import('@/models/levels.js').Level} Level
 * @typedef {import('@/models/obstacles/Obstacle.js').Obstacle} Obstacle
 */

/**
 * The game: the single entry point to the model.
 *
 * Owns the rules for the whole game: when it is over, what a collision means
 * and when the level is completed. Knows nothing about pixels, keys or p5.
 */
export class Game {
  /**
   * The longest step the simulation takes, in seconds. After a hidden tab,
   * the time since the last frame can be several seconds, which would let the
   * tomato pass straight through an obstacle.
   *
   * @type {number}
   */
  static #MAX_TIME_STEP = 1 / 30

  /**
   * The x-coordinate of the tomato's center when a level starts, in tomatoes.
   *
   * @type {number}
   */
  static #START_X = 1

  /** @type {() => Level} */
  #createLevel

  /** @type {Tomato} */
  #tomato

  /** @type {Obstacle[]} */
  #obstacles

  /** @type {number} */
  #finishX

  /** @type {GameStatus} */
  #status

  /**
   * Creates a game and starts its level.
   *
   * @param {() => Level} createLevel Creates the level, with fresh obstacles, each time the game starts.
   * @throws {TypeError} Thrown if `createLevel` is not a function.
   */
  constructor(createLevel) {
    if (typeof createLevel !== 'function') {
      throw new TypeError('createLevel must be a function.')
    }

    this.#createLevel = createLevel
    this.restart()
  }

  /**
   * The tomato. The view reads it; only the game changes it.
   *
   * @returns {Tomato} The tomato.
   */
  get tomato() {
    return this.#tomato
  }

  /**
   * The obstacles in the level. The list is a copy, so obstacles can't be
   * added or removed from outside.
   *
   * @returns {Obstacle[]} The obstacles.
   */
  get obstacles() {
    return [...this.#obstacles]
  }

  /**
   * The x-coordinate the tomato must reach to win, in tomatoes.
   *
   * @returns {number} The x-coordinate of the finish line.
   */
  get finishX() {
    return this.#finishX
  }

  /**
   * The current status of the game.
   *
   * @returns {GameStatus} The status.
   */
  get status() {
    return this.#status
  }

  /**
   * Whether the game has been won or lost.
   *
   * @returns {boolean} True if the game is over, false while it is being played.
   */
  get isOver() {
    return this.#status !== GameStatus.PLAYING
  }

  /**
   * Starts the level over, with a new tomato and new obstacles.
   */
  restart = () => {
    const { obstacles, finishX } = this.#createLevel()

    this.#tomato = new Tomato(Game.#START_X)
    this.#obstacles = obstacles
    this.#finishX = finishX
    this.#status = GameStatus.PLAYING
  }

  /**
   * Makes the tomato jump, while the game is being played.
   */
  jump = () => {
    if (!this.isOver) {
      this.#tomato.jump()
    }
  }

  /**
   * Sets the direction the tomato moves in, while the game is being played.
   *
   * @param {-1 | 0 | 1} direction -1 for left, 1 for right, 0 to stand still.
   */
  steer = (direction) => {
    if (!this.isOver) {
      this.#tomato.steer(direction)
    }
  }

  /**
   * Advances the game by the given time and applies its rules.
   *
   * @param {number} dt The elapsed time, in seconds.
   */
  update = (dt) => {
    if (this.isOver) {
      return
    }

    const step = Math.min(dt, Game.#MAX_TIME_STEP)
    this.#tomato.update(step)
    this.#obstacles.forEach((obstacle) => obstacle.update(step))

    if (this.#obstacles.some((obstacle) => obstacle.collidesWith(this.#tomato))) {
      this.#status = GameStatus.LOST
    } else if (this.#tomato.x >= this.#finishX) {
      this.#status = GameStatus.WON
    }
  }
}
