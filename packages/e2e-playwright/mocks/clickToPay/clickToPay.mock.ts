import type { Page } from '@playwright/test';
import { recognizedShopperSrcProfile } from './clickToPay.data';

// Matches both the sandbox and the live scheme SDK URLs
const MASTERCARD_SDK_URL = '**/sdk/srcsdk.mastercard.js';
const VISA_SDK_URL = '**/src-i-adapter/visa-sdk.js*';

type ClickToPayMockOptions = {
    /**
     * When true, the Mastercard SDK recognizes the shopper on this device and returns one stored card.
     * When false, no scheme recognizes the shopper and the identity lookup finds no account, so
     * Click to Pay ends up 'NotAvailable' and the Card renders the manual entry form.
     */
    recognized: boolean;
};

/**
 * ClickToPayProvider reads the service state on its first render and subscribes to changes in an effect.
 * A state change in between is lost, leaving the loader on screen. The real scheme SDKs take long enough
 * that this never happens, so the fake 'init' waits until the loader is rendered and Preact's effects
 * (flushed after the next animation frame) have run.
 */
const WAIT_FOR_CLICK_TO_PAY_LOADER = `
const waitForClickToPayLoader = () => new Promise(resolve => {
    const flushEffects = () => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve)));
    const isLoaderRendered = () => !!document.querySelector('.adyen-checkout-ctp__loading-subtitle');
    if (isLoaderRendered()) return flushEffects();
    const observer = new MutationObserver(() => {
        if (!isLoaderRendered()) return;
        observer.disconnect();
        flushEffects();
    });
    observer.observe(document.body, { childList: true, subtree: true });
});`;

/**
 * The script bodies run in the browser, so they are plain JavaScript with the data inlined as JSON.
 */
const createSchemeSdkMethods = (recognized: boolean): string => `{
    init: () => waitForClickToPayLoader(),
    isRecognized: () => Promise.resolve(${recognized ? "{ recognized: true, idTokens: ['mock-id-token'] }" : '{ recognized: false }'}),
    identityLookup: () => Promise.resolve({ consumerPresent: false }),
    initiateIdentityValidation: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
    completeIdentityValidation: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
    getSrcProfile: () => Promise.resolve(${JSON.stringify(recognizedShopperSrcProfile)}),
    checkout: () => Promise.reject({ reason: 'NOT_SUPPORTED_BY_MOCK' }),
    unbindAppInstance: () => Promise.resolve()
}`;

/**
 * Replaces the Mastercard and Visa Click to Pay SDKs with deterministic fakes, so the shopper
 * recognition state does not depend on the scheme sandboxes or on cookies.
 */
const clickToPaySdksMock = async (page: Page, { recognized }: ClickToPayMockOptions): Promise<void> => {
    await page.route(MASTERCARD_SDK_URL, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `(() => {${WAIT_FOR_CLICK_TO_PAY_LOADER}
window.SRCSDK_MASTERCARD = ${createSchemeSdkMethods(recognized)};
})();`
        })
    );

    // Recognition is only simulated through Mastercard; Visa never recognizes the shopper
    await page.route(VISA_SDK_URL, route =>
        route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `(() => {${WAIT_FOR_CLICK_TO_PAY_LOADER}
window.vAdapters = { VisaSRCI: function () { return ${createSchemeSdkMethods(false)}; } };
})();`
        })
    );
};

export { clickToPaySdksMock };
