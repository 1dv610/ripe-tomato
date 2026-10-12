import { describe, expect, it } from 'vitest'
import { GameController } from '@/controllers/GameController.js'
import { KeyboardInput } from '@/controllers/KeyboardInput.js'
import { PointerInput } from '@/controllers/PointerInput.js'
import { createFrame } from '@/frame.js'
import { Game } from '@/models/Game.js'
import { GameStatus } from '@/models/GameStatus.js'
import { Crate } from '@/models/obstacles/Crate.js'
import { Camera } from '@/views/Camera.js'

// The unit tests of GameController use a fake game and a fake camera. These tests use the real
// ones, so they fail if the controller and the model stop agreeing on the commands and state
// between them, which the fakes can't detect.

/**
 * Wires the real controller, game and camera together the way index.js does, without p5.
 *
 * @param {import('@/models/obstacles/Obstacle.js').Obstacle[]} [obstacles] The obstacles in the level.
 * @returns {object} The game, its inputs, and a function that runs one frame of the loop.
 */
const setup = (obstacles = []) => {
  const game = new Game(() => ({ obstacles: [...obstacles], finishX: 100 }))
  const camera = new Camera(400)
  const keyboard = new KeyboardInput()
  const pointer = new PointerInput()
  const controller = new GameController(game, camera, keyboard, pointer)
  // The real loop, without a view: drawing only reads the game, and these tests read it directly.
  const runFrame = createFrame(controller, game, { draw: () => {} })

  /**
   * Runs one frame of the loop, a 60th of a second long.
   */
  const frame = () => {
    runFrame(1000 / 60)
  }

  return { game, camera, keyboard, pointer, frame }
}

describe('Input reaching the game', () => {
  it('makes the tomato leave the ground on a key press', () => {
    const { game, keyboard, frame } = setup()

    keyboard.press(' ')
    for (let i = 0; i < 10; i++) {
      frame()
    }

    expect(game.tomato.y).toBeGreaterThan(0)
  })

  it('moves the tomato toward a mouse button held to its right', () => {
    const { game, camera, pointer, frame } = setup()
    const startX = game.tomato.x
    const { x, y } = camera.worldToCanvas(startX + 3, 0)

    pointer.press(x, y)
    for (let i = 0; i < 10; i++) {
      frame()
    }

    expect(game.tomato.x).toBeGreaterThan(startX)
  })

  it('starts over on a key press after the tomato has hit an obstacle', () => {
    const { game, keyboard, frame } = setup([new Crate(2, 1, 1)])
    const startX = game.tomato.x

    keyboard.press('ArrowRight')
    for (let i = 0; i < 60 && !game.isOver; i++) {
      frame()
    }
    expect(game.status).toBe(GameStatus.LOST)

    keyboard.release('ArrowRight')
    keyboard.press(' ')
    frame()

    expect(game.status).toBe(GameStatus.PLAYING)
    expect(game.tomato.x).toBe(startX)
  })
})
