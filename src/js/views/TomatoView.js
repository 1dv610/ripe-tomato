/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 * @typedef {import('@/views/Camera.js').Camera} Camera
 */

/**
 * Draws the tomato.
 */
export class TomatoView {
  /** @type {number[]} */
  static #SKIN_COLOR = [214, 40, 40]

  /** @type {number[]} */
  static #STEM_COLOR = [46, 125, 50]

  /** @type {p5} */
  #p

  /** @type {Camera} */
  #camera

  /**
   * Creates a tomato view.
   *
   * @param {p5} p The p5.js instance.
   * @param {Camera} camera The camera to draw with.
   */
  constructor(p, camera) {
    this.#p = p
    this.#camera = camera
  }

  /**
   * Draws the tomato where it is now.
   *
   * @param {Tomato} tomato The tomato to draw.
   */
  draw = (tomato) => {
    const p = this.#p
    const { x, y } = this.#camera.worldToCanvas(tomato.x, tomato.y)
    const diameter = this.#camera.toPixels(tomato.radius * 2)

    p.push()
    p.noStroke()
    p.fill(TomatoView.#SKIN_COLOR)
    p.circle(x, y, diameter)

    p.fill(TomatoView.#STEM_COLOR)
    p.ellipse(x, y - diameter * 0.45, diameter * 0.45, diameter * 0.18)
    p.rect(x - diameter * 0.04, y - diameter * 0.62, diameter * 0.08, diameter * 0.16)
    p.pop()
  }
}
