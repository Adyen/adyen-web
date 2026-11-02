import type { PlaywrightTestConfig } from '@playwright/test';
import defaultConfig, { STORYBOOK_PORT } from './playwright.config';

/**
 * Runs the same suite as the default config, but against the dist Storybook build. It
 * renders the built library (`dist/es`) instead of Vite-compiled source. That is the bundle
 * merchants install, so this target catches build-only regressions, plus missing public
 * exports, since stories import the package the way a merchant does.
 */
const config: PlaywrightTestConfig = {
    ...defaultConfig,
    webServer: [
        {
            command: process.env.SKIP_LIB_BUILD
                ? 'yarn build:storybook:e2e:dist && yarn start:prod-storybook'
                : 'yarn build && yarn build:storybook:e2e:dist && yarn start:prod-storybook',
            cwd: '../..',
            port: STORYBOOK_PORT,
            reuseExistingServer: !process.env.CI,
            timeout: 900_000
        }
    ]
};

export default config;
