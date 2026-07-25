import { defineConfig, devices } from '@playwright/test'

const port = 4173
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './e2e/visual',
  testMatch: '**/*.spec.ts',
  // Omit {platform} so macOS + Linux CI share one baseline set.
  // Fixtures force light theme + reduce font AA noise; see maxDiffPixelRatio.
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Subpixel / OS font AA (darwin local vs ubuntu CI).
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx vite --config e2e/visual/fixtures/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
