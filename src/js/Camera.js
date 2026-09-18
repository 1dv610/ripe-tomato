/**
 * Represents a camera that converts world coordinates to canvas coordinates.
 */
export class Camera {
  /**
   * Creates a new Camera instance.
   *
   * @param {number} height The height of the camera.
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
   * @returns {{x: number, y: number, scale: number}} The corresponding coordinates in canvas space, and the scale factor.
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
