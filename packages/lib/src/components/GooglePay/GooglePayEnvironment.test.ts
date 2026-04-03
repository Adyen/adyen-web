import AdyenCheckout from '../../core/core';
import GooglePay from './GooglePay';
import GooglePayService from './GooglePayService';
import Analytics from '../../core/Analytics';
import type { CoreConfiguration } from '../../core/types';

let getGooglePaymentsClientSpy: jest.SpyInstance;
let analyticsSetupSpy: jest.SpyInstance;

beforeEach(() => {
    getGooglePaymentsClientSpy = jest
        .spyOn(GooglePayService.prototype, 'getGooglePaymentsClient')
        .mockResolvedValue({} as google.payments.api.PaymentsClient);

    analyticsSetupSpy = jest.spyOn(Analytics.prototype, 'setUp').mockResolvedValue();
});

afterEach(() => {
    getGooglePaymentsClientSpy.mockRestore();
    analyticsSetupSpy.mockRestore();
});

// we are creating the full setup here since both manipulate the environment resolution logic
async function createCheckoutWithGooglePay(environment: CoreConfiguration['environment']) {
    const clientKey = environment.toLowerCase().startsWith('test') ? 'test_123456' : 'live_123456';
    const checkout = new AdyenCheckout({
        environment: environment,
        clientKey,
        countryCode: 'US'
    });
    await checkout.initialize();

    return new GooglePay(checkout, {
        configuration: { merchantId: 'merchant-id', gatewayMerchantId: 'gateway-id' }
    });
}

describe('GooglePay environment resolution', () => {
    test.each([
        { env: 'live', expected: 'PRODUCTION', description: 'for "live" environment' },
        { env: 'test', expected: 'TEST', description: 'for "test" environment' },
        { env: 'live-au', expected: 'PRODUCTION', description: 'for regional live environments (e.g. "live-au")' },
        { env: 'live-uk', expected: 'PRODUCTION', description: 'for unrecognized environment strings' },
        { env: 'TEST', expected: 'TEST', description: 'for case-insensitive environment values' }
    ])('should resolve to $expected $description', async ({ env, expected }) => {
        await createCheckoutWithGooglePay(env as CoreConfiguration['environment']);

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: expected }));
    });

    test('should resolve to PRODUCTION when using custom API environment URLs with a live environment', async () => {
        const checkout = new AdyenCheckout({
            environment: 'live',
            clientKey: 'live_123456',
            countryCode: 'US',
            _environmentUrls: {
                api: 'https://custom-checkout-live.adyen.com/checkoutshopper/'
            }
        });
        await checkout.initialize();

        new GooglePay(checkout, {
            configuration: { merchantId: 'merchant-id', gatewayMerchantId: 'gateway-id' }
        });

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'PRODUCTION' }));
    });

    test('should resolve to TEST when using custom API environment URLs with a test environment', async () => {
        const checkout = new AdyenCheckout({
            environment: 'test',
            clientKey: 'test_123456',
            countryCode: 'US',
            _environmentUrls: {
                api: 'https://custom-checkout-test.adyen.com/checkoutshopper/'
            }
        });
        await checkout.initialize();

        new GooglePay(checkout, {
            configuration: { merchantId: 'merchant-id', gatewayMerchantId: 'gateway-id' }
        });

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'TEST' }));
    });
});
