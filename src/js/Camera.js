/**
 * @typedef {object} CanvasCoordinates
 * @property {number} x The x-coordinate in canvas space.
 * @property {number} y The y-coordinate in canvas space.
 * @property {number} scale The scale factor for converting world-space sizes (e.g. a diameter) to canvas space.
 */

/**
 * Represents a camera that converts world coordinates to canvas coordinates.
 *
 * @property {number} height The height of the canvas, in pixels, that world-space y-coordinates are anchored and flipped against.
 */
export class Camera {
  /**
   * Creates a new Camera for a canvas of the given height.
   *
   * @param {number} height The height of the canvas, in pixels.
   */
  constructor(height) {
    this.height = height
  }

  /**
   * Converts world coordinates to canvas coordinates, along with the scale
   * factor needed to convert world-space sizes (e.g. a diameter) to canvas
   * space.
   *
   * @param {number} x The x-coordinate in world space.
   * @param {number} y The y-coordinate in world space.
   * @returns {CanvasCoordinates} The corresponding coordinates in canvas space, and the scale factor.
   */
  convertToCanvasCoordinates = (x, y) => {
    const GROUND_HEIGHT = 1
    const DISPLACEMENT = 10
    const SCALE = 100

    const canvasX = x * SCALE + DISPLACEMENT
    // Flip the y-axis (world space is y-up) and anchor y=0 above the ground strip.
    const canvasY = this.height - (y + GROUND_HEIGHT) * SCALE

    return { x: canvasX, y: canvasY, scale: SCALE }
  }
}
