/**
 * Buffers mouse input between frames.
 *
 * Positions are kept in canvas space, in pixels, exactly as they arrived. It
 * is the controller's job to convert them to world space. The class has no
 * dependency on p5.
 */
export class PointerInput {
  /** @type {boolean} */
  #down = false

  /** @type {boolean} */
  #pressRequested = false

  /** @type {number} */
  #x = 0

  /** @type {number} */
  #y = 0

  /**
   * Records that the button was pressed at the given position.
   *
   * @param {number} x The x-coordinate in canvas space, in pixels.
   * @param {number} y The y-coordinate in canvas space, in pixels.
   */
  press = (x, y) => {
    this.#down = true
    this.#pressRequested = true
    this.move(x, y)
  }

  /**
   * Records that the pointer moved to the given position.
   *
   * @param {number} x The x-coordinate in canvas space, in pixels.
   * @param {number} y The y-coordinate in canvas space, in pixels.
   */
  move = (x, y) => {
    this.#x = x
    this.#y = y
  }

  /**
   * Records that the button was released.
   */
  release = () => {
    this.#down = false
  }

  /**
   * Whether the button is held down.
   *
   * @returns {boolean} True while the button is held, false otherwise.
   */
  get isDown() {
    return this.#down
  }

  /**
   * The last known x-coordinate, in canvas pixels.
   *
   * @returns {number} The x-coordinate.
   */
  get x() {
    return this.#x
  }

  /**
   * The last known y-coordinate, in canvas pixels.
   *
   * @returns {number} The y-coordinate.
   */
  get y() {
    return this.#y
  }

  /**
   * Reports whether the button was pressed since the last call, and clears the
   * request, so that one click gives exactly one action.
   *
   * @returns {boolean} True if the button was pressed, false otherwise.
   */
  consumePress = () => {
    const requested = this.#pressRequested
    this.#pressRequested = false
    return requested
  }
}
