import { beforeEach, describe, expect, it } from 'vitest'
import { KeyboardInput } from '@/controllers/KeyboardInput.js'

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
