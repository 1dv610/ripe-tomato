/**
 * @typedef {object} CanvasCoordinates
 * @property {number} x The x-coordinate in canvas space, in pixels.
 * @property {number} y The y-coordinate in canvas space, in pixels.
 */

/**
 * @typedef {object} WorldCoordinates
 * @property {number} x The x-coordinate in world space, in tomatoes.
 * @property {number} y The y-coordinate in world space, in tomatoes.
 */

/**
 * Converts between the game's world space and the canvas's pixel space, and
 * pans sideways to follow a position.
 *
 * World space is measured in tomatoes, with the y-axis pointing up and `y = 0`
 * on the ground. Canvas space is measured in pixels, with the y-axis pointing
 * down from the top-left corner.
 *
 * The camera is presentation state shared by the view and the controller: the
 * view moves it while drawing, and the controller converts pointer positions
 * with it, so a click is interpreted against what the player actually saw.
 */
export class Camera {
  /** @type {number} */
  static #PIXELS_PER_TOMATO = 60

  /**
   * The height of the ground strip below `y = 0`, in pixels. The model's
   * ground has no thickness; how thick it looks is a presentation matter.
   *
   * @type {number}
   */
  static #GROUND_HEIGHT_PIXELS = 60

  /**
   * Where the followed position appears, in pixels from the left edge.
   *
   * @type {number}
   */
  static #LEAD_PIXELS = 200

  /** @type {number} */
  #canvasHeight

  /**
   * The world x-coordinate shown at the left edge of the canvas, in tomatoes.
   *
   * @type {number}
   */
  #offsetX = 0

  /**
   * Creates a camera for a canvas of the given height.
   *
   * @param {number} canvasHeight The height of the canvas, in whole pixels.
   * @throws {TypeError} Thrown if `canvasHeight` is not a finite number.
   * @throws {RangeError} Thrown if `canvasHeight` is not a positive integer taller than the ground strip.
   */
  constructor(canvasHeight) {
    if (!Number.isFinite(canvasHeight)) {
      throw new TypeError('canvasHeight must be a finite number.')
    }
    if (!Number.isInteger(canvasHeight) || canvasHeight <= Camera.#GROUND_HEIGHT_PIXELS) {
      throw new RangeError(`canvasHeight must be an integer greater than ${Camera.#GROUND_HEIGHT_PIXELS}.`)
    }

    this.#canvasHeight = canvasHeight
  }

  /**
   * The canvas y-coordinate of the ground, `y = 0` in world space, in pixels.
   *
   * @returns {number} The y-coordinate.
   */
  get groundY() {
    return this.#canvasHeight - Camera.#GROUND_HEIGHT_PIXELS
  }

  /**
   * Pans the camera so that the given world position appears at a fixed
   * distance from the left edge. The camera never shows anything left of the
   * start of the world.
   *
   * @param {number} worldX The x-coordinate to follow, in tomatoes.
   */
  follow = (worldX) => {
    this.#offsetX = Math.max(0, worldX - Camera.#LEAD_PIXELS / Camera.#PIXELS_PER_TOMATO)
  }

  /**
   * Converts a length in world space to pixels.
   *
   * @param {number} length The length, in tomatoes.
   * @returns {number} The length, in pixels.
   */
  toPixels = (length) => length * Camera.#PIXELS_PER_TOMATO

  /**
   * Converts a world-space position to canvas space.
   *
   * @param {number} x The x-coordinate in world space, in tomatoes.
   * @param {number} y The y-coordinate in world space, in tomatoes.
   * @returns {CanvasCoordinates} The corresponding position in canvas space.
   * @example
   * // For a 400px-tall canvas before the camera has moved:
   * new Camera(400).worldToCanvas(0, 0) // { x: 0, y: 340 }
   */
  worldToCanvas = (x, y) => ({
    x: (x - this.#offsetX) * Camera.#PIXELS_PER_TOMATO,
    y: this.groundY - y * Camera.#PIXELS_PER_TOMATO,
  })

  /**
   * Converts a canvas-space position to world space. The inverse of `worldToCanvas`.
   *
   * @param {number} x The x-coordinate in canvas space, in pixels.
   * @param {number} y The y-coordinate in canvas space, in pixels.
   * @returns {WorldCoordinates} The corresponding position in world space.
   */
  canvasToWorld = (x, y) => ({
    x: x / Camera.#PIXELS_PER_TOMATO + this.#offsetX,
    y: (this.groundY - y) / Camera.#PIXELS_PER_TOMATO,
  })
}
