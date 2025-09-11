import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { protocol } from './environment-variables';

dotenv.config({ path: path.resolve('../../', '.env') });

const playgroundBaseUrl = `${protocol}://localhost:3020`;

/**
 * Configuration specific for automated accessibility tests
 */
const config: PlaywrightTestConfig = {
    // Only target the automated-a11y test directory
    testDir: './tests/automated-a11y',
    /* Maximum time one test can run for. */
    timeout: 60 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         */
        timeout: 10000
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,
    /* Opt out of parallel tests on CI. Use default locally */
    workers: process.env.CI ? 4 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['html', { open: 'never' }], ['list']],

    /* Shared settings for all the projects below. */
    use: {
        actionTimeout: 30000,
        baseURL: playgroundBaseUrl,
        trace: 'on-first-retry',
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome']
            }
        },

        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox']
            }
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari']
            }
        }
    ],

    /* Run your local dev server before starting the tests */
    webServer: [
        {
            command: 'npm run build:storybook:e2e && npm run start:prod-storybook',
            cwd: '../..',
            port: 3020,
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000
        }
    ]
};

export default config;
