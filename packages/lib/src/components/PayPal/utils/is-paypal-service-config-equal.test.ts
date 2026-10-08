import { isPayPalServiceConfigEqual } from './is-paypal-service-config-equal';
import type { PayPalServiceRefreshConfig } from '../services/PayPalService';
import type { PaymentAmount } from '../../../types/global-types';

const DEFAULT_AMOUNT: PaymentAmount = { value: 1000, currency: 'USD' };
const DEFAULT_COMPONENTS: PayPalServiceRefreshConfig['components'] = ['paypal-payments', 'venmo-payments'];

const createConfig = (overrides: Partial<PayPalServiceRefreshConfig> = {}): PayPalServiceRefreshConfig => ({
    loadingContext: 'https://checkoutshopper-test.adyen.com/checkoutshopper/',
    clientKey: 'test_client_key',
    merchantId: 'test_merchant',
    countryCode: 'US',
    amount: DEFAULT_AMOUNT,
    vault: false,
    locale: 'en-US',
    pageType: 'checkout',
    environment: 'test',
    components: DEFAULT_COMPONENTS,
    ...overrides
});

describe('isPayPalServiceConfigEqual', () => {
    test('should consider two configurations with the same values equal', () => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig())).toBe(true);
    });

    test('should not compare the amount and the components by reference', () => {
        const config = createConfig();
        const otherConfig = createConfig({
            amount: { ...DEFAULT_AMOUNT },
            components: [...DEFAULT_COMPONENTS]
        });

        expect(config.amount).not.toBe(otherConfig.amount);
        expect(config.components).not.toBe(otherConfig.components);
        expect(isPayPalServiceConfigEqual(config, otherConfig)).toBe(true);
    });

    test.each([
        ['loadingContext', { loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/' }],
        ['clientKey', { clientKey: 'live_client_key' }],
        ['merchantId', { merchantId: 'other_merchant' }],
        ['countryCode', { countryCode: 'GB' }],
        ['vault', { vault: true }],
        ['locale', { locale: 'en-GB' }],
        ['pageType', { pageType: 'product-details' as const }],
        ['environment', { environment: 'live' }]
    ])('should detect a change of %s', (_field, override) => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig(override))).toBe(false);
    });

    test('should detect a change of the amount currency', () => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig({ amount: { value: 1000, currency: 'GBP' } }))).toBe(false);
    });

    test('should detect a change of the amount value', () => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig({ amount: { value: 0, currency: 'USD' } }))).toBe(false);
    });

    test('should detect an amount being added or removed', () => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig({ amount: undefined }))).toBe(false);
        expect(isPayPalServiceConfigEqual(createConfig({ amount: undefined }), createConfig())).toBe(false);
    });

    test('should detect a component being added or removed', () => {
        expect(isPayPalServiceConfigEqual(createConfig(), createConfig({ components: ['paypal-payments'] }))).toBe(false);
        expect(
            isPayPalServiceConfigEqual(createConfig(), createConfig({ components: ['paypal-payments', 'venmo-payments', 'paypal-messages'] }))
        ).toBe(false);
    });

    test('should detect a component being replaced', () => {
        expect(isPayPalServiceConfigEqual(createConfig({ components: ['paypal-payments'] }), createConfig({ components: ['venmo-payments'] }))).toBe(
            false
        );
    });
});
