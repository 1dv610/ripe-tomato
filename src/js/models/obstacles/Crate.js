import { circleIntersectsRect } from '@/models/geometry.js'
import { Obstacle } from '@/models/obstacles/Obstacle.js'

/**
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 */

/**
 * A crate that stands still on the ground. The tomato has to jump over it.
 */
export class Crate extends Obstacle {
  /** @type {number} */
  #height

  /**
   * Creates a crate resting on the ground.
   *
   * @param {number} x The x-coordinate of the crate's left edge, in tomatoes.
   * @param {number} width The width of the crate, in tomatoes.
   * @param {number} height The height of the crate, in tomatoes.
   * @throws {TypeError} Thrown if an argument is not a finite number.
   * @throws {RangeError} Thrown if `width` or `height` is not positive.
   */
  constructor(x, width, height) {
    super(x, width)

    if (!Number.isFinite(height)) {
      throw new TypeError('height must be a finite number.')
    }
    if (height <= 0) {
      throw new RangeError('height must be a positive number.')
    }

    this.#height = height
  }

  /**
   * The height of the crate, in tomatoes.
   *
   * @returns {number} The height.
   */
  get height() {
    return this.#height
  }

  /**
   * Determines whether the tomato overlaps the crate.
   *
   * @param {Tomato} tomato The tomato to test.
   * @returns {boolean} True if the tomato overlaps the crate, false otherwise.
   */
  collidesWith(tomato) {
    return circleIntersectsRect(tomato, { left: this.x, bottom: 0, width: this.width, height: this.#height })
  }
}
