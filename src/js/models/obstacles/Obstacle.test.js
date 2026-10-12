import { describe, expect, it } from 'vitest'
import { Tomato } from '@/models/Tomato.js'
import { Obstacle } from '@/models/obstacles/Obstacle.js'
import { Pit } from '@/models/obstacles/Pit.js'

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
