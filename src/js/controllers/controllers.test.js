import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameController } from '@/controllers/GameController.js'
import { KeyboardInput } from '@/controllers/KeyboardInput.js'
import { PointerInput } from '@/controllers/PointerInput.js'

describe('KeyboardInput', () => {
  /** @type {KeyboardInput} */
  let keyboard

  beforeEach(() => {
    keyboard = new KeyboardInput()
  })

  it('maps arrow keys and letters to a direction', () => {
    keyboard.press('ArrowRight')
    expect(keyboard.direction).toBe(1)

    keyboard.release('ArrowRight')
    keyboard.press('A')
    expect(keyboard.direction).toBe(-1)
  })

  it('cancels out when left and right are both held', () => {
    keyboard.press('ArrowLeft')
    keyboard.press('d')

    expect(keyboard.direction).toBe(0)
  })

  it('gives exactly one jump per key press', () => {
    keyboard.press(' ')

    expect(keyboard.consumeJump()).toBe(true)
    expect(keyboard.consumeJump()).toBe(false)
  })

  it('ignores auto-repeat while a key is held', () => {
    keyboard.press('ArrowUp')
    keyboard.consumeJump()

    keyboard.press('ArrowUp')

    expect(keyboard.consumeJump()).toBe(false)
  })

  it('jumps again after the key has been released', () => {
    keyboard.press('w')
    keyboard.consumeJump()
    keyboard.release('w')

    keyboard.press('w')

    expect(keyboard.consumeJump()).toBe(true)
  })

  it('ignores keys without an action', () => {
    keyboard.press('Enter')
    keyboard.release('Enter')

    expect(keyboard.direction).toBe(0)
    expect(keyboard.consumeJump()).toBe(false)
  })

  it('forgets held keys on reset', () => {
    keyboard.press('ArrowRight')
    keyboard.press(' ')

    keyboard.reset()

    expect(keyboard.direction).toBe(0)
    expect(keyboard.consumeJump()).toBe(false)
  })
})

describe('PointerInput', () => {
  it('records the position and one press per click', () => {
    const pointer = new PointerInput()

    pointer.press(10, 20)

    expect(pointer.isDown).toBe(true)
    expect({ x: pointer.x, y: pointer.y }).toEqual({ x: 10, y: 20 })
    expect(pointer.consumePress()).toBe(true)
    expect(pointer.consumePress()).toBe(false)
  })

  it('follows the pointer while the button is held, and lets go on release', () => {
    const pointer = new PointerInput()
    pointer.press(10, 20)

    pointer.move(30, 40)
    expect({ x: pointer.x, y: pointer.y }).toEqual({ x: 30, y: 40 })

    pointer.release()
    expect(pointer.isDown).toBe(false)
  })
})

describe('GameController', () => {
  /**
   * Creates a controller with a fake game and a camera where one pixel is one tomato.
   *
   * @param {object} [options] The state of the fake game.
   * @param {boolean} [options.isOver] Whether the game is over.
   * @returns {object} The controller, its fakes and its inputs.
   */
  const setup = ({ isOver = false } = {}) => {
    const game = { isOver, tomato: { x: 5 }, jump: vi.fn(), steer: vi.fn(), restart: vi.fn() }
    const camera = { canvasToWorld: (x, y) => ({ x, y }) }
    const keyboard = new KeyboardInput()
    const pointer = new PointerInput()
    const controller = new GameController(game, camera, keyboard, pointer)

    return { controller, game, keyboard, pointer }
  }

  it('makes the tomato jump on a key press', () => {
    const { controller, game, keyboard } = setup()
    keyboard.press(' ')

    controller.update()

    expect(game.jump).toHaveBeenCalledOnce()
  })

  it('makes the tomato jump on a click', () => {
    const { controller, game, pointer } = setup()
    pointer.press(5, 0)

    controller.update()

    expect(game.jump).toHaveBeenCalledOnce()
  })

  it('jumps once even if key and click arrive in the same frame', () => {
    const { controller, game, keyboard, pointer } = setup()
    keyboard.press(' ')
    pointer.press(5, 0)

    controller.update()
    controller.update()

    expect(game.jump).toHaveBeenCalledOnce()
  })

  it('restarts instead of jumping when the game is over', () => {
    const { controller, game, keyboard } = setup({ isOver: true })
    keyboard.press(' ')

    controller.update()

    expect(game.restart).toHaveBeenCalledOnce()
    expect(game.jump).not.toHaveBeenCalled()
  })

  it('steers with the keyboard', () => {
    const { controller, game, keyboard } = setup()
    keyboard.press('ArrowLeft')

    controller.update()

    expect(game.steer).toHaveBeenLastCalledWith(-1)
  })

  it('steers toward a held mouse button', () => {
    const { controller, game, pointer } = setup()

    pointer.press(8, 0)
    controller.update()
    expect(game.steer).toHaveBeenLastCalledWith(1)

    pointer.move(2, 0)
    controller.update()
    expect(game.steer).toHaveBeenLastCalledWith(-1)
  })

  it('stands still when the mouse button is held right at the tomato', () => {
    const { controller, game, pointer } = setup()
    pointer.press(5.1, 0)

    controller.update()

    expect(game.steer).toHaveBeenLastCalledWith(0)
  })

  it('prefers the keyboard over the mouse', () => {
    const { controller, game, keyboard, pointer } = setup()
    pointer.press(8, 0)
    keyboard.press('ArrowLeft')

    controller.update()

    expect(game.steer).toHaveBeenLastCalledWith(-1)
  })
})
