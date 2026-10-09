import { CoordinateConverter } from '@/views/utils/CoordinateConverter.js'

/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/GameCharacter.js').GameCharacter} GameCharacter
 */

/**
 * The view for the game.
 */
export class GameView {
  /** @type {p5} */
  #p

  #game

  /** @type {CoordinateConverter} */
  #coordinateConverter

  /**
   * Creates a new GameView.
   *
   * @param {p5} p The p5.js instance.
   * @param {Game} game The game to view.
   */
  constructor(p, game) {
    this.#p = p
    this.#game = game
    // The p5.js canvas must be initialized before creating the CoordinateConverter.
    p.createCanvas(400, 400)
    this.#coordinateConverter = new CoordinateConverter(p.height)
  }

  /**
   * Draws the game.
   */
  draw = () => {
    this.#drawBackground()
    this.#drawTitle()
    this.#drawTomato(this.#game.gameCharacter)
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
   * @param {GameCharacter} gameCharacter The game character to draw.
   */
  #drawTomato = (gameCharacter) => {
    const TOMATO_COLOR = [255, 0, 0]

    const { x, y } = this.#coordinateConverter.worldToCanvas(gameCharacter.centerX, gameCharacter.centerY)
    const diameterInPixels = gameCharacter.diameter * CoordinateConverter.pixelsPerTomato

    this.#p.fill(TOMATO_COLOR)
    this.#p.ellipse(x, y, diameterInPixels, diameterInPixels)
  }

  /**
   * Draws the ground on the canvas with a specific color and height.
   */
  #drawGround = () => {
    const GROUND_COLOR = [34, 139, 34]

    const { y } = this.#coordinateConverter.worldToCanvas(0, 0)

    this.#p.fill(GROUND_COLOR)
    this.#p.rect(0, y, this.#p.width, this.#game.groundHeight * CoordinateConverter.pixelsPerTomato)
  }
}
