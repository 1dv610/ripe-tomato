/**
 * @typedef {object} CanvasCoordinates
 * @property {number} x The x-coordinate in canvas space, in pixels.
 * @property {number} y The y-coordinate in canvas space, in pixels.
 */

/**
 * Converts between the game's world space and the p5.js canvas's pixel space.
 *
 * World space is measured in tomatoes, with the y-axis pointing up and `y = 0`
 * resting on the ground. Canvas space is measured in pixels, with the y-axis
 * pointing down from the top-left corner, as is conventional for screen and
 * canvas coordinates.
 */
export class CoordinateConverter {
  /** @type {number} */
  static #PIXELS_PER_TOMATO = 100

  /** @type {number} */
  static #GROUND_HEIGHT_TOMATOES = 1

  /**
   * Horizontal margin, in pixels, so shapes don't render flush against the canvas edge.
   *
   * @type {number}
   */
  static #DISPLACEMENT_PIXELS = 10

  /** @type {number} */
  #height

  /**
   * Creates a `CoordinateConverter` for a canvas of the given height.
   *
   * @param {number} height The height of the canvas, in whole pixels.
   * @throws {TypeError} Thrown if `height` is not a number, or is `NaN`.
   * @throws {RangeError} Thrown if `height` is not a positive integer.
   */
  constructor(height) {
    if (typeof height !== 'number' || Number.isNaN(height)) {
      throw new TypeError('height must be a valid number.')
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new RangeError('height must be a positive integer.')
    }

    this.#height = height
  }

  /**
   * The scale factor between world space and canvas space: the number of
   * pixels that make up one tomato. Useful for converting world-space sizes
   * (e.g. a diameter) to canvas-space pixels, such as when sizing a sprite.
   *
   * @type {number}
   */
  static get pixelsPerTomato() {
    return CoordinateConverter.#PIXELS_PER_TOMATO
  }

  /**
   * Converts a world-space position, in tomatoes, to its corresponding
   * canvas-space position, in pixels.
   *
   * @param {number} x The x-coordinate in world space, in tomatoes.
   * @param {number} y The y-coordinate in world space, in tomatoes.
   * @returns {CanvasCoordinates} The corresponding position in canvas space.
   * @example
   * For a 480px-tall canvas, `worldToCanvas(0, 0)` returns `{ x: 10, y: 380 }`.
   *
   * const converter = new CoordinateConverter(480)
   * const { x, y } = converter.worldToCanvas(0, 0)
   */
  worldToCanvas = (x, y) => {
    const canvasX = x * CoordinateConverter.#PIXELS_PER_TOMATO + CoordinateConverter.#DISPLACEMENT_PIXELS

    // Flip the y-axis and anchor y = 0 (the ground) just above the ground strip.
    const heightAboveCanvasBottom = y + CoordinateConverter.#GROUND_HEIGHT_TOMATOES
    const canvasY = this.#height - heightAboveCanvasBottom * CoordinateConverter.#PIXELS_PER_TOMATO

    return { x: canvasX, y: canvasY }
  }
}
