import { describe, expect, it } from 'vitest'
import { Game } from '@/models/Game.js'
import { GameStatus } from '@/models/GameStatus.js'
import { createFirstLevel } from '@/models/levels.js'
import { Bird } from '@/models/obstacles/Bird.js'

/**
 * How far ahead of a crate or pit, in tomatoes, the scripted player jumps.
 *
 * @type {number}
 */
const JUMP_DISTANCE = 0.9

/**
 * How far ahead of a bird, in tomatoes, the scripted player waits for it to climb.
 *
 * @type {number}
 */
const WAIT_DISTANCE = 1.2

/**
 * The bird height, in tomatoes, at which the scripted player runs under it.
 *
 * @type {number}
 */
const SAFE_BIRD_Y = 2.2

/**
 * Plays one frame the way a careful player would: run right, jump in front of
 * crates and pits, and wait in front of a bird until it is high up.
 *
 * @param {Game} game The game to play.
 * @param {Map<Bird, number>} previousBirdY The y-coordinate of each bird in the previous frame.
 */
const playFrame = (game, previousBirdY) => {
  const { tomato } = game
  const ahead = game.obstacles.find((obstacle) => obstacle.x + obstacle.width > tomato.x - tomato.radius)
  let direction = 1

  if (ahead instanceof Bird) {
    const isBeforeBird = tomato.x + tomato.radius < ahead.x
    const rising = ahead.y > (previousBirdY.get(ahead) ?? ahead.y)
    previousBirdY.set(ahead, ahead.y)
    if (isBeforeBird && ahead.x - tomato.x < WAIT_DISTANCE && !(rising && ahead.y > SAFE_BIRD_Y)) {
      direction = 0
    }
  } else if (ahead && ahead.x - tomato.x < JUMP_DISTANCE) {
    game.jump()
  }

  game.steer(direction)
  game.update(1 / 60)
}

describe('createFirstLevel', () => {
  it('returns new obstacles on every call', () => {
    expect(createFirstLevel().obstacles[0]).not.toBe(createFirstLevel().obstacles[0])
  })

  it('can be completed by a careful player', () => {
    const game = new Game(createFirstLevel)
    const previousBirdY = new Map()

    for (let frame = 0; frame < 60 * 60 && !game.isOver; frame++) {
      playFrame(game, previousBirdY)
    }

    expect({ status: game.status, x: game.tomato.x }).toEqual({ status: GameStatus.WON, x: expect.any(Number) })
  })
})
