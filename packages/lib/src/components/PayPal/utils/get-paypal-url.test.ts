import { getPaypalUrl } from './get-paypal-url';

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
