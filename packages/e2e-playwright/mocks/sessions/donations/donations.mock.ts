import { Page } from '@playwright/test';

// URL patterns use * wildcards to match dynamic session IDs
const DONATION_CAMPAIGNS_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/donationCampaigns?*';
const DONATIONS_URL = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/donations?*';

export const donationCampaignsMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(DONATION_CAMPAIGNS_URL, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockedResponse),
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    });
};

export const donationsMock = async (page: Page, mockedResponse: any): Promise<void> => {
    await page.route(DONATIONS_URL, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockedResponse),
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    });
};
