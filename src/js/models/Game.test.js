import { describe, expect, it, vi } from 'vitest'
import { Game } from '@/models/Game.js'
import { GameStatus } from '@/models/GameStatus.js'
import { Crate } from '@/models/obstacles/Crate.js'

/**
 * Advances a game in steps of one 60th of a second.
 *
 * @param {Game} game The game to advance.
 * @param {number} seconds The total time, in seconds.
 */
const advance = (game, seconds) => {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    game.update(1 / 60)
  }
}

describe('Game', () => {
  it('starts playing with the tomato near the start of the level', () => {
    const game = new Game(() => ({ obstacles: [], finishX: 10 }))

    expect(game.status).toBe(GameStatus.PLAYING)
    expect(game.isOver).toBe(false)
    expect(game.tomato.x).toBeLessThan(2)
  })

  it('rejects a level factory that is not a function', () => {
    expect(() => new Game({ obstacles: [], finishX: 10 })).toThrow(TypeError)
  })

  it('is won when the tomato reaches the finish line', () => {
    const game = new Game(() => ({ obstacles: [], finishX: 3 }))
    game.steer(1)

    advance(game, 1)

    expect(game.status).toBe(GameStatus.WON)
  })

  it('is lost when the tomato collides with an obstacle', () => {
    const game = new Game(() => ({ obstacles: [new Crate(2, 1, 1)], finishX: 10 }))
    game.steer(1)

    advance(game, 1)

    expect(game.status).toBe(GameStatus.LOST)
  })

  it('ignores commands and time once the game is over', () => {
    const game = new Game(() => ({ obstacles: [new Crate(2, 1, 1)], finishX: 10 }))
    game.steer(1)
    advance(game, 1)
    const { x, y } = game.tomato

    game.jump()
    advance(game, 1)

    expect(game.tomato.x).toBe(x)
    expect(game.tomato.y).toBe(y)
  })

  it('starts over with a new level on restart', () => {
    const createLevel = vi.fn(() => ({ obstacles: [new Crate(2, 1, 1)], finishX: 10 }))
    const game = new Game(createLevel)
    const firstObstacles = game.obstacles
    game.steer(1)
    advance(game, 1)

    game.restart()

    expect(createLevel).toHaveBeenCalledTimes(2)
    expect(game.status).toBe(GameStatus.PLAYING)
    expect(game.tomato.x).toBeLessThan(2)
    expect(game.obstacles[0]).not.toBe(firstObstacles[0])
  })

  it('limits the length of a single time step', () => {
    const game = new Game(() => ({ obstacles: [new Crate(3, 0.2, 1)], finishX: 100 }))
    game.steer(1)

    // A whole second in one step would carry the tomato straight past the crate.
    game.update(1)

    expect(game.tomato.x).toBeLessThan(1.5)
    expect(game.status).toBe(GameStatus.PLAYING)
  })

  it('rejects a negative or non-finite time step', () => {
    const game = new Game(() => ({ obstacles: [], finishX: 10 }))

    expect(() => game.update(-1)).toThrow(RangeError)
    expect(() => game.update(Number.NaN)).toThrow(RangeError)
  })

  it('returns a copy of the obstacle list', () => {
    const game = new Game(() => ({ obstacles: [new Crate(2, 1, 1)], finishX: 10 }))

    game.obstacles.pop()

    expect(game.obstacles).toHaveLength(1)
  })
})
