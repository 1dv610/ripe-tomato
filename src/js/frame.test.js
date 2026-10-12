import { describe, expect, it } from 'vitest'
import { createFrame } from '@/frame.js'

/**
 * Creates a frame whose parts record their calls, in order, in a shared list.
 *
 * @returns {{ calls: Array<string | number>, frame: (deltaTimeMs: number) => void }} The call log and the frame.
 */
const setup = () => {
  const calls = []
  const frame = createFrame(
    { update: () => calls.push('input') },
    { update: (dt) => calls.push(dt) },
    { draw: () => calls.push('draw') }
  )
  return { calls, frame }
}

describe('createFrame', () => {
  it('gives the game the elapsed time in seconds', () => {
    const { calls, frame } = setup()

    frame(16)

    expect(calls[1]).toBeCloseTo(0.016)
  })

  it('applies input, then simulates, then draws', () => {
    const { calls, frame } = setup()

    frame(16)

    expect(calls).toEqual(['input', 0.016, 'draw'])
  })
})
