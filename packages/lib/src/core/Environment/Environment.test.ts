import { resolveEnvironment } from './Environment';
import { API_ENVIRONMENTS, CDN_ENVIRONMENTS } from './constants';

describe('Resolving API environment', () => {
    test('should return the proper URL according to the environment type', () => {
        expect(resolveEnvironment('test', API_ENVIRONMENTS)).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('TEST', API_ENVIRONMENTS)).toBe('https://checkoutshopper-test.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('live', API_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('LIVE', API_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return environmentUrl if provided', () => {
        expect(resolveEnvironment('devl', API_ENVIRONMENTS, 'http://localhost:8080/checkoutshopper/')).toBe('http://localhost:8080/checkoutshopper/');
        expect(resolveEnvironment('test', API_ENVIRONMENTS, 'https://checkout-zeta.com/checkoutshopper/')).toBe(
            'https://checkout-zeta.com/checkoutshopper/'
        );
    });

    test('should return the live environment URL if environment type is not valid', () => {
        expect(resolveEnvironment('invalid-environment', API_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not provided', () => {
        // @ts-ignore It can happen that 'environment' property is not be passed by the merchant
        expect(resolveEnvironment(undefined, API_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });
});

describe('Resolving CDN Environment', () => {
    test('should return the proper URL according to the environment type', () => {
        expect(resolveEnvironment('beta', CDN_ENVIRONMENTS)).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('BETA', CDN_ENVIRONMENTS)).toBe('https://cdf6519016.cdn.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('live', CDN_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
        expect(resolveEnvironment('LIVE', CDN_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return environmentUrl if provided', () => {
        expect(resolveEnvironment('devl', CDN_ENVIRONMENTS, 'http://localhost:8080/checkoutshopper/')).toBe('http://localhost:8080/checkoutshopper/');
        expect(resolveEnvironment('beta', CDN_ENVIRONMENTS, 'https://testing-beta-cdn.com/')).toBe('https://testing-beta-cdn.com/');
    });

    test('should return the live environment URL if environment type is not valid', () => {
        expect(resolveEnvironment('invalid-environment', CDN_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });

    test('should return the live environment URL if environment type is not provided', () => {
        // @ts-ignore It can happen that 'environment' property is not be passed by the merchant
        expect(resolveEnvironment(undefined, CDN_ENVIRONMENTS)).toBe('https://checkoutshopper-live.adyen.com/checkoutshopper/');
    });
});
