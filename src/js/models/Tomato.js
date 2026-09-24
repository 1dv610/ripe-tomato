/**
 * Represents a tomato in the game.
 *
 * A tomato has a center position in world space, measured in tomatoes, and a
 * diameter, also measured in tomatoes. The y-axis points up, with `y = 0`
 * resting on the ground.
 */
export class Tomato {
  /** @type {number} */
  #centerX

  /** @type {number} */
  #centerY

  /** @type {number} */
  #diameter

  /**
   * Creates a new Tomato.
   *
   * @param {number} centerX The x-coordinate of the tomato's center in world space.
   * @param {number} centerY The y-coordinate of the tomato's center in world space.
   * @param {number} diameter The diameter of the tomato, in world-space
   */
  constructor(centerX, centerY, diameter = 1) {
    this.#centerX = centerX
    this.#centerY = centerY
    this.#diameter = diameter
  }

  /**
   * The center x-coordinate of the tomato in world space.
   *
   * @returns {number} The x-coordinate of the tomato's center in world space.
   */
  get centerX() {
    return this.#centerX
  }
  /**
   * The center y-coordinate of the tomato in world space.
   *
   * @returns {number} The y-coordinate of the tomato's center in world space.
   */
  get centerY() {
    return this.#centerY
  }
  /**
   * The diameter of the tomato in world space.
   *
   * @returns {number} The diameter of the tomato, in world-space.
   */
  get diameter() {
    return this.#diameter
  }
}
