/**
 * @typedef {object} Circle
 * @property {number} x The x-coordinate of the circle's center, in tomatoes.
 * @property {number} y The y-coordinate of the circle's center, in tomatoes.
 * @property {number} radius The radius of the circle, in tomatoes.
 */

/**
 * @typedef {object} Rect
 * @property {number} left The x-coordinate of the rectangle's left edge, in tomatoes.
 * @property {number} bottom The y-coordinate of the rectangle's bottom edge, in tomatoes.
 * @property {number} width The width of the rectangle, in tomatoes.
 * @property {number} height The height of the rectangle, in tomatoes.
 */

/**
 * Restricts a value to the closed range `[min, max]`.
 *
 * @param {number} value The value to restrict.
 * @param {number} min The lower bound.
 * @param {number} max The upper bound.
 * @returns {number} The value, moved inside the range if it was outside.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Determines whether a circle and an axis-aligned rectangle overlap.
 *
 * Shapes that only touch at a single point or along an edge do not overlap.
 *
 * @param {Circle} circle The circle, in world space.
 * @param {Rect} rect The rectangle, in world space with the y-axis pointing up.
 * @returns {boolean} True if the shapes overlap, false otherwise.
 */
export const circleIntersectsRect = (circle, rect) => {
  const closestX = clamp(circle.x, rect.left, rect.left + rect.width)
  const closestY = clamp(circle.y, rect.bottom, rect.bottom + rect.height)
  const dx = circle.x - closestX
  const dy = circle.y - closestY

  return dx * dx + dy * dy < circle.radius * circle.radius
}
