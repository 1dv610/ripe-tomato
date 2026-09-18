/**
 * Represents a camera that converts world coordinates to canvas coordinates.
 */
export class Camera {
  /**
   * Creates a new Camera instance.
   *
   * @param {Number} height The height of the camera.
   * @param {Number} width The width of the camera.
   */
  constructor(height, width = 0) {
    this.height = height
    this.width = width
  }

  /**
   * Converts world coordinates to canvas coordinates.
   *
   * @param {*} x The x-coordinate in world space.
   * @param {*} y The y-coordinate in world space.
   * @returns The corresponding coordinates in canvas space.
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
