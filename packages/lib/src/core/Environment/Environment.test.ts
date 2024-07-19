import { resolveEnvironments } from './Environment';

describe('Environments', () => {
    test('should return proper URLs for the "test" environment', () => {
        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments('test');

        expect(apiUrl).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(analyticsUrl).toBe('https://checkoutanalytics-test.adyen.com/checkoutanalytics/');
        expect(cdnImagesUrl).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(cdnTranslationsUrl).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
    });

    test('should return proper URLs for the "test" environment even passing upper case string', () => {
        // @ts-ignore Passing uppercase value is expected here
        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments('TEST');

        expect(apiUrl).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(analyticsUrl).toBe('https://checkoutanalytics-test.adyen.com/checkoutanalytics/');
        expect(cdnImagesUrl).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(cdnTranslationsUrl).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
    });

    test('should customize the URLs in case they are provided', () => {
        const environmentUrls = {
            api: 'https://checkoutshopper-beta.adyen.com/',
            cdn: {
                translations: '/',
                images: 'https://cd91238.cdn.adyen.com/'
            }
        };

        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments('test', environmentUrls);

        expect(apiUrl).toBe('https://checkoutshopper-beta.adyen.com/');
        expect(analyticsUrl).toBe('https://checkoutanalytics-test.adyen.com/checkoutanalytics/');
        expect(cdnImagesUrl).toBe('https://cd91238.cdn.adyen.com/');
        expect(cdnTranslationsUrl).toBe('/');
    });

    test('should return the live environment URL if environment type is not valid', () => {
        // @ts-ignore Using invalid valid is intentional here
        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments('live-uk');

        expect(apiUrl).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(analyticsUrl).toBe('https://checkoutanalytics-live.adyen.com/checkoutanalytics/');
        expect(cdnImagesUrl).toBe('https://checkoutshopper-live.cdn.adyen.com/checkoutshopper/');
        expect(cdnTranslationsUrl).toBe('https://checkoutshopper-live.cdn.adyen.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not provided', () => {
        // @ts-ignore Testing not passing valid environment
        const { apiUrl, analyticsUrl, cdnImagesUrl, cdnTranslationsUrl } = resolveEnvironments();

        expect(apiUrl).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(analyticsUrl).toBe('https://checkoutanalytics-live.adyen.com/checkoutanalytics/');
        expect(cdnImagesUrl).toBe('https://checkoutshopper-live.cdn.adyen.com/checkoutshopper/');
        expect(cdnTranslationsUrl).toBe('https://checkoutshopper-live.cdn.adyen.com/checkoutshopper/');
    });
});
