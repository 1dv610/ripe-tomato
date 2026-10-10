import { GameStatus } from '@/models/GameStatus.js'

/**
 * @typedef {import('p5').default} p5
 * @typedef {import('@/models/Game.js').Game} Game
 */

/**
 * Draws the heads-up display: title, progress, controls and status messages.
 */
export class HudView {
  /** @type {string} */
  static #TITLE = 'Ripe Tomato'

  /** @type {string} */
  static #CONTROLS = '← → / A D: move  ·  Space / ↑ / W / click: jump  ·  hold the mouse beside the tomato: move'

  /**
   * The message shown for each status where the game is over.
   *
   * @type {Map<GameStatus, string>}
   */
  static #MESSAGES = new Map([
    [GameStatus.LOST, 'Squashed! Press Space or click to try again.'],
    [GameStatus.WON, 'Ripe and ready! Press Space or click to play again.'],
  ])

  /** @type {p5} */
  #p

  /**
   * Creates a heads-up display.
   *
   * @param {p5} p The p5.js instance.
   */
  constructor(p) {
    this.#p = p
  }

  /**
   * Draws the heads-up display for the game's current state.
   *
   * @param {Game} game The game to describe.
   */
  draw = (game) => {
    const p = this.#p

    p.push()
    p.noStroke()

    p.fill(0)
    p.textAlign(p.CENTER, p.TOP)
    p.textSize(20)
    p.text(HudView.#TITLE, p.width / 2, 12)

    p.textAlign(p.LEFT, p.TOP)
    p.textSize(14)
    const progress = Math.min(100, Math.floor((game.tomato.x / game.finishX) * 100))
    p.text(`${progress}%`, 12, 16)

    p.fill(255)
    p.textAlign(p.CENTER, p.BOTTOM)
    p.textSize(12)
    p.text(HudView.#CONTROLS, p.width / 2, p.height - 10)

    const message = HudView.#MESSAGES.get(game.status)
    if (message) {
      this.#drawMessage(message)
    }

    p.pop()
  }

  /**
   * Draws a message centered on a translucent banner.
   *
   * @param {string} message The message to draw.
   */
  #drawMessage(message) {
    const p = this.#p
    const BANNER_HEIGHT = 60

    p.fill(0, 0, 0, 160)
    p.rect(0, p.height / 2 - BANNER_HEIGHT / 2, p.width, BANNER_HEIGHT)

    p.fill(255)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(20)
    p.text(message, p.width / 2, p.height / 2)
  }
}
