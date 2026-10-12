import { defineConfig, devices } from '@playwright/test'

// End-to-end tests run the built game in a real browser. They are the only tests that cover
// what index.js wires together: p5's event hooks, the draw loop and the browser itself.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // The game runs in real time, so a slow CI machine can occasionally miss a frame-based timing.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Test the production build, served the way `npm run serve` serves it.
  webServer: {
    command: 'npm run build && npm run serve -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
