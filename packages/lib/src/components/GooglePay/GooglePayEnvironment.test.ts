import AdyenCheckout from '../../core/core';
import GooglePay from './GooglePay';
import GooglePayService from './GooglePayService';
import Analytics from '../../core/Analytics';
import type { CoreConfiguration } from '../../core/types';

jest.mock('../../core/Services/get-translations');

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
    test('should resolve to PRODUCTION for "live" environment', async () => {
        await createCheckoutWithGooglePay('live');

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'PRODUCTION' }));
    });

    test('should resolve to TEST for "test" environment', async () => {
        await createCheckoutWithGooglePay('test');

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'TEST' }));
    });

    test('should resolve to PRODUCTION for regional live environments (e.g. "live-au")', async () => {
        await createCheckoutWithGooglePay('live-au');

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'PRODUCTION' }));
    });

    test('should resolve to PRODUCTION for unrecognized environment strings', async () => {
        await createCheckoutWithGooglePay('live-uk' as CoreConfiguration['environment']);

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'PRODUCTION' }));
    });

    test('should handle environment values case-insensitively', async () => {
        await createCheckoutWithGooglePay('TEST' as CoreConfiguration['environment']);

        expect(getGooglePaymentsClientSpy).toHaveBeenCalledWith(expect.objectContaining({ environment: 'TEST' }));
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
