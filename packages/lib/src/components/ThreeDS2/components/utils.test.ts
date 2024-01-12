import { decodeAndParseToken, encodeObject, encodeBase64URL } from './utils';
import { ErrorObject } from '../../../core/Errors/types';
import { ThreeDS2Token } from '../types';
import { NOT_BASE64_ERROR } from '../../../utils/base64';

const encodedToken =
    'eyJ0aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uVVJMIjoiaHR0cHM6XC9cL2NoZWNrb3V0c2hvcHBlci10ZXN0LmFkeWVuLmNvbVwvY2hlY2tvdXRzaG9wcGVyXC90aHJlZURTTWV0aG9kTm90aWZpY2F0aW9uLnNodG1sP29yaWdpbktleT1wdWIudjIuODcxNDI4OTE0NTM2ODQ0NS5hSFIwY0RvdkwyeHZZMkZzYUc5emREb3pNREl3LmdRMUtpejZPTm1SNlBla0ZEZkZ0VUw0VW9YQkxxLVNfcEQtdUtnZ0UtOXMiLCJ0aHJlZURTTWV0aG9kVXJsIjoiaHR0cHM6XC9cL3BhbC10ZXN0LmFkeWVuLmNvbVwvdGhyZWVkczJzaW11bGF0b3JcL2Fjc1wvc3RhcnRNZXRob2Quc2h0bWwiLCJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjE1ZTQ4OTQyLWJlOGYtNDYxNy1iYTc1LWI1ODdlMzBlOTM2MiJ9';

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
