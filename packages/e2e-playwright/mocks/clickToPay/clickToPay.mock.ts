import type { Page } from '@playwright/test';
import { recognizedShopperSrcProfile } from './clickToPay.data';

// Matches both the sandbox and the live Mastercard SDK URLs
const MASTERCARD_SDK_URL = '**/sdk/srcsdk.mastercard.js';

interface ClickToPayMockOptions {
    /**
     * When true, the Mastercard SDK recognizes the shopper on this device and returns one stored card.
     * When false, Mastercard does not recognize the shopper and the identity lookup finds no account, so
     * Click to Pay ends up 'NotAvailable' and the Card renders the manual entry form.
     */
    recognized: boolean;
}

/**
 * Replaces the Mastercard Click to Pay SDK with a deterministic fake.
 * Playwright passes the mock data separately, without interpolating it into JavaScript source.
 */
const mastercardClickToPaySdkMock = async (page: Page, { recognized }: ClickToPayMockOptions): Promise<void> => {
    await page.addInitScript(
        ({ recognized, profile }) => {
            /**
             * Wait for the loader and Preact's effects before changing the service state,
             * so the provider has subscribed to state changes before initialization finishes.
             */
            const waitForClickToPayLoader = () =>
                new Promise<void>(resolve => {
                    const flushEffects = () => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve)));
                    const isLoaderRendered = () => !!document.querySelector('.adyen-checkout-ctp__loading-subtitle');
                    if (isLoaderRendered()) return flushEffects();
                    const observer = new MutationObserver(() => {
                        if (!isLoaderRendered()) return;
                        observer.disconnect();
                        flushEffects();
                    });
                    observer.observe(document.body, { childList: true, subtree: true });
                });

            Object.assign(window, {
                SRCSDK_MASTERCARD: {
                    init: () => waitForClickToPayLoader(),
                    isRecognized: () => Promise.resolve(recognized ? { recognized: true, idTokens: ['mock-id-token'] } : { recognized: false }),
                    identityLookup: () => Promise.resolve({ consumerPresent: false }),
                    initiateIdentityValidation: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
                    completeIdentityValidation: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
                    getSrcProfile: () => Promise.resolve(profile),
                    checkout: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
                    unbindAppInstance: () => Promise.resolve()
                }
            });
        },
        { recognized, profile: recognizedShopperSrcProfile }
    );

    await page.route(MASTERCARD_SDK_URL, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: ''
        })
    );
};

export { mastercardClickToPaySdkMock };
