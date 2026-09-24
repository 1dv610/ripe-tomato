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
   * @param {*} centerX
   * @param {*} centerY
   * @param {*} diameter
   */
  constructor(centerX, centerY, diameter = 1) {
    this.#centerX = centerX
    this.#centerY = centerY
    this.#diameter = diameter
  }

  get centerX() {
    return this.#centerX
  }
  get centerY() {
    return this.#centerY
  }
  get diameter() {
    return this.#diameter
  }
}
