import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/cms', workers: 1, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5182', trace: 'retain-on-failure' },
  webServer: { command: 'npm run cms:dev', url: 'http://127.0.0.1:5182/cms', reuseExistingServer: true },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }, { name: 'mobile', use: { ...devices['Pixel 5'], channel: 'chrome' } }],
})
