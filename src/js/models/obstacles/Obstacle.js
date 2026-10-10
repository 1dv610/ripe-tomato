/**
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 */

/**
 * An abstract obstacle the tomato must avoid.
 *
 * Each subclass decides for itself what a collision means, so the game never
 * needs to know which kinds of obstacles exist. Methods are declared on the
 * prototype, not as arrow-function fields, so subclasses can override them.
 */
export class Obstacle {
  /** @type {number} */
  #x

  /** @type {number} */
  #width

  /**
   * Initializes the parts every obstacle has.
   *
   * @param {number} x The x-coordinate of the obstacle's left edge, in tomatoes.
   * @param {number} width The width of the obstacle, in tomatoes.
   * @throws {TypeError} Thrown if `Obstacle` is instantiated directly, or if an argument is not a finite number.
   * @throws {RangeError} Thrown if `width` is not positive.
   */
  constructor(x, width) {
    if (new.target === Obstacle) {
      throw new TypeError('Obstacle is abstract and cannot be instantiated directly.')
    }
    if (!Number.isFinite(x) || !Number.isFinite(width)) {
      throw new TypeError('x and width must be finite numbers.')
    }
    if (width <= 0) {
      throw new RangeError('width must be a positive number.')
    }

    this.#x = x
    this.#width = width
  }

  /**
   * The x-coordinate of the obstacle's left edge, in tomatoes.
   *
   * @returns {number} The x-coordinate.
   */
  get x() {
    return this.#x
  }

  /**
   * The width of the obstacle, in tomatoes.
   *
   * @returns {number} The width.
   */
  get width() {
    return this.#width
  }

  /**
   * Advances the obstacle by the given time. Obstacles that stand still keep
   * this default, which does nothing.
   *
   * @param {number} dt The elapsed time, in seconds.
   */
  // eslint-disable-next-line no-unused-vars
  update(dt) {}

  /**
   * Determines whether the tomato collides with the obstacle.
   *
   * @abstract
   * @param {Tomato} tomato The tomato to test.
   * @returns {boolean} True if the tomato collides with the obstacle, false otherwise.
   */
  // eslint-disable-next-line no-unused-vars
  collidesWith(tomato) {
    throw new Error(`${this.constructor.name} must implement collidesWith().`)
  }
}
