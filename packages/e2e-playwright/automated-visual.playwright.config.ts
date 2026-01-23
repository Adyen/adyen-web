import type { PlaywrightTestConfig } from '@playwright/test';
import defaultConfig from './playwright.config';

/**
 * Configuration specific for automated tests
 */
const config: PlaywrightTestConfig = {
    ...defaultConfig,
    // Only target the automated visual test directory
    testDir: './tests/automated/visual',
    testIgnore: [],
    projects: defaultConfig.projects?.filter(project => project.name === 'chromium'),
    webServer: [
        {
            command: 'yarn run build:storybook && yarn run start:prod-storybook',
            cwd: '../..',
            port: 3020,
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000
        }
    ]
};

export default config;
