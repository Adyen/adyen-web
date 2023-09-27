import { resolveCDNEnvironment, resolveEnvironment } from './Environment';

describe('Resolving API environment', () => {
    test('should return the proper URL according to the environment type', () => {
        expect(resolveEnvironment('test')).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('TEST')).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('live')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('LIVE')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return environmentUrl if provided', () => {
        expect(resolveEnvironment('devl', 'http://localhost:8080/checkoutshopper/')).toBe('http://localhost:8080/checkoutshopper/');
        expect(resolveEnvironment('test', 'https://checkout-zeta.com/checkoutshopper/')).toBe('https://checkout-zeta.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not valid', () => {
        expect(resolveEnvironment('invalid-environment')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not provided', () => {
        // @ts-ignore It can happen that 'environment' property is not be passed by the merchant
        expect(resolveEnvironment()).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });
});

describe('Resolving CDN Environment', () => {
    test('should return the proper URL according to the environment type', () => {
        expect(resolveCDNEnvironment('beta')).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(resolveCDNEnvironment('BETA')).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(resolveCDNEnvironment('live')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(resolveCDNEnvironment('LIVE')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return environmentUrl if provided', () => {
        expect(resolveCDNEnvironment('devl', 'http://localhost:8080/checkoutshopper/')).toBe('http://localhost:8080/checkoutshopper/');
        expect(resolveCDNEnvironment('beta', 'https://testing-beta-cdn.com/')).toBe('https://testing-beta-cdn.com/');
    });

    test('should return the live environment URL if environment type is not valid', () => {
        expect(resolveCDNEnvironment('invalid-environment')).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not provided', () => {
        // @ts-ignore It can happen that 'environment' property is not be passed by the merchant
        expect(resolveCDNEnvironment()).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });
});
