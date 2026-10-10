import { circleIntersectsRect } from '@/models/geometry.js'
import { Obstacle } from '@/models/obstacles/Obstacle.js'

/**
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 */

/**
 * A bird that flies up and down along a sine curve. The tomato has to time
 * its passage, either under the bird or over it.
 */
export class Bird extends Obstacle {
  /** @type {number} */
  static #WIDTH = 0.8

  /** @type {number} */
  static #HEIGHT = 0.5

  /** @type {number} */
  #baseY

  /** @type {number} */
  #amplitude

  /** @type {number} */
  #period

  /** @type {number} */
  #elapsed = 0

  /**
   * Creates a bird.
   *
   * @param {number} x The x-coordinate of the bird's left edge, in tomatoes.
   * @param {number} baseY The y-coordinate the bird's center oscillates around, in tomatoes.
   * @param {number} amplitude How far the bird's center moves above and below `baseY`, in tomatoes.
   * @param {number} period The time for one full oscillation, in seconds.
   * @throws {TypeError} Thrown if an argument is not a finite number.
   * @throws {RangeError} Thrown if `amplitude` is negative or `period` is not positive.
   */
  constructor(x, baseY, amplitude, period) {
    super(x, Bird.#WIDTH)

    if (!Number.isFinite(baseY) || !Number.isFinite(amplitude) || !Number.isFinite(period)) {
      throw new TypeError('baseY, amplitude and period must be finite numbers.')
    }
    if (amplitude < 0) {
      throw new RangeError('amplitude must not be negative.')
    }
    if (period <= 0) {
      throw new RangeError('period must be a positive number.')
    }

    this.#baseY = baseY
    this.#amplitude = amplitude
    this.#period = period
  }

  /**
   * The current y-coordinate of the bird's center, in tomatoes.
   *
   * @returns {number} The y-coordinate.
   */
  get y() {
    return this.#baseY + this.#amplitude * Math.sin((2 * Math.PI * this.#elapsed) / this.#period)
  }

  /**
   * The height of the bird, in tomatoes.
   *
   * @returns {number} The height.
   */
  get height() {
    return Bird.#HEIGHT
  }

  /**
   * Moves the bird along its flight path.
   *
   * @param {number} dt The elapsed time, in seconds.
   */
  update(dt) {
    this.#elapsed += dt
  }

  /**
   * Determines whether the tomato overlaps the bird where it is now.
   *
   * @param {Tomato} tomato The tomato to test.
   * @returns {boolean} True if the tomato overlaps the bird, false otherwise.
   */
  collidesWith(tomato) {
    return circleIntersectsRect(tomato, {
      left: this.x,
      bottom: this.y - Bird.#HEIGHT / 2,
      width: this.width,
      height: Bird.#HEIGHT,
    })
  }
}
