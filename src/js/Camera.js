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
   * Converts world coordinates to canvas coordinates.
   *
   * @param {number} x The x-coordinate in world space.
   * @param {number} y The y-coordinate in world space.
   * @returns {{x: number, y: number, scale: number}} The corresponding coordinates in canvas space.
   */
  convertToCanvasCoordinates = (x, y) => {
    const GROUND_HEIGHT = 1
    const DISPLACEMENT = 10

    const scale = 100
    const canvasX = x * scale + DISPLACEMENT
    const canvasY = this.height - (y + GROUND_HEIGHT) * scale

    return { x: canvasX, y: canvasY, scale }
  }
}
