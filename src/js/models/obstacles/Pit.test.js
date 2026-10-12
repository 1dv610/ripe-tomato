import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'
import { Pit } from '@/models/obstacles/Pit.js'

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

describe('Pit', () => {
  const pit = new Pit(5, 2)

  it('collides with a tomato on the ground above it', () => {
    expect(pit.collidesWith(new Tomato(6))).toBe(true)
  })

  it('does not collide with a tomato on the ground beside it', () => {
    expect(pit.collidesWith(new Tomato(4.9))).toBe(false)
    expect(pit.collidesWith(new Tomato(7.1))).toBe(false)
  })

  it('does not collide with a tomato in the air above it', () => {
    expect(pit.collidesWith(airborneTomatoAt(6))).toBe(false)
  })
})
