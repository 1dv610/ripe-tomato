/**
 * The tomato the player controls.
 *
 * Positions are measured in tomatoes in world space, with the y-axis pointing
 * up and `y = 0` on the ground. Time is measured in seconds.
 */
export class Tomato {
  /**
   * Horizontal speed while steering, in tomatoes per second.
   *
   * @type {number}
   */
  static #RUN_SPEED = 4

  /**
   * Vertical speed at the start of a jump, in tomatoes per second.
   *
   * @type {number}
   */
  static #JUMP_SPEED = 14

  /**
   * Downward acceleration, in tomatoes per second squared.
   *
   * @type {number}
   */
  static #GRAVITY = 30

  /** @type {number} */
  #x

  /** @type {number} */
  #y

  /** @type {number} */
  #radius

  /** @type {number} */
  #velocityY = 0

  /** @type {-1 | 0 | 1} */
  #direction = 0

  /**
   * Creates a tomato resting on the ground.
   *
   * @param {number} x The x-coordinate of the tomato's center, in tomatoes.
   * @param {number} [radius] The radius of the tomato, in tomatoes.
   * @throws {TypeError} Thrown if `x` or `radius` is not a finite number.
   * @throws {RangeError} Thrown if `radius` is not positive.
   */
  constructor(x, radius = 0.5) {
    if (!Number.isFinite(x) || !Number.isFinite(radius)) {
      throw new TypeError('x and radius must be finite numbers.')
    }
    if (radius <= 0) {
      throw new RangeError('radius must be a positive number.')
    }

    this.#radius = radius
    this.#x = Math.max(radius, x)
    this.#y = radius
  }

  /**
   * The x-coordinate of the tomato's center, in tomatoes.
   *
   * @returns {number} The x-coordinate.
   */
  get x() {
    return this.#x
  }

  /**
   * The y-coordinate of the tomato's center, in tomatoes.
   *
   * @returns {number} The y-coordinate.
   */
  get y() {
    return this.#y
  }

  /**
   * The radius of the tomato, in tomatoes.
   *
   * @returns {number} The radius.
   */
  get radius() {
    return this.#radius
  }

  /**
   * Whether the tomato is resting on the ground.
   *
   * @returns {boolean} True if the tomato is on the ground, false otherwise.
   */
  get isOnGround() {
    return this.#y <= this.#radius
  }

  /**
   * Sets the direction the tomato moves in until told otherwise.
   *
   * @param {-1 | 0 | 1} direction -1 for left, 1 for right, 0 to stand still.
   * @throws {RangeError} Thrown if `direction` is not -1, 0 or 1.
   */
  steer = (direction) => {
    if (direction !== -1 && direction !== 0 && direction !== 1) {
      throw new RangeError('direction must be -1, 0 or 1.')
    }
    this.#direction = direction
  }

  /**
   * Makes the tomato jump, if it is on the ground.
   */
  jump = () => {
    if (this.isOnGround) {
      this.#velocityY = Tomato.#JUMP_SPEED
    }
  }

  /**
   * Advances the tomato by the given time.
   *
   * @param {number} dt The elapsed time, in seconds.
   */
  update = (dt) => {
    // The world starts at x = 0, so the tomato can't leave it to the left.
    this.#x = Math.max(this.#radius, this.#x + this.#direction * Tomato.#RUN_SPEED * dt)

    this.#velocityY -= Tomato.#GRAVITY * dt
    this.#y += this.#velocityY * dt

    if (this.#y <= this.#radius) {
      this.#y = this.#radius
      this.#velocityY = 0
    }
  }
}
