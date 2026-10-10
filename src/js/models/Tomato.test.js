import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'

/**
 * Advances a tomato in equal steps.
 *
 * @param {Tomato} tomato The tomato to advance.
 * @param {number} seconds The total time, in seconds.
 * @param {number} [steps] The number of equal steps to split the time into.
 */
const advance = (tomato, seconds, steps = 1) => {
  for (let i = 0; i < steps; i++) {
    tomato.update(seconds / steps)
  }
}

describe('Tomato', () => {
  describe('constructor', () => {
    it('starts on the ground', () => {
      const tomato = new Tomato(2)

      expect(tomato.y).toBe(tomato.radius)
      expect(tomato.isOnGround).toBe(true)
    })

    it('rejects arguments that are not finite numbers', () => {
      expect(() => new Tomato(Number.NaN)).toThrow(TypeError)
      expect(() => new Tomato(1, Infinity)).toThrow(TypeError)
    })

    it('rejects a radius that is not positive', () => {
      expect(() => new Tomato(1, 0)).toThrow(RangeError)
    })
  })

  describe('steer', () => {
    it('moves right when steered right', () => {
      const tomato = new Tomato(2)
      tomato.steer(1)

      advance(tomato, 0.5)

      expect(tomato.x).toBeCloseTo(4)
    })

    it('moves the same distance regardless of frame rate', () => {
      const slow = new Tomato(2)
      const fast = new Tomato(2)
      slow.steer(1)
      fast.steer(1)

      advance(slow, 1, 30)
      advance(fast, 1, 60)

      expect(fast.x).toBeCloseTo(slow.x)
    })

    it('stops at the left edge of the world', () => {
      const tomato = new Tomato(1)
      tomato.steer(-1)

      advance(tomato, 1)

      expect(tomato.x).toBe(tomato.radius)
    })

    it('rejects a direction other than -1, 0 or 1', () => {
      const tomato = new Tomato(1)

      expect(() => tomato.steer(2)).toThrow(RangeError)
      expect(() => tomato.steer(0.5)).toThrow(RangeError)
    })
  })

  describe('jump', () => {
    it('leaves the ground and lands again', () => {
      const tomato = new Tomato(1)
      tomato.jump()

      advance(tomato, 0.2, 12)
      expect(tomato.isOnGround).toBe(false)

      advance(tomato, 1, 60)
      expect(tomato.isOnGround).toBe(true)
      expect(tomato.y).toBe(tomato.radius)
    })

    it('ignores a second jump while airborne', () => {
      const once = new Tomato(1)
      const twice = new Tomato(1)
      once.jump()
      twice.jump()
      advance(once, 0.2, 12)
      advance(twice, 0.2, 12)

      twice.jump()
      advance(once, 0.2, 12)
      advance(twice, 0.2, 12)

      expect(twice.y).toBeCloseTo(once.y)
    })

    it('lifts the bottom of the tomato just over three tomatoes', () => {
      const tomato = new Tomato(1)
      tomato.jump()

      let highest = 0
      for (let i = 0; i < 60; i++) {
        tomato.update(1 / 120)
        highest = Math.max(highest, tomato.y - tomato.radius)
      }

      // v² / 2g ≈ 3.27; stepping the simulation lands slightly below the exact apex.
      expect(highest).toBeCloseTo(3.2, 1)
    })
  })
})
