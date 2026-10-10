import { describe, expect, it } from 'vitest'
import { circleIntersectsRect, clamp } from '@/models/geometry.js'

describe('clamp', () => {
  it('keeps a value inside the range unchanged', () => {
    expect(clamp(2, 1, 3)).toBe(2)
  })

  it('moves a value outside the range to the nearest bound', () => {
    expect(clamp(0, 1, 3)).toBe(1)
    expect(clamp(4, 1, 3)).toBe(3)
  })
})

describe('circleIntersectsRect', () => {
  const rect = { left: 0, bottom: 0, width: 2, height: 1 }

  it('detects a circle whose center is inside the rectangle', () => {
    expect(circleIntersectsRect({ x: 1, y: 0.5, radius: 0.1 }, rect)).toBe(true)
  })

  it('detects a circle overlapping an edge', () => {
    expect(circleIntersectsRect({ x: -0.4, y: 0.5, radius: 0.5 }, rect)).toBe(true)
  })

  it('ignores a circle that only touches an edge', () => {
    expect(circleIntersectsRect({ x: -0.5, y: 0.5, radius: 0.5 }, rect)).toBe(false)
  })

  it('ignores a circle diagonally outside a corner, even when its bounding box overlaps', () => {
    expect(circleIntersectsRect({ x: 2.4, y: 1.4, radius: 0.5 }, rect)).toBe(false)
  })

  it('detects a circle overlapping a corner', () => {
    expect(circleIntersectsRect({ x: 2.3, y: 1.3, radius: 0.5 }, rect)).toBe(true)
  })
})
