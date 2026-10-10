import { Bird } from '@/models/obstacles/Bird.js'
import { Crate } from '@/models/obstacles/Crate.js'
import { Pit } from '@/models/obstacles/Pit.js'

/**
 * @typedef {import('@/models/obstacles/Obstacle.js').Obstacle} Obstacle
 */

/**
 * @typedef {object} Level
 * @property {Obstacle[]} obstacles The obstacles in the level, in their initial state.
 * @property {number} finishX The x-coordinate the tomato must reach to win, in tomatoes.
 */

/**
 * Creates the first level. Every call returns new obstacles, so a restarted
 * game never shares state with the previous one.
 *
 * @returns {Level} The first level.
 */
export const createFirstLevel = () => ({
  finishX: 40,
  obstacles: [
    new Crate(6, 1, 1),
    new Pit(11, 2),
    new Crate(16, 1, 1.5),
    new Bird(21, 1.6, 0.9, 2),
    new Pit(26, 1.8),
    new Crate(30, 1, 1),
    new Bird(34, 1.5, 1, 1.6),
  ],
})
