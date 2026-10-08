import { decodeAndParseToken, encodeObject, encodeBase64URL } from './utils';
import { ErrorObject } from '../../../core/Errors/types';
import { ThreeDS2Token } from '../types';
import { NOT_BASE64_ERROR } from '../../../utils/base64';

const tokenPayload = {
    threeDSMethodNotificationURL: 'mock-notification-url',
    threeDSMethodUrl: 'mock-method-url',
    threeDSServerTransID: 'mock-server-trans-id'
};

const encodedToken = btoa(JSON.stringify(tokenPayload));

describe('decodeAndParseToken', () => {
    test('should decode and parse a token', () => {
        const decodedToken = decodeAndParseToken(encodedToken);
        expect(decodedToken).toHaveProperty('threeDSMethodNotificationURL');
        expect(decodedToken).toHaveProperty('threeDSMethodUrl');
    });

    test('should return false if the token is incorrect', () => {
        const res: ThreeDS2Token | ErrorObject = decodeAndParseToken('124343434');
        expect((res as ErrorObject).success).toBe(false);
        expect((res as ErrorObject).error).toEqual(NOT_BASE64_ERROR);
    });
});

describe('encodeResult', () => {
    test('should throw if wrong parameters are passed', () => {
        expect(() => encodeObject(undefined)).toThrow();
    });

    test('should throw if no type is passed', () => {
        expect(() => encodeObject({})).toThrow();
    });

    test('should return a string if everything is passed correctly', () => {
        expect(typeof encodeObject({ threeDSCompInd: 'Y' })).toBe('string');
        expect(typeof encodeObject({ transStatus: 'Y' })).toBe('string');
    });
});

describe('base64 URL encoding', () => {
    test('encodes any URL', () => {
        expect(encodeBase64URL('https://www.adyen.com/our+solution/online+payments')).toBe(
            'aHR0cHM6Ly93d3cuYWR5ZW4uY29tL291citzb2x1dGlvbi9vbmxpbmUrcGF5bWVudHM'
        );
        expect(encodeBase64URL('https://www.adyen.com/our_solution//online_payments')).toBe(
            'aHR0cHM6Ly93d3cuYWR5ZW4uY29tL291cl9zb2x1dGlvbi8vb25saW5lX3BheW1lbnRz'
        );
        expect(encodeBase64URL('gibber      ish')).toBe('Z2liYmVyICAgICAgaXNo');
    });
});
