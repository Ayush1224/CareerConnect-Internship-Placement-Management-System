import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(rootDir, 'backend');
const frontendUrl = 'http://127.0.0.1:5187';
const backendUrl = 'http://127.0.0.1:5089';
const e2eDatabaseName = 'careerconnect_e2e_test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  globalSetup: './e2e/globalSetup.js',
  globalTeardown: './e2e/globalTeardown.js',
  use: {
    baseURL: frontendUrl,
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'npm start',
      cwd: backendDir,
      url: `${backendUrl}/api/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        PORT: '5089',
        CLIENT_URL: frontendUrl,
        MONGO_DB_NAME: e2eDatabaseName,
        JWT_SECRET: 'careerconnect-e2e-only-secret-not-for-production',
        CLOUDINARY_CLOUD_NAME: '',
        CLOUDINARY_API_KEY: '',
        CLOUDINARY_API_SECRET: '',
        EMAIL_USER: '',
        EMAIL_PASS: '',
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: ''
      }
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5187 --strictPort',
      cwd: rootDir,
      url: frontendUrl,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        VITE_API_BASE_URL: backendUrl
      }
    }
  ]
});
