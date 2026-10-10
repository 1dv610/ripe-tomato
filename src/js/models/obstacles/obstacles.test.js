import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'
import { Bird } from '@/models/obstacles/Bird.js'
import { Crate } from '@/models/obstacles/Crate.js'
import { Obstacle } from '@/models/obstacles/Obstacle.js'
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

describe('Obstacle', () => {
  it('cannot be instantiated directly', () => {
    expect(() => new Obstacle(0, 1)).toThrow(TypeError)
  })

  it('requires subclasses to implement collidesWith', () => {
    class Incomplete extends Obstacle {}

    expect(() => new Incomplete(0, 1).collidesWith(new Tomato(0))).toThrow('Incomplete must implement collidesWith().')
  })

  it('rejects a width that is not positive', () => {
    expect(() => new Pit(0, 0)).toThrow(RangeError)
  })
})

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

describe('Bird', () => {
  it('starts at its base height and moves along a sine curve', () => {
    const bird = new Bird(5, 2, 1, 4)
    expect(bird.y).toBeCloseTo(2)

    bird.update(1)
    expect(bird.y).toBeCloseTo(3)

    bird.update(2)
    expect(bird.y).toBeCloseTo(1)
  })

  it('collides with a tomato only when it is low enough', () => {
    const bird = new Bird(5, 2, 1.5, 4)
    const tomato = new Tomato(5.4)
    expect(bird.collidesWith(tomato)).toBe(false)

    bird.update(3)
    expect(bird.collidesWith(tomato)).toBe(true)
  })

  it('rejects a period that is not positive', () => {
    expect(() => new Bird(0, 1, 1, 0)).toThrow(RangeError)
  })
})
