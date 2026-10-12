import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'
import { Bird } from '@/models/obstacles/Bird.js'

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
