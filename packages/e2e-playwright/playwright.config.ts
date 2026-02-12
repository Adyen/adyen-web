import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { protocol } from './environment-variables';

dotenv.config({ path: path.resolve('../../', '.env') });

export const WEB_SERVER_TIMEOUT_MS = 180_000;

export const STORYBOOK_PORT = 3020;
export const STORYBOOK_URL = `${protocol}://localhost:${STORYBOOK_PORT}`;

const snapshotPathTemplate = '{testDir}/{testFileDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}';

export const SCREENSHOT_CONFIG = {
    maxDiffPixels: 1_000,
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
    scale: 'device'
} as const;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './tests/',
    testMatch: '**/*.spec.ts',
    // Exclude the automated tests which run in a separate pipeline
    testIgnore: ['**/automated/**'],
    /* Maximum time one test can run for. */
    timeout: 60 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 30_000,
        toHaveScreenshot: {
            ...SCREENSHOT_CONFIG
        }
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. Use default locally */
    workers: process.env.CI ? 4 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['html', { open: 'never' }], ['list']],

    snapshotPathTemplate,

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 30_000,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: STORYBOOK_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
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

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',

    /* Run your local dev server before starting the tests */
    webServer: [
        {
            command: 'npm run build:storybook:e2e && npm run start:prod-storybook',
            cwd: '../..',
            port: STORYBOOK_PORT,
            reuseExistingServer: !process.env.CI,
            timeout: WEB_SERVER_TIMEOUT_MS
        }
    ]
};

export default config;
