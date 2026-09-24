import { CoordinateConverter } from '@/views/utils/CoordinateConverter.js'

/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 */

/**
 * The view for the game.
 */
export class GameView {
  /** @type {p5} */
  #p

  /** @type {CoordinateConverter} */
  #coordinateConverter

  /**
   * Creates a new GameView.
   *
   * @param {p5} p The p5.js instance.
   */
  constructor(p) {
    this.#p = p
    // The p5.js canvas must be initialized before creating the CoordinateConverter.
    p.createCanvas(400, 400)
    this.#coordinateConverter = new CoordinateConverter(p.height)
  }

  /**
   * Draws the game.
   *
   * @param {{x: number, y: number}} tomatoCenter The center position of the tomato in world space.
   * @param {number} tomatoDiameter The diameter of the tomato, in world-space units.
   */
  draw = (tomatoCenter, tomatoDiameter) => {
    this.#drawBackground()
    this.#drawTitle()
    this.#drawTomato(tomatoCenter.x, tomatoCenter.y, tomatoDiameter)
    this.#drawGround()
  }

  /**
   * Draws the background of the canvas with a sky blue color.
   */
  #drawBackground = () => {
    this.#p.background(135, 206, 235)
  }

  /**
   * Draws the sketch title centered near the top of the canvas.
   */
  #drawTitle = () => {
    const TITLE_TEXT_TOP_DISPLACEMENT = 20
    const TITLE = 'Ripe Tomato'

    this.#p.textAlign(this.#p.CENTER, this.#p.CENTER)
    this.#p.fill(0)
    this.#p.text(TITLE, this.#p.width / 2, TITLE_TEXT_TOP_DISPLACEMENT)
  }

  /**
   * Draws a tomato shape on the canvas.
   *
   * @param {number} centerPositionX The x-coordinate of the tomato's center in world space.
   * @param {number} centerPositionY The y-coordinate of the tomato's center in world space.
   * @param {number} diameter The diameter of the tomato, in world-space units.
   */
  #drawTomato = (centerPositionX, centerPositionY, diameter) => {
    const TOMATO_COLOR = [255, 0, 0]

    const { x, y } = this.#coordinateConverter.worldToCanvas(centerPositionX, centerPositionY)
    const diameterInPixels = diameter * CoordinateConverter.pixelsPerTomato

    this.#p.fill(TOMATO_COLOR)
    this.#p.ellipse(x, y, diameterInPixels, diameterInPixels)
  }

  /**
   * Draws the ground on the canvas with a specific color and height.
   */
  #drawGround = () => {
    const GROUND_COLOR = [34, 139, 34]
    const GROUND_HEIGHT = 1

    const { y } = this.#coordinateConverter.worldToCanvas(0, 0)

    this.#p.fill(GROUND_COLOR)
    this.#p.rect(0, y, this.#p.width, GROUND_HEIGHT * CoordinateConverter.pixelsPerTomato)
  }
}
