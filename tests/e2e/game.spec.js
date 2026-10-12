import { expect, test } from '@playwright/test'

// The game draws everything on a canvas, so there is no DOM to query for the tomato or the
// messages. These tests observe the game from the outside, the way a player does: by looking at
// the pixels. They know the colors the views use, but nothing about the code behind them.

/**
 * @typedef {object} Point
 * @property {number} x The x-coordinate, in canvas pixels.
 * @property {number} y The y-coordinate, in canvas pixels.
 */

/**
 * Finds the tomato by its red skin color and returns the center of the red pixels.
 *
 * @param {import('@playwright/test').Page} page The page with the game.
 * @returns {Promise<Point | null>} The tomato's center, or null if no tomato is visible.
 */
const findTomato = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      return null
    }
    // getImageData works in device pixels; divide by the density to get canvas pixels.
    const density = canvas.width / canvas.clientWidth
    const { data, width, height } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)

    let sumX = 0
    let sumY = 0
    let count = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        if (data[i] > 180 && data[i + 1] < 90 && data[i + 2] < 90) {
          sumX += x
          sumY += y
          count++
        }
      }
    }
    return count === 0 ? null : { x: sumX / count / density, y: sumY / count / density }
  })

/**
 * Whether the dark message banner, shown when the game is lost or won, covers the middle of the canvas.
 *
 * @param {import('@playwright/test').Page} page The page with the game.
 * @returns {Promise<boolean>} True if the banner is shown, false otherwise.
 */
const isBannerShown = (page) =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const density = canvas.width / canvas.clientWidth
    // A point at the left edge, halfway down: sky blue during play, darkened under the banner.
    const [red, green, blue] = canvas.getContext('2d').getImageData(4 * density, 200 * density, 1, 1).data
    return red + green + blue < 300
  })

/**
 * Opens the game and waits until the tomato has been drawn.
 *
 * @param {import('@playwright/test').Page} page The page to open the game in.
 * @returns {Promise<Point>} The tomato's starting position.
 */
const startGame = async (page) => {
  await page.goto('/')
  await expect.poll(() => findTomato(page)).not.toBeNull()
  return /** @type {Point} */ (await findTomato(page))
}

test('starts with the tomato on the ground at the left', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error))

  const tomato = await startGame(page)

  await expect(page.locator('canvas')).toHaveCount(1)
  // The camera puts the tomato's center 1 tomato (60 px) from the left and its bottom on the ground at y = 340.
  expect(tomato.x).toBeCloseTo(60, -1)
  expect(tomato.y).toBeCloseTo(310, -1)
  expect(errors).toEqual([])
})

test('jumps when Space is pressed', async ({ page }) => {
  const start = await startGame(page)

  await page.keyboard.press(' ')

  await expect.poll(async () => (await findTomato(page)).y).toBeLessThan(start.y - 30)
})

test('moves right while the right arrow is held', async ({ page }) => {
  const start = await startGame(page)

  await page.keyboard.down('ArrowRight')

  await expect.poll(async () => (await findTomato(page)).x).toBeGreaterThan(start.x + 60)
  await page.keyboard.up('ArrowRight')
})

test('does not scroll the page when Space or an arrow key is pressed', async ({ page }) => {
  // A viewport lower than the canvas makes the page scrollable, so a missing preventDefault would show.
  await page.setViewportSize({ width: 900, height: 300 })
  await startGame(page)

  await page.keyboard.press(' ')
  await page.keyboard.press('ArrowDown')

  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('jumps on a click on the canvas but not on a click beside it', async ({ page }) => {
  const start = await startGame(page)
  const box = await page.locator('canvas').boundingBox()

  await page.mouse.click(box.x + box.width / 2, box.y + box.height + 20)
  await page.waitForTimeout(300)
  expect((await findTomato(page)).y).toBeCloseTo(start.y, 0)

  await page.mouse.click(box.x + start.x, box.y + 50)
  await expect.poll(async () => (await findTomato(page)).y).toBeLessThan(start.y - 30)
})

test('stops moving when the window loses focus while a key is held', async ({ page }) => {
  await startGame(page)
  await page.keyboard.down('ArrowRight')
  await page.waitForTimeout(200)

  // A key released in another window never sends a keyup, so index.js resets the keyboard on blur.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  const stopped = await findTomato(page)
  await page.waitForTimeout(300)

  expect((await findTomato(page)).x).toBeCloseTo(stopped.x, -1)
  await page.keyboard.up('ArrowRight')
})

test('shows the banner after a crash and starts over on Space', async ({ page }) => {
  const start = await startGame(page)

  // The first crate stands a few tomatoes ahead, so running right without jumping hits it.
  await page.keyboard.down('ArrowRight')
  await expect.poll(() => isBannerShown(page), { timeout: 5000 }).toBe(true)
  await page.keyboard.up('ArrowRight')

  await page.keyboard.press(' ')

  await expect.poll(() => isBannerShown(page)).toBe(false)
  expect((await findTomato(page)).x).toBeCloseTo(start.x, -1)
})
