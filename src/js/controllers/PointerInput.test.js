import { describe, expect, it } from 'vitest'
import { PointerInput } from '@/controllers/PointerInput.js'

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
