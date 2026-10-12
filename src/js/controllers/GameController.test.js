import { describe, expect, it, vi } from 'vitest'
import { GameController } from '@/controllers/GameController.js'
import { KeyboardInput } from '@/controllers/KeyboardInput.js'
import { PointerInput } from '@/controllers/PointerInput.js'

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
