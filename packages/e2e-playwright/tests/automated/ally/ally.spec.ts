import { test, expect } from '../../../fixtures/base-fixture';
import fs from 'node:fs';
import { Automated } from '../../../models/automated';

// Config
// This is relative to playwright root: adyen-web/lib/e2e-playwright/
const STORYBOOK_INDEX_PATH = '../lib/storybook-static/index.json';

const EXCLUDED_STORIES: string[] = [
    'components-wallets-applepay--express', // Can't run Apple Pay in the e2e tests
    'components-wallets-applepay--default',
    'components-wallets-fastlane--lookup',
    'helpers-paypalreviewpage--paypal-review-page', // Unsure what needs to be done here
    'components-paybybankpix--merchant-page', // demo pages for pix
    'components-paybybankpix--hosted-page-enrollment',
    'components-paybybankpix--hosted-page-payment',
    'components-paybybankpix--simulate-issuer-page'
];

// These are the list of violations that are know for each expose component
// The key is the story id, this can be found in the test that is failing or in storybook
// The values in the violation array are the ID of the printed violation
const KNOWN_A11Y_VIOLATIONS = {
    'components-payto--default': ['aria-valid-attr-value'],
    'dropin-dropin-component--style-customization': ['color-contrast'], // Demo page
    'internal-elements-toggle--toggle-only': ['label'],
    'components-issuerlist-onlinebankingcz--default': ['link-in-text-block'], // TODO - the link style needs fixing
    'components-issuerlist-onlinebankingfi--default': ['link-in-text-block'], // TODO - the link style needs fixing
    'components-issuerlist-onlinebankingpl--default': ['link-in-text-block'], // TODO - the link style needs fixing
    'components-issuerlist-onlinebankingsk--default': ['link-in-text-block'] // TODO - the link style needs fixing
};

// types
interface StorybookIndex {
    v: number;
    entries: {
        [id: string]: {
            id: string;
            title: string;
            name: string;
            importPath: string;
            type: 'story' | 'docs';
            tags: string[];
        };
    };
}

let storyIds: string[] = [];

const rawData = fs.readFileSync(STORYBOOK_INDEX_PATH, { encoding: 'utf-8' });
const index = JSON.parse(rawData) as StorybookIndex;

const allEntries = Object.values(index.entries);

// Filter out non-story entries, docs, and explicitly excluded stories
storyIds = allEntries
    .filter(
        entry =>
            entry.type === 'story' && // Keep only actual stories
            !EXCLUDED_STORIES.includes(entry.id) // Exclude stories in the exclusion list
    )
    .map(entry => entry.id); // Extract the IDs

test.describe('Automated a11y testing', () => {
    // Dynamically generate tests for each story
    for (const storyId of storyIds) {
        const testTitle = `A11y Check: ${storyId.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

        test(testTitle, async ({ page }) => {
            const storyUrl = `/iframe.html?id=${storyId}&viewMode=story`;

            // Create tests model
            const automatedModel = new Automated(page);
            await automatedModel.goto(storyUrl);

            // get known violations id
            const knownViolations: string[] = KNOWN_A11Y_VIOLATIONS.hasOwnProperty(storyId) ? KNOWN_A11Y_VIOLATIONS[storyId] : [];

            const violations = await automatedModel.getA11yErrors(knownViolations);
            expect(
                violations,
                `Accessibility violations found on story: ${storyId} (${storyUrl}) \nViolations:\n ${JSON.stringify(violations, null, 2)}` // Include violations in error message
            ).toEqual([]);
        });
    }

    test('Ensure Storybook stories were loaded', () => {
        if (storyIds.length === 0) {
            test.info().annotations.push({
                type: 'warning',
                description: `No Storybook stories were found or loaded from /index.json. Check the URL and ensure Storybook is running. The fetch attempt might have failed.`
            });
        }
        expect(storyIds.length).toBeGreaterThan(0);
    });
});
