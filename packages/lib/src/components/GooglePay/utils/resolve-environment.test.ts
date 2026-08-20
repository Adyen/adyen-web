import isLocalhost from '../../../utils/isLocalhost';
import { resolveEnvironment, resolveEnvironmentForAcceleratedCheckout } from './resolve-environment';

jest.mock('../../../utils/isLocalhost');

const isLocalhostMock = jest.mocked(isLocalhost);

describe('resolveEnvironment()', () => {
    test('should return "TEST" when environment is "test"', () => {
        expect(resolveEnvironment('test')).toBe('TEST');
    });

    test('should return "TEST" when environment is "beta"', () => {
        expect(resolveEnvironment('beta')).toBe('TEST');
    });

    test('should return "PRODUCTION" when environment is "live"', () => {
        expect(resolveEnvironment('live')).toBe('PRODUCTION');
    });

    test('should return "PRODUCTION" for any unknown environment value', () => {
        expect(resolveEnvironment('something-else')).toBe('PRODUCTION');
    });

    test('should default to "PRODUCTION" when no environment is provided', () => {
        expect(resolveEnvironment()).toBe('PRODUCTION');
    });
});

describe('resolveEnvironmentForAcceleratedCheckout()', () => {
    beforeEach(() => {
        isLocalhostMock.mockReset();
    });

    test('should return "TEST" when environment is "test" and page is not running on localhost', () => {
        isLocalhostMock.mockReturnValue(false);
        expect(resolveEnvironmentForAcceleratedCheckout('test')).toBe('TEST');
    });

    test('should return "TEST" when environment is "beta" and page is not running on localhost', () => {
        isLocalhostMock.mockReturnValue(false);
        expect(resolveEnvironmentForAcceleratedCheckout('beta')).toBe('TEST');
    });

    test('should return "EMULATOR" when environment is "test" and page is running on localhost', () => {
        isLocalhostMock.mockReturnValue(true);
        expect(resolveEnvironmentForAcceleratedCheckout('test')).toBe('EMULATOR');
    });

    test('should return "EMULATOR" when environment is "beta" and page is running on localhost', () => {
        isLocalhostMock.mockReturnValue(true);
        expect(resolveEnvironmentForAcceleratedCheckout('beta')).toBe('EMULATOR');
    });

    test('should return "PRODUCTION" when environment is "live"', () => {
        expect(resolveEnvironmentForAcceleratedCheckout('live')).toBe('PRODUCTION');
    });

    test('should return "PRODUCTION" for any unknown environment value', () => {
        expect(resolveEnvironmentForAcceleratedCheckout('something-else')).toBe('PRODUCTION');
    });

    test('should default to "PRODUCTION" when no environment is provided', () => {
        expect(resolveEnvironmentForAcceleratedCheckout()).toBe('PRODUCTION');
    });

    test('should not check for localhost when resolving to "PRODUCTION"', () => {
        resolveEnvironmentForAcceleratedCheckout('live');
        expect(isLocalhostMock).not.toHaveBeenCalled();
    });
});
