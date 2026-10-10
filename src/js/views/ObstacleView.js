import { Bird } from '@/models/obstacles/Bird.js'
import { Crate } from '@/models/obstacles/Crate.js'
import { Pit } from '@/models/obstacles/Pit.js'

/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/obstacles/Obstacle.js').Obstacle} Obstacle
 * @typedef {import('@/views/Camera.js').Camera} Camera
 */

/**
 * Draws obstacles, choosing a drawing function by the obstacle's class.
 *
 * Giving each obstacle a `draw(p)` method would make the model depend on p5.
 * Instead, a new kind of obstacle needs a class in `models/obstacles/` and a
 * line in `#renderers` here. A missing line fails loudly on the first frame.
 */
export class ObstacleView {
  /** @type {number[]} */
  static #CRATE_COLOR = [160, 110, 60]

  /** @type {number[]} */
  static #CRATE_EDGE_COLOR = [110, 70, 35]

  /** @type {number[]} */
  static #BIRD_COLOR = [55, 60, 70]

  /** @type {number[]} */
  static #BEAK_COLOR = [245, 170, 40]

  /** @type {number[]} */
  static #PIT_COLOR = [45, 30, 20]

  /** @type {p5} */
  #p

  /** @type {Camera} */
  #camera

  /**
   * The drawing function for each kind of obstacle, keyed by its class.
   *
   * @type {Map<new (...args: any[]) => Obstacle, (obstacle: any) => void>}
   */
  #renderers = new Map([
    [Crate, (crate) => this.#drawCrate(crate)],
    [Bird, (bird) => this.#drawBird(bird)],
    [Pit, (pit) => this.#drawPit(pit)],
  ])

  /**
   * Creates an obstacle view.
   *
   * @param {p5} p The p5.js instance.
   * @param {Camera} camera The camera to draw with.
   */
  constructor(p, camera) {
    this.#p = p
    this.#camera = camera
  }

  /**
   * Draws an obstacle where it is now.
   *
   * @param {Obstacle} obstacle The obstacle to draw.
   * @throws {Error} Thrown if there is no drawing function for the obstacle's class.
   */
  draw = (obstacle) => {
    const render = this.#renderers.get(obstacle.constructor)
    if (!render) {
      throw new Error(`No renderer for ${obstacle.constructor.name}.`)
    }

    this.#p.push()
    render(obstacle)
    this.#p.pop()
  }

  /**
   * Draws a crate as a box with a cross brace.
   *
   * @param {Crate} crate The crate to draw.
   */
  #drawCrate(crate) {
    const p = this.#p
    const { x, y } = this.#camera.worldToCanvas(crate.x, crate.height)
    const width = this.#camera.toPixels(crate.width)
    const height = this.#camera.toPixels(crate.height)

    p.stroke(ObstacleView.#CRATE_EDGE_COLOR)
    p.strokeWeight(3)
    p.fill(ObstacleView.#CRATE_COLOR)
    p.rect(x, y, width, height)
    p.line(x, y, x + width, y + height)
    p.line(x + width, y, x, y + height)
  }

  /**
   * Draws a bird as a body with a beak pointing toward the tomato.
   *
   * @param {Bird} bird The bird to draw.
   */
  #drawBird(bird) {
    const p = this.#p
    const { x, y } = this.#camera.worldToCanvas(bird.x, bird.y)
    const width = this.#camera.toPixels(bird.width)
    const height = this.#camera.toPixels(bird.height)

    p.noStroke()
    p.fill(ObstacleView.#BEAK_COLOR)
    p.triangle(x + width * 0.1, y - height * 0.15, x + width * 0.1, y + height * 0.15, x - width * 0.15, y)
    p.fill(ObstacleView.#BIRD_COLOR)
    p.ellipse(x + width / 2, y, width, height)
    p.triangle(x + width * 0.35, y, x + width * 0.75, y, x + width * 0.6, y - height * 0.9)
  }

  /**
   * Draws a pit as a hole in the ground strip.
   *
   * @param {Pit} pit The pit to draw.
   */
  #drawPit(pit) {
    const p = this.#p
    const { x, y } = this.#camera.worldToCanvas(pit.x, 0)

    p.noStroke()
    p.fill(ObstacleView.#PIT_COLOR)
    p.rect(x, y, this.#camera.toPixels(pit.width), p.height - y)
  }
}
