import { isValidHttpUrl } from './isValidURL';

describe('isValidHttpUrl', () => {
    test('https url is valid', () => {
        expect(isValidHttpUrl('https://www.adyen.com')).toEqual(true);
    });
    test('http url is not valid', () => {
        expect(isValidHttpUrl('http://www.adyen.com')).toEqual(false);
    });
    test('http url is valid when config arg is passed', () => {
        expect(isValidHttpUrl('http://www.adyen.com', true)).toEqual(true);
    });
    test('url without https is not valid', () => {
        expect(isValidHttpUrl('www.adyen.com')).toEqual(false);
    });
    test('random string is not valid', () => {
        expect(isValidHttpUrl('blahblahblah')).toEqual(false);
    });
    test('empty string is not valid', () => {
        expect(isValidHttpUrl('')).toEqual(false);
    });
    test('should return false for a null url', () => {
        expect(isValidHttpUrl(null)).toEqual(false);
        expect(isValidHttpUrl(null, true)).toEqual(false);
    });
    test('should return false for an undefined url', () => {
        expect(isValidHttpUrl(undefined)).toEqual(false);
        expect(isValidHttpUrl(undefined, true)).toEqual(false);
    });
});
