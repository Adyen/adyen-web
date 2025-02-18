import { resolveSupportedVersion } from './resolve-supported-version';

describe('resolveSupportedVersion', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'ApplePaySession', {
            value: {
                supportsVersion: null
            }
        });
    });

    test('should return supported version if ApplePaySession is available', () => {
        // @ts-ignore Mocking 'supportsVersion'
        window.ApplePaySession.supportsVersion = jest.fn().mockImplementation((version: number) => {
            return version === 10;
        });

        const version = resolveSupportedVersion(14);
        expect(version).toBe(10);
    });

    test('should return null if ApplePaySession is not available', () => {
        // @ts-ignore Mocking 'supportsVersion'
        window.ApplePaySession.supportsVersion = null;

        const version = resolveSupportedVersion(14);
        expect(version).toBeNull();
    });
});
