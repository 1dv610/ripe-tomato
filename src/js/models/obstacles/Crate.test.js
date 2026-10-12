import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'
import { Crate } from '@/models/obstacles/Crate.js'

/**
 * Creates a tomato that has jumped and been advanced to its highest point.
 *
 * @param {number} x The x-coordinate of the tomato's center.
 * @returns {Tomato} The airborne tomato.
 */
const airborneTomatoAt = (x) => {
  const tomato = new Tomato(x)
  tomato.jump()
  for (let i = 0; i < 22; i++) {
    tomato.update(1 / 60)
  }
  return tomato
}

describe('Crate', () => {
  const crate = new Crate(5, 1, 1)

  it('collides with a tomato that runs into it', () => {
    expect(crate.collidesWith(new Tomato(4.7))).toBe(true)
  })

  it('does not collide with a tomato in front of it', () => {
    expect(crate.collidesWith(new Tomato(4.4))).toBe(false)
  })

  it('does not collide with a tomato jumping over it', () => {
    expect(crate.collidesWith(airborneTomatoAt(5.5))).toBe(false)
  })

  it('rejects a height that is not positive', () => {
    expect(() => new Crate(0, 1, 0)).toThrow(RangeError)
  })
})
