import { describe, expect, it, vi } from 'vitest'
import { Crate } from '@/models/obstacles/Crate.js'
import { Obstacle } from '@/models/obstacles/Obstacle.js'
import { Camera } from '@/views/Camera.js'
import { ObstacleView } from '@/views/ObstacleView.js'

/**
 * Creates a stand-in for a p5 instance where every drawing function is a mock.
 *
 * @returns {object} The mocked p5 instance.
 */
const mockP5 = () => {
  const mocks = { width: 800, height: 400 }
  return new Proxy(mocks, { get: (target, name) => (target[name] ??= vi.fn()) })
}

describe('ObstacleView', () => {
  it('draws a crate as a box at its position', () => {
    const p = mockP5()
    const view = new ObstacleView(p, new Camera(400))

    view.draw(new Crate(2, 1, 1))

    expect(p.rect).toHaveBeenCalledWith(120, 280, 60, 60)
  })

  it('fails loudly for an obstacle without a renderer', () => {
    class Unknown extends Obstacle {}
    const view = new ObstacleView(mockP5(), new Camera(400))

    expect(() => view.draw(new Unknown(0, 1))).toThrow('No renderer for Unknown.')
  })
})
