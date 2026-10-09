import { GameCharacter } from '@/models/GameCharacter.js'

/**
 * Represents the game state and logic.
 */
export class Game {
  /** @type {GameCharacter} */
  #gameCharacter

  #groundHeight

  /**
   * Creates a new Game instance.
   *
   * @param {GameCharacter} gameCharacter The game character to be used in the game.
   */
  constructor(gameCharacter) {
    this.#gameCharacter = gameCharacter
    this.#groundHeight = 1
  }

  /**
   * The game character in the game.
   *
   * @returns {GameCharacter} The game character in the game.
   */
  get gameCharacter() {
    // Privacy leak: Returning the private field directly allows external code to modify the GameCharacter instance, which may not be intended. Consider returning a copy or a read-only view of the GameCharacter instead.
    return this.#gameCharacter
  }

  /**
   * The height of the ground in the game.
   *
   * @returns {number} The height of the ground in the game.
   */
  get groundHeight() {
    return this.#groundHeight
  }

  get #isGameCharacterOnGround() {
    // TODO: Implement logic to determine if the game character is on the ground based on its position and the ground height.
    return true
  }

  jump = () => {
    if (this.#isGameCharacterOnGround()) {
      this.#gameCharacter.jump()
    }
  }
}
