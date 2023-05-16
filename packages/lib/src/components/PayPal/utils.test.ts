import { getStyle, getSupportedLocale, getPaypalUrl } from './utils';
describe('getStyle', () => {
    test('return the same styles for the regular PayPal button', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('paypal', style)).toEqual(style);
    });

    test('remove the unsupported color for PayPal Credit', () => {
        const style = { color: 'gold', height: 48 };
        expect(getStyle('credit', style)).toEqual({ height: 48 });
    });
});

describe('getSupportedLocale', () => {
    test('return the locale in the right format', () => {
        expect(getSupportedLocale('en-US')).toBe('en_US');
    });

    test('return null if the passed locale is not supported', () => {
        expect(getSupportedLocale('es_AR')).toBe(null);
    });
});

describe('getPaypalUrl', () => {
    test('return the url to be with messages component when enableMessages is undefined/false', () => {
        const props: any = {
            amount: { currency: 'USD', value: 100 },
            countryCode: 'US',
            environment: 'test',
            locale: 'en-US',
            configuration: {
                merchantId: 'fakeMerchant',
                intent: 'fakeIntents'
            }
        };
        const url = getPaypalUrl(props);
        const messagesComponent = url.split('&components=')[1];
        expect(messagesComponent).toBe('buttons,funding-eligibility');
    });

    test('return the url to be with messages component when all enableMessages is set to true', () => {
        const props: any = {
            amount: { currency: 'USD', value: 100 },
            countryCode: 'US',
            environment: 'test',
            locale: 'en-US',
            enableMessages: true,
            configuration: {
                merchantId: 'fakeMerchant',
                intent: 'fakeIntents'
            }
        };
        const url = getPaypalUrl(props);
        const messagesComponent = url.split('&components=')[1];
        expect(messagesComponent).toBe('buttons,funding-eligibility,messages');
    });
});
