import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/cms', workers: 1, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5192', trace: 'retain-on-failure' },
  webServer: { command: 'npm run cms:dev', url: 'http://127.0.0.1:5192/cms', reuseExistingServer: false, env: {CMS_DEMO_API_PORT:'8792',CMS_DEMO_FRONTEND_PORT:'5192',CMS_DEMO_DATA_DIR:'.cms-data/browser-tests'} },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }, { name: 'mobile', use: { ...devices['Pixel 5'], channel: 'chrome' } }],
})
