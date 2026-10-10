import { Obstacle } from '@/models/obstacles/Obstacle.js'

/**
 * @typedef {import('@/models/Tomato.js').Tomato} Tomato
 */

/**
 * A hole in the ground. The tomato must not land in it.
 */
export class Pit extends Obstacle {
  /**
   * Determines whether the tomato is on the ground with its center above the pit.
   *
   * @param {Tomato} tomato The tomato to test.
   * @returns {boolean} True if the tomato falls into the pit, false otherwise.
   */
  collidesWith(tomato) {
    return tomato.isOnGround && tomato.x > this.x && tomato.x < this.x + this.width
  }
}
