import { describe, expect, it } from 'vitest'
import { Camera } from '@/views/Camera.js'

describe('Camera', () => {
  it('puts the start of the ground at the left edge, above the ground strip', () => {
    const camera = new Camera(400)

    expect(camera.worldToCanvas(0, 0)).toEqual({ x: 0, y: 340 })
    expect(camera.groundY).toBe(340)
  })

  it('flips the y-axis so that up in the world is up on the canvas', () => {
    const camera = new Camera(400)

    expect(camera.worldToCanvas(0, 1).y).toBeLessThan(camera.worldToCanvas(0, 0).y)
  })

  it('converts lengths to pixels', () => {
    expect(new Camera(400).toPixels(2)).toBe(120)
  })

  it('follows a position by keeping it at a fixed distance from the left edge', () => {
    const camera = new Camera(400)

    camera.follow(20)
    const first = camera.worldToCanvas(20, 0).x
    camera.follow(25)

    expect(camera.worldToCanvas(25, 0).x).toBeCloseTo(first)
  })

  it('never shows anything left of the start of the world', () => {
    const camera = new Camera(400)

    camera.follow(1)

    expect(camera.worldToCanvas(0, 0).x).toBe(0)
  })

  it('converts back from canvas to world space', () => {
    const camera = new Camera(400)
    camera.follow(17.3)

    const { x, y } = camera.worldToCanvas(19.5, 2.25)

    expect(camera.canvasToWorld(x, y).x).toBeCloseTo(19.5)
    expect(camera.canvasToWorld(x, y).y).toBeCloseTo(2.25)
  })

  it('rejects a canvas height that is not a positive integer above the ground strip', () => {
    expect(() => new Camera(Number.NaN)).toThrow(TypeError)
    expect(() => new Camera(400.5)).toThrow(RangeError)
    expect(() => new Camera(60)).toThrow(RangeError)
  })
})
