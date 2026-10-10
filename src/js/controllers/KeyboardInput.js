/**
 * @typedef {'left' | 'right' | 'jump'} KeyAction
 */

/**
 * Maps lowercase `KeyboardEvent.key` values to the actions they trigger.
 *
 * @type {Map<string, KeyAction>}
 */
const KEY_ACTIONS = new Map([
  ['arrowleft', 'left'],
  ['a', 'left'],
  ['arrowright', 'right'],
  ['d', 'right'],
  [' ', 'jump'],
  ['arrowup', 'jump'],
  ['w', 'jump'],
])

/**
 * Buffers keyboard input between frames.
 *
 * Key events arrive whenever the browser sends them, between two frames. This
 * class only records what happened, so the controller can apply it at the
 * start of the next frame. It takes plain key names and has no dependency on
 * p5.
 */
export class KeyboardInput {
  /** @type {Set<KeyAction>} */
  #held = new Set()

  /** @type {boolean} */
  #jumpRequested = false

  /**
   * Records that a key was pressed. Repeated presses while the key is held,
   * such as the browser's auto-repeat, are ignored.
   *
   * @param {string} key The `KeyboardEvent.key` value, e.g. `'ArrowLeft'` or `' '`.
   */
  press = (key) => {
    const action = KEY_ACTIONS.get(key.toLowerCase())
    if (!action || this.#held.has(action)) {
      return
    }

    this.#held.add(action)
    if (action === 'jump') {
      this.#jumpRequested = true
    }
  }

  /**
   * Records that a key was released.
   *
   * @param {string} key The `KeyboardEvent.key` value.
   */
  release = (key) => {
    const action = KEY_ACTIONS.get(key.toLowerCase())
    if (action) {
      this.#held.delete(action)
    }
  }

  /**
   * Forgets every held key, e.g. when the window loses focus and no release
   * events will arrive.
   */
  reset = () => {
    this.#held.clear()
    this.#jumpRequested = false
  }

  /**
   * The direction the held keys point in. Holding left and right at the same
   * time cancels out.
   *
   * @returns {-1 | 0 | 1} -1 for left, 1 for right, 0 for neither.
   */
  get direction() {
    return /** @type {-1 | 0 | 1} */ (Number(this.#held.has('right')) - Number(this.#held.has('left')))
  }

  /**
   * Reports whether a jump was requested since the last call, and clears the
   * request, so that one key press gives exactly one jump.
   *
   * @returns {boolean} True if a jump was requested, false otherwise.
   */
  consumeJump = () => {
    const requested = this.#jumpRequested
    this.#jumpRequested = false
    return requested
  }
}
