import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/e2e',testMatch:'sanity.spec.js',
  webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5191 --strictPort',url:'http://127.0.0.1:5191',reuseExistingServer:false},
  use:{baseURL:'http://127.0.0.1:5191',trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome'],channel:'chrome'}},{name:'mobile',use:{...devices['Pixel 5'],channel:'chrome'}}],
})
