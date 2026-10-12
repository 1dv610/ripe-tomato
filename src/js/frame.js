/**
 * Creates the function that runs one frame of the game loop. The order is the loop's whole
 * contract: apply the input buffered since the last frame, advance the simulation, render the
 * new state. Kept apart from index.js so the contract can be tested without p5.
 *
 * @param {{ update: () => void }} controller Applies the buffered input.
 * @param {{ update: (dt: number) => void }} game Advances the simulation, in seconds.
 * @param {{ draw: () => void }} view Renders the state.
 * @returns {(deltaTimeMs: number) => void} Runs one frame, given the time since the last one in milliseconds, as p5 reports it.
 */
export const createFrame = (controller, game, view) => (deltaTimeMs) => {
  controller.update()
  game.update(deltaTimeMs / 1000)
  view.draw()
}
