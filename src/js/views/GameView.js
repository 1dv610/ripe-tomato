import { HudView } from '@/views/HudView.js'
import { ObstacleView } from '@/views/ObstacleView.js'
import { TomatoView } from '@/views/TomatoView.js'

/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/Game.js').Game} Game
 * @typedef {import('@/views/Camera.js').Camera} Camera
 */

/**
 * The view for the game: decides what is drawn, and in which order.
 *
 * Reads the game's state every frame but never changes it. The only state it
 * changes is its own presentation state: where the camera is.
 */
export class GameView {
  /** @type {number[]} */
  static #SKY_COLOR = [135, 206, 235]

  /** @type {number[]} */
  static #GROUND_COLOR = [34, 139, 34]

  /** @type {number[]} */
  static #FLAG_COLOR = [255, 255, 255]

  /** @type {p5} */
  #p

  /** @type {Game} */
  #game

  /** @type {Camera} */
  #camera

  /** @type {TomatoView} */
  #tomatoView

  /** @type {ObstacleView} */
  #obstacleView

  /** @type {HudView} */
  #hudView

  /**
   * Creates the game view. The canvas must already exist.
   *
   * @param {p5} p The p5.js instance.
   * @param {Game} game The game to draw.
   * @param {Camera} camera The camera to draw with, shared with the controller.
   */
  constructor(p, game, camera) {
    this.#p = p
    this.#game = game
    this.#camera = camera
    this.#tomatoView = new TomatoView(p, camera)
    this.#obstacleView = new ObstacleView(p, camera)
    this.#hudView = new HudView(p)
  }

  /**
   * Draws the game as it is now.
   */
  draw = () => {
    this.#camera.follow(this.#game.tomato.x)

    this.#drawSky()
    this.#drawGround()
    // Pits are drawn after the ground, so they show as holes in it.
    this.#game.obstacles.forEach(this.#obstacleView.draw)
    this.#drawFinishLine(this.#game.finishX)
    this.#tomatoView.draw(this.#game.tomato)
    this.#hudView.draw(this.#game)
  }

  /**
   * Fills the canvas with the sky.
   */
  #drawSky() {
    this.#p.background(GameView.#SKY_COLOR)
  }

  /**
   * Draws the ground strip below `y = 0`.
   */
  #drawGround() {
    const p = this.#p
    const { groundY } = this.#camera

    p.push()
    p.noStroke()
    p.fill(GameView.#GROUND_COLOR)
    p.rect(0, groundY, p.width, p.height - groundY)
    p.pop()
  }

  /**
   * Draws a flag at the finish line.
   *
   * @param {number} finishX The x-coordinate of the finish line, in tomatoes.
   */
  #drawFinishLine(finishX) {
    const p = this.#p
    const { x, y } = this.#camera.worldToCanvas(finishX, 0)
    const poleHeight = this.#camera.toPixels(3)
    const flagSize = this.#camera.toPixels(0.6)

    p.push()
    p.stroke(0)
    p.strokeWeight(3)
    p.line(x, y, x, y - poleHeight)
    p.noStroke()
    p.fill(GameView.#FLAG_COLOR)
    p.triangle(x, y - poleHeight, x, y - poleHeight + flagSize, x + flagSize * 1.4, y - poleHeight + flagSize / 2)
    p.pop()
  }
}
