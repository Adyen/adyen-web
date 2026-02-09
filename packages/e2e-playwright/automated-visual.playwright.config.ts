import type { PlaywrightTestConfig } from '@playwright/test';
import defaultConfig, { WEB_SERVER_TIMEOUT, STORYBOOK_PORT } from './playwright.config';

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
            port: STORYBOOK_PORT,
            reuseExistingServer: !process.env.CI,
            timeout: WEB_SERVER_TIMEOUT
        }
    ]
};

export default config;
